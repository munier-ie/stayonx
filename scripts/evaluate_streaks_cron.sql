-- ============================================================
-- DAILY STREAK EVALUATION CRON JOB
-- Run this in Supabase SQL Editor to set up the scheduled job
-- Requires: pg_cron extension enabled
-- ============================================================

-- 1. Function to evaluate individual streaks (proactive reset)
-- Resets streaks for users who missed yesterday
CREATE OR REPLACE FUNCTION public.evaluate_individual_streaks()
RETURNS int AS $$
DECLARE
    v_yesterday date := CURRENT_DATE - INTERVAL '1 day';
    v_reset_count int;
BEGIN
    -- Reset streaks for users whose last_met_date is older than yesterday
    -- This means they missed at least one day
    UPDATE public.streaks
    SET current_streak = 0,
        updated_at = NOW()
    WHERE last_met_date < v_yesterday
      AND current_streak > 0;
    
    GET DIAGNOSTICS v_reset_count = ROW_COUNT;
    
    RAISE NOTICE 'Individual streaks reset: %', v_reset_count;
    RETURN v_reset_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- 2. Function to evaluate space streaks
-- Checks if all members met their goals yesterday
-- If all met: increment streak. If any missed: reset to 0
CREATE OR REPLACE FUNCTION public.evaluate_space_streaks()
RETURNS TABLE(space_id uuid, space_name text, action text, new_streak int) AS $$
DECLARE
    v_space record;
    v_yesterday date := CURRENT_DATE - INTERVAL '1 day';
    v_all_members_met boolean;
    v_member_count int;
    v_met_count int;
BEGIN
    -- Loop through all spaces with 2+ members
    FOR v_space IN 
        SELECT s.id, s.name, s.streak_count, s.last_streak_date, s.goals,
               COUNT(m.user_id) as member_count
        FROM public.spaces s
        JOIN public.members m ON m.space_id = s.id
        GROUP BY s.id
        HAVING COUNT(m.user_id) >= 2
    LOOP
        -- Count how many members met their goals yesterday
        SELECT COUNT(*) INTO v_met_count
        FROM public.members m
        JOIN public.activities a ON a.user_id = m.user_id AND a.date = v_yesterday
        JOIN public.profiles p ON p.id = m.user_id
        WHERE m.space_id = v_space.id
          AND a.reply_count >= COALESCE((COALESCE(v_space.goals, p.goals)->>'reply')::int, 5)
          AND a.tweet_count >= COALESCE((COALESCE(v_space.goals, p.goals)->>'tweet')::int, 1)
          AND a.dm_count >= COALESCE((COALESCE(v_space.goals, p.goals)->>'dm')::int, 1);

        -- Get total member count
        SELECT COUNT(*) INTO v_member_count
        FROM public.members WHERE space_id = v_space.id;
        
        v_all_members_met := (v_met_count = v_member_count);
        
        IF v_all_members_met THEN
            -- All members met goals: increment streak
            IF v_space.last_streak_date = v_yesterday - INTERVAL '1 day' THEN
                -- Consecutive day: increment
                UPDATE public.spaces
                SET streak_count = streak_count + 1,
                    last_streak_date = v_yesterday
                WHERE id = v_space.id;
                
                space_id := v_space.id;
                space_name := v_space.name;
                action := 'incremented';
                new_streak := v_space.streak_count + 1;
                RETURN NEXT;
            ELSE
                -- Not consecutive or first time: set to 1
                UPDATE public.spaces
                SET streak_count = 1,
                    last_streak_date = v_yesterday
                WHERE id = v_space.id;
                
                space_id := v_space.id;
                space_name := v_space.name;
                action := 'started';
                new_streak := 1;
                RETURN NEXT;
            END IF;
        ELSE
            -- At least one member missed: reset to 0
            IF v_space.streak_count > 0 THEN
                UPDATE public.spaces
                SET streak_count = 0
                WHERE id = v_space.id;
                
                -- Log streak break to space_activity
                INSERT INTO public.space_activity (space_id, user_id, event_type, event_data)
                VALUES (
                    v_space.id,
                    NULL, -- system event
                    'streak_broken',
                    jsonb_build_object(
                        'previous_streak', v_space.streak_count,
                        'members_met', v_met_count,
                        'members_total', v_member_count,
                        'reason', 'Not all members completed their goals on ' || v_yesterday::text
                    )
                );
                
                space_id := v_space.id;
                space_name := v_space.name;
                action := 'reset';
                new_streak := 0;
                RETURN NEXT;
            END IF;
        END IF;
    END LOOP;
    
    RETURN;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- 3. Master function that runs both evaluations
CREATE OR REPLACE FUNCTION public.run_daily_streak_evaluation()
RETURNS jsonb AS $$
DECLARE
    v_individual_reset_count int;
    v_space_results jsonb;
BEGIN
    -- Evaluate individual streaks first
    v_individual_reset_count := public.evaluate_individual_streaks();
    
    -- Evaluate space streaks
    SELECT jsonb_agg(row_to_json(r))
    INTO v_space_results
    FROM public.evaluate_space_streaks() r;
    
    RETURN jsonb_build_object(
        'timestamp', NOW(),
        'individual_streaks_reset', v_individual_reset_count,
        'space_evaluations', COALESCE(v_space_results, '[]'::jsonb)
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- 4. Schedule the cron job to run at 00:05 UTC daily
-- Delete existing job if it exists (idempotent)
SELECT cron.unschedule('daily-streak-evaluation') 
WHERE EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'daily-streak-evaluation');

-- Schedule new job
SELECT cron.schedule(
    'daily-streak-evaluation',      -- Job name
    '5 0 * * *',                    -- At 00:05 UTC every day
    $$SELECT public.run_daily_streak_evaluation()$$
);

-- ============================================================
-- VERIFICATION QUERIES
-- Run these after executing the above to verify setup
-- ============================================================

-- Check if cron job is scheduled:
-- SELECT * FROM cron.job WHERE jobname = 'daily-streak-evaluation';

-- Test the evaluation manually (won't make changes if no one missed):
-- SELECT public.run_daily_streak_evaluation();

-- Check cron job history:
-- SELECT * FROM cron.job_run_details ORDER BY start_time DESC LIMIT 10;
