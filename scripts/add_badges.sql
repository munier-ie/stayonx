-- Migration: Add Badge Support
-- Run this in your Supabase SQL Editor

-- 1. Add badges column to profiles table (JSONB array of earned badges)
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS badges jsonb DEFAULT '[]'::jsonb;

-- 2. Add total activity counts for badge tracking (computed from activities)
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS total_replies int DEFAULT 0,
ADD COLUMN IF NOT EXISTS total_tweets int DEFAULT 0,
ADD COLUMN IF NOT EXISTS total_dms int DEFAULT 0;

-- 3. Add highest leaderboard positions achieved (for badge eligibility)
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS best_leaderboard_position int DEFAULT NULL,
ADD COLUMN IF NOT EXISTS best_space_position int DEFAULT NULL;

-- 4. Create index for handle lookups (badge injection uses this)
CREATE INDEX IF NOT EXISTS idx_profiles_twitter_handle 
ON public.profiles(twitter_handle);

-- 5. Create index for leaderboard queries
CREATE INDEX IF NOT EXISTS idx_profiles_total_replies 
ON public.profiles(total_replies DESC);

-- 6. Function to update profile totals from activities
-- Call this periodically or on activity insert
CREATE OR REPLACE FUNCTION update_profile_totals(p_user_id uuid)
RETURNS void AS $$
BEGIN
  UPDATE public.profiles
  SET 
    total_replies = (SELECT COALESCE(SUM(reply_count), 0) FROM public.activities WHERE user_id = p_user_id),
    total_tweets = (SELECT COALESCE(SUM(tweet_count), 0) FROM public.activities WHERE user_id = p_user_id),
    total_dms = (SELECT COALESCE(SUM(dm_count), 0) FROM public.activities WHERE user_id = p_user_id)
  WHERE id = p_user_id;
END;
$$ LANGUAGE plpgsql;

