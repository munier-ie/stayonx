import { supabase } from './supabase';
import { ALL_BADGES, BadgeDefinition } from './badgeDefinitions';

export interface BadgeEvalResult {
  badge: BadgeDefinition;
  earned: boolean;
  progress: number; // 0-100
}

/**
 * Evaluate which badges a user has earned based on their stats
 * Can be called client-side to show progress, or server-side to award badges
 */
export async function evaluateBadges(userId: string): Promise<BadgeEvalResult[]> {
  // Fetch user profile and streak data
  const [profileResult, streakResult, activitiesResult] = await Promise.all([
    supabase.from('profiles').select('*').eq('id', userId).single(),
    supabase.from('streaks').select('*').eq('user_id', userId).single(),
    supabase.from('activities').select('reply_count, tweet_count, dm_count').eq('user_id', userId)
  ]);

  const profile = profileResult.data || {};
  const streak = streakResult.data || { current_streak: 0 };
  const activities = activitiesResult.data || [];

  // Calculate totals
  const totalReplies = activities.reduce((sum: number, a: any) => sum + (a.reply_count || 0), 0);
  const totalTweets = activities.reduce((sum: number, a: any) => sum + (a.tweet_count || 0), 0);
  const totalDms = activities.reduce((sum: number, a: any) => sum + (a.dm_count || 0), 0);
  const currentStreak = streak.current_streak || 0;
  const leaderboardPosition = profile.best_leaderboard_position || Infinity;
  const spacePosition = profile.best_space_position || Infinity;

  const results: BadgeEvalResult[] = [];

  for (const badge of ALL_BADGES) {
    let earned = false;
    let progress = 0;

    switch (badge.category) {
      case 'replies':
        earned = totalReplies >= badge.threshold;
        progress = Math.min(100, (totalReplies / badge.threshold) * 100);
        break;
      
      case 'streak':
        earned = currentStreak >= badge.threshold;
        progress = Math.min(100, (currentStreak / badge.threshold) * 100);
        break;
      
      case 'consistency':
        // Consistency badges use days of consecutive activity
        earned = currentStreak >= badge.threshold;
        progress = Math.min(100, (currentStreak / badge.threshold) * 100);
        break;
      
      case 'leaderboard':
        earned = leaderboardPosition <= badge.threshold;
        // Progress for leaderboard is inverse (lower is better)
        progress = leaderboardPosition <= badge.threshold ? 100 : 
          Math.max(0, 100 - ((leaderboardPosition - badge.threshold) / badge.threshold) * 100);
        break;
      
      case 'space':
        earned = spacePosition <= badge.threshold;
        progress = spacePosition <= badge.threshold ? 100 :
          Math.max(0, 100 - ((spacePosition - badge.threshold) / badge.threshold) * 100);
        break;
    }

    results.push({ badge, earned, progress });
  }

  return results;
}

/**
 * Award newly earned badges to user
 * Returns array of newly awarded badges
 */
export async function awardNewBadges(userId: string): Promise<BadgeDefinition[]> {
  const evalResults = await evaluateBadges(userId);
  
  // Get existing badges
  const { data: profile } = await supabase
    .from('profiles')
    .select('badges')
    .eq('id', userId)
    .single();

  const existingBadges = profile?.badges || [];
  const existingIds = new Set(existingBadges.map((b: any) => b.id));

  // Find newly earned badges
  const newlyEarned = evalResults.filter(r => r.earned && !existingIds.has(r.badge.id));

  if (newlyEarned.length === 0) {
    return [];
  }

  // Prepare new badges with earnedAt timestamp
  const newBadges = newlyEarned.map(r => ({
    id: r.badge.id,
    name: r.badge.name,
    description: r.badge.description,
    iconPath: r.badge.iconPath,
    category: r.badge.category,
    earnedAt: new Date().toISOString()
  }));

  // Update profile with new badges
  const updatedBadges = [...existingBadges, ...newBadges];
  
  await supabase
    .from('profiles')
    .update({ badges: updatedBadges })
    .eq('id', userId);

  // Log badge achievements to space activity (if user is in a space)
  try {
    const { data: membership } = await supabase
      .from('members')
      .select('space_id')
      .eq('user_id', userId)
      .limit(1)
      .single();

    if (membership?.space_id) {
      // Log each badge earned as a space activity
      const activityLogs = newlyEarned.map(r => ({
        space_id: membership.space_id,
        user_id: userId,
        event_type: 'badge_earned' as const,
        event_data: {
          badge_id: r.badge.id,
          badge_name: r.badge.name,
          badge_icon: r.badge.iconPath
        }
      }));

      await supabase.from('space_activity').insert(activityLogs);
    }
  } catch (e) {
    // Silently fail space activity logging - non-critical
    console.warn('[BadgeEvaluator] Could not log badge to space activity:', e);
  }

  return newlyEarned.map(r => r.badge);
}

/**
 * Check and award badges after activity sync
 * Call this after syncing activities to Supabase
 */
export async function checkBadgesAfterSync(userId: string): Promise<BadgeDefinition[]> {
  try {
    return await awardNewBadges(userId);
  } catch (e) {
    console.warn('[BadgeEvaluator] Error checking badges:', e);
    return [];
  }
}
