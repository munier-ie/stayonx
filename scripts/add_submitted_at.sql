-- Migration: Add submitted_at column to sponsors table
-- This column tracks when an ad was submitted for a payment, preventing reuse of payment IDs

-- Add submitted_at column
ALTER TABLE public.sponsors 
ADD COLUMN IF NOT EXISTS submitted_at timestamp with time zone NULL;

-- Add comment explaining the column
COMMENT ON COLUMN public.sponsors.submitted_at IS 'Timestamp when the ad was submitted. Used to prevent reuse of payment IDs.';

-- Update existing records that have ad content to mark them as submitted
-- This ensures existing ads are properly marked as submitted
UPDATE public.sponsors 
SET submitted_at = created_at 
WHERE submitted_at IS NULL 
  AND title IS NOT NULL 
  AND title != ''
  AND image_url IS NOT NULL
  AND image_url != '';