-- 7. Trigger to auto-update totals when activities change
CREATE OR REPLACE FUNCTION trigger_update_profile_totals()
RETURNS trigger AS $$
BEGIN
  PERFORM update_profile_totals(NEW.user_id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_totals_on_activity ON public.activities;
CREATE TRIGGER update_totals_on_activity
AFTER INSERT OR UPDATE ON public.activities
FOR EACH ROW EXECUTE FUNCTION trigger_update_profile_totals();

-- 8. Function to check and award badges for a user
CREATE OR REPLACE FUNCTION check_and_award_badges(p_user_id uuid)
RETURNS jsonb AS $$
DECLARE
  v_profile record;
  v_streak record;
  v_badges jsonb := '[]'::jsonb;
  v_existing_badges jsonb;
BEGIN
  -- Get current profile
  SELECT * INTO v_profile FROM public.profiles WHERE id = p_user_id;
  IF NOT FOUND THEN RETURN '[]'::jsonb; END IF;
  
  v_existing_badges := COALESCE(v_profile.badges, '[]'::jsonb);
  
  -- Get streak data
  SELECT * INTO v_streak FROM public.streaks WHERE user_id = p_user_id;
  
  -- Reply badges
  IF v_profile.total_replies >= 100 AND NOT v_existing_badges @> '[{"id":"replies-100"}]' THEN
    v_badges := v_badges || jsonb_build_object('id', 'replies-100', 'name', '100 Replies', 'description', 'Sent 100 replies on X', 'iconPath', '/badges/Replies/100replies.png', 'earnedAt', NOW());
  END IF;
  IF v_profile.total_replies >= 500 AND NOT v_existing_badges @> '[{"id":"replies-500"}]' THEN
    v_badges := v_badges || jsonb_build_object('id', 'replies-500', 'name', '500 Replies', 'description', 'Sent 500 replies on X', 'iconPath', '/badges/Replies/500replies.png', 'earnedAt', NOW());
  END IF;
  IF v_profile.total_replies >= 1000 AND NOT v_existing_badges @> '[{"id":"replies-1000"}]' THEN
    v_badges := v_badges || jsonb_build_object('id', 'replies-1000', 'name', '1000 Replies', 'description', 'Sent 1000 replies on X', 'iconPath', '/badges/Replies/1000replies.png', 'earnedAt', NOW());
  END IF;
  IF v_profile.total_replies >= 5000 AND NOT v_existing_badges @> '[{"id":"replies-5000"}]' THEN
    v_badges := v_badges || jsonb_build_object('id', 'replies-5000', 'name', '5000 Replies', 'description', 'Sent 5000 replies on X', 'iconPath', '/badges/Replies/5000replies.png', 'earnedAt', NOW());
  END IF;
  
  -- Streak badges (based on current_streak)
  IF v_streak.current_streak >= 7 AND NOT v_existing_badges @> '[{"id":"streak-7"}]' THEN
    v_badges := v_badges || jsonb_build_object('id', 'streak-7', 'name', '7-Day Streak', 'description', 'Completed goals for 7 consecutive days', 'iconPath', '/badges/streaks/7days.png', 'earnedAt', NOW());
  END IF;
  IF v_streak.current_streak >= 14 AND NOT v_existing_badges @> '[{"id":"streak-14"}]' THEN
    v_badges := v_badges || jsonb_build_object('id', 'streak-14', 'name', '14-Day Streak', 'description', 'Completed goals for 14 consecutive days', 'iconPath', '/badges/streaks/14days.png', 'earnedAt', NOW());
  END IF;
  IF v_streak.current_streak >= 30 AND NOT v_existing_badges @> '[{"id":"streak-30"}]' THEN
    v_badges := v_badges || jsonb_build_object('id', 'streak-30', 'name', '30-Day Streak', 'description', 'Completed goals for 30 consecutive days', 'iconPath', '/badges/streaks/30days.png', 'earnedAt', NOW());
  END IF;
  IF v_streak.current_streak >= 60 AND NOT v_existing_badges @> '[{"id":"streak-60"}]' THEN
    v_badges := v_badges || jsonb_build_object('id', 'streak-60', 'name', '60-Day Streak', 'description', 'Completed goals for 60 consecutive days', 'iconPath', '/badges/streaks/60days.png', 'earnedAt', NOW());
  END IF;
  IF v_streak.current_streak >= 100 AND NOT v_existing_badges @> '[{"id":"streak-100"}]' THEN
    v_badges := v_badges || jsonb_build_object('id', 'streak-100', 'name', '100-Day Streak', 'description', 'Completed goals for 100 consecutive days', 'iconPath', '/badges/streaks/100days.png', 'earnedAt', NOW());
  END IF;
  IF v_streak.current_streak >= 365 AND NOT v_existing_badges @> '[{"id":"streak-365"}]' THEN
    v_badges := v_badges || jsonb_build_object('id', 'streak-365', 'name', '365-Day Streak', 'description', 'Completed goals for a full year!', 'iconPath', '/badges/streaks/365days.png', 'earnedAt', NOW());
  END IF;
  
  -- Leaderboard badges (based on best_leaderboard_position)
  IF v_profile.best_leaderboard_position IS NOT NULL AND v_profile.best_leaderboard_position <= 100 AND NOT v_existing_badges @> '[{"id":"leaderboard-top100"}]' THEN
    v_badges := v_badges || jsonb_build_object('id', 'leaderboard-top100', 'name', 'Top 100', 'description', 'Ranked in the top 100 on the global leaderboard', 'iconPath', '/badges/leaderboard/top100.png', 'earnedAt', NOW());
  END IF;
  IF v_profile.best_leaderboard_position IS NOT NULL AND v_profile.best_leaderboard_position <= 10 AND NOT v_existing_badges @> '[{"id":"leaderboard-top10"}]' THEN
    v_badges := v_badges || jsonb_build_object('id', 'leaderboard-top10', 'name', 'Top 10', 'description', 'Ranked in the top 10 on the global leaderboard', 'iconPath', '/badges/leaderboard/top10.png', 'earnedAt', NOW());
  END IF;
  IF v_profile.best_leaderboard_position IS NOT NULL AND v_profile.best_leaderboard_position = 1 AND NOT v_existing_badges @> '[{"id":"leaderboard-no1"}]' THEN
    v_badges := v_badges || jsonb_build_object('id', 'leaderboard-no1', 'name', '#1 Leader', 'description', 'Achieved the #1 spot on the global leaderboard', 'iconPath', '/badges/leaderboard/no1.png', 'earnedAt', NOW());
  END IF;
  
  -- Update badges if any new ones earned
  IF jsonb_array_length(v_badges) > 0 THEN
    UPDATE public.profiles 
    SET badges = v_existing_badges || v_badges
    WHERE id = p_user_id;
  END IF;
  
  RETURN v_badges;
END;
$$ LANGUAGE plpgsql;

-- 9. RPC function to get badges for a handle (used by extension)
CREATE OR REPLACE FUNCTION get_badges_by_handle(p_handle text)
RETURNS jsonb AS $$
DECLARE
  v_badges jsonb;
BEGIN
  SELECT badges INTO v_badges 
  FROM public.profiles 
  WHERE LOWER(twitter_handle) = LOWER(p_handle);
  
  RETURN COALESCE(v_badges, '[]'::jsonb);
END;
$$ LANGUAGE plpgsql;

-- Done! Run check_and_award_badges(user_id) after syncing activities
-- or set up a cron job to run it periodically for all users
