/**
 * Badge definitions for StayOnX
 * Defines all available badges with thresholds and metadata
 */

export type BadgeCategory = 'streak' | 'consistency' | 'leaderboard' | 'space' | 'replies';

export interface BadgeDefinition {
  id: string;
  category: BadgeCategory;
  name: string;
  description: string;
  iconPath: string;
  threshold: number;
}

// Streak badges - based on consecutive days of meeting goals
export const STREAK_BADGES: BadgeDefinition[] = [
  {
    id: 'streak-7',
    category: 'streak',
    name: '7-Day Streak',
    description: 'Completed goals for 7 consecutive days',
    iconPath: '/badges/streaks/7days.png',
    threshold: 7,
  },
  {
    id: 'streak-14',
    category: 'streak',
    name: '14-Day Streak',
    description: 'Completed goals for 14 consecutive days',
    iconPath: '/badges/streaks/14days.png',
    threshold: 14,
  },
  {
    id: 'streak-30',
    category: 'streak',
    name: '30-Day Streak',
    description: 'Completed goals for 30 consecutive days',
    iconPath: '/badges/streaks/30days.png',
    threshold: 30,
  },
  {
    id: 'streak-60',
    category: 'streak',
    name: '60-Day Streak',
    description: 'Completed goals for 60 consecutive days',
    iconPath: '/badges/streaks/60days.png',
    threshold: 60,
  },
  {
    id: 'streak-100',
    category: 'streak',
    name: '100-Day Streak',
    description: 'Completed goals for 100 consecutive days',
    iconPath: '/badges/streaks/100days.png',
    threshold: 100,
  },
  {
    id: 'streak-365',
    category: 'streak',
    name: '365-Day Streak',
    description: 'Completed goals for a full year!',
    iconPath: '/badges/streaks/365days.png',
    threshold: 365,
  },
];

// Consistency badges - based on weekly consistency
export const CONSISTENCY_BADGES: BadgeDefinition[] = [
  {
    id: 'consistency-7d',
    category: 'consistency',
    name: '7-Day Consistency',
    description: 'Met daily goals for 7 days',
    iconPath: '/badges/consistency/7days.png',
    threshold: 7,
  },
  {
    id: 'consistency-7w',
    category: 'consistency',
    name: '7-Week Consistency',
    description: 'Met weekly goals for 7 consecutive weeks',
    iconPath: '/badges/consistency/7weeks.png',
    threshold: 49, // 7 weeks in days
  },
  {
    id: 'consistency-14w',
    category: 'consistency',
    name: '14-Week Consistency',
    description: 'Met weekly goals for 14 consecutive weeks',
    iconPath: '/badges/consistency/14weeks.png',
    threshold: 98, // 14 weeks in days
  },
];

// Leaderboard badges - based on global leaderboard position
export const LEADERBOARD_BADGES: BadgeDefinition[] = [
  {
    id: 'leaderboard-top100',
    category: 'leaderboard',
    name: 'Top 100',
    description: 'Ranked in the top 100 on the global leaderboard',
    iconPath: '/badges/leaderboard/top100.png',
    threshold: 100,
  },
  {
    id: 'leaderboard-top10',
    category: 'leaderboard',
    name: 'Top 10',
    description: 'Ranked in the top 10 on the global leaderboard',
    iconPath: '/badges/leaderboard/top10.png',
    threshold: 10,
  },
  {
    id: 'leaderboard-no1',
    category: 'leaderboard',
    name: '#1 Leader',
    description: 'Achieved the #1 spot on the global leaderboard',
    iconPath: '/badges/leaderboard/no1.png',
    threshold: 1,
  },
];

// Space badges - based on space leaderboard position
export const SPACE_BADGES: BadgeDefinition[] = [
  {
    id: 'space-top100',
    category: 'space',
    name: 'Space Top 100',
    description: 'Ranked in the top 100 in your space',
    iconPath: '/badges/Space-Level/top100.png',
    threshold: 100,
  },
  {
    id: 'space-top10',
    category: 'space',
    name: 'Space Top 10',
    description: 'Ranked in the top 10 in your space',
    iconPath: '/badges/Space-Level/top10.png',
    threshold: 10,
  },
  {
    id: 'space-no1',
    category: 'space',
    name: 'Space Leader',
    description: 'Achieved the #1 spot in your space',
    iconPath: '/badges/Space-Level/no1.png',
    threshold: 1,
  },
];

// Reply badges - based on total reply count
export const REPLY_BADGES: BadgeDefinition[] = [
  {
    id: 'replies-100',
    category: 'replies',
    name: '100 Replies',
    description: 'Sent 100 replies on X',
    iconPath: '/badges/Replies/100replies.png',
    threshold: 100,
  },
  {
    id: 'replies-500',
    category: 'replies',
    name: '500 Replies',
    description: 'Sent 500 replies on X',
    iconPath: '/badges/Replies/500replies.png',
    threshold: 500,
  },
  {
    id: 'replies-1000',
    category: 'replies',
    name: '1000 Replies',
    description: 'Sent 1000 replies on X',
    iconPath: '/badges/Replies/1000replies.png',
    threshold: 1000,
  },
  {
    id: 'replies-5000',
    category: 'replies',
    name: '5000 Replies',
    description: 'Sent 5000 replies on X',
    iconPath: '/badges/Replies/5000replies.png',
    threshold: 5000,
  },
];

// All badges combined
export const ALL_BADGES: BadgeDefinition[] = [
  ...STREAK_BADGES,
  ...CONSISTENCY_BADGES,
  ...LEADERBOARD_BADGES,
  ...SPACE_BADGES,
  ...REPLY_BADGES,
];

/**
 * Get badge definition by ID
 */
export function getBadgeById(id: string): BadgeDefinition | undefined {
  return ALL_BADGES.find(badge => badge.id === id);
}

/**
 * Get all badges for a category
 */
export function getBadgesByCategory(category: BadgeCategory): BadgeDefinition[] {
  return ALL_BADGES.filter(badge => badge.category === category);
}
