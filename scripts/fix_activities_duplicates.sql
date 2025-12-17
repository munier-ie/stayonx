-- 1. Remove duplicate rows, keeping the one with the most recent data (highest counts/last_updated)
-- This ensures that if you have multiple rows for "2024-12-11", we keep the one with "reply_count: 5" instead of "reply_count: 1".

DELETE FROM public.activities
WHERE id IN (
    SELECT id
    FROM (
        SELECT id,
        ROW_NUMBER() OVER (
            PARTITION BY user_id, date
            ORDER BY GREATEST(tweet_count, reply_count, dm_count) DESC, last_updated DESC
        ) as row_num
        FROM public.activities
    ) t
    WHERE t.row_num > 1
);

-- 2. Add the Unique Constraint
-- This is CRITICAL. It tells Supabase: "If we try to insert a record for User X on Date Y, and it exists, UPDATE it instead."
ALTER TABLE public.activities 
ADD CONSTRAINT activities_user_date_unique UNIQUE (user_id, date);
