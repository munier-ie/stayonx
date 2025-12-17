-- Function to calculate and update streaks
CREATE OR REPLACE FUNCTION public.handle_activity_update()
RETURNS TRIGGER AS $$
DECLARE
    user_goals jsonb;
    streak_record public.streaks%ROWTYPE;
    is_goal_met boolean;
    streak_date date;
BEGIN
    -- 1. Get User Goals
    SELECT goals INTO user_goals FROM public.profiles WHERE id = NEW.user_id;
    
    -- Default goals if null
    IF user_goals IS NULL THEN
        user_goals := '{"reply": 5, "tweet": 1, "dm": 1}'::jsonb;
    END IF;

    -- 2. Check if goals are met for THIS activity record
    -- We use GREATEST to ensure we don't have negative counts, although default is 0
    is_goal_met := (
        NEW.reply_count >= (user_goals->>'reply')::int AND
        NEW.tweet_count >= (user_goals->>'tweet')::int AND
        NEW.dm_count >= (user_goals->>'dm')::int
    );

    -- 3. Get or Initialize Streak Record
    SELECT * INTO streak_record FROM public.streaks WHERE user_id = NEW.user_id;
    
    IF NOT FOUND THEN
        INSERT INTO public.streaks (user_id, current_streak, longest_streak, last_met_date, updated_at)
        VALUES (NEW.user_id, 0, 0, NULL, NOW())
        RETURNING * INTO streak_record;
    END IF;

    -- 4. Logic Update
    IF is_goal_met THEN
        -- If duplicate update for same day, ignore
        IF streak_record.last_met_date = NEW.date THEN
            RETURN NEW; 
        END IF;

        -- Check consecutive days
        IF streak_record.last_met_date = (NEW.date - INTERVAL '1 day') THEN
             -- Incremented!
             UPDATE public.streaks 
             SET current_streak = current_streak + 1,
                 longest_streak = GREATEST(longest_streak, current_streak + 1),
                 last_met_date = NEW.date,
                 updated_at = NOW()
             WHERE user_id = NEW.user_id;
        ELSE
             -- Missed a day or first time (streak reset or start)
             -- If last_met_date is older than yesterday, we reset to 1 (since today is met)
             UPDATE public.streaks 
             SET current_streak = 1,
                 longest_streak = GREATEST(longest_streak, 1),
                 last_met_date = NEW.date,
                 updated_at = NOW()
             WHERE user_id = NEW.user_id;
        END IF;
    ELSE
        -- Goal NOT met (yet).
        -- We do NOT reset streak here immediately because user might meet it later today.
        -- We only reset "visually" on read if last_met_date is old.
        -- Or we could reset if they updated a record for TODAY but it's below goals? 
        -- No, let's keep it sticky.
        RETURN NEW;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger Definition
DROP TRIGGER IF EXISTS on_activity_update ON public.activities;
CREATE TRIGGER on_activity_update
AFTER INSERT OR UPDATE ON public.activities
FOR EACH ROW
EXECUTE FUNCTION public.handle_activity_update();
