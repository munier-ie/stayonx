-- Migration: Add ad analytics tables and columns
-- Run this in your Supabase SQL editor

-- Add new columns to sponsors table
ALTER TABLE sponsors 
ADD COLUMN IF NOT EXISTS submitted_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS impressions INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS clicks INTEGER DEFAULT 0;

-- Create ad_impressions table for deduplication
CREATE TABLE IF NOT EXISTS ad_impressions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  ad_id UUID NOT NULL,
  visitor_id TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(ad_id, visitor_id)
);

-- Create ad_clicks table
CREATE TABLE IF NOT EXISTS ad_clicks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  ad_id UUID NOT NULL,
  visitor_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create function to increment impressions
CREATE OR REPLACE FUNCTION increment_impressions(sponsor_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE sponsors SET impressions = COALESCE(impressions, 0) + 1 WHERE id = sponsor_id;
END;
$$ LANGUAGE plpgsql;

-- Create function to increment clicks
CREATE OR REPLACE FUNCTION increment_clicks(sponsor_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE sponsors SET clicks = COALESCE(clicks, 0) + 1 WHERE id = sponsor_id;
END;
$$ LANGUAGE plpgsql;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_ad_impressions_ad_visitor ON ad_impressions(ad_id, visitor_id);
CREATE INDEX IF NOT EXISTS idx_ad_clicks_ad ON ad_clicks(ad_id);
