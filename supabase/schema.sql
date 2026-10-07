-- ==============================================================================
-- Sai Sarathi Travels - Supabase PostgreSQL Database Schema
-- ==============================================================================
-- Run this script in your Supabase Dashboard: SQL Editor -> New Query -> Run

-- 1. Create the `reviews` table
CREATE TABLE IF NOT EXISTS public.reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_name TEXT NOT NULL CHECK (char_length(trim(user_name)) >= 2 AND char_length(user_name) <= 100),
  location TEXT DEFAULT 'Verified Traveler',
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  review_text TEXT NOT NULL CHECK (char_length(trim(review_text)) >= 10 AND char_length(review_text) <= 2000),
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 2. Create index for fast sorting by newest reviews
CREATE INDEX IF NOT EXISTS idx_reviews_created_at ON public.reviews (created_at DESC);

-- 3. Enable Row Level Security (RLS)
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- 4. Policy: Allow anyone (public/anonymous) to read reviews
DROP POLICY IF EXISTS "Allow public read access to reviews" ON public.reviews;
CREATE POLICY "Allow public read access to reviews"
  ON public.reviews
  FOR SELECT
  TO public
  USING (true);

-- 5. Policy: Allow anyone (public/anonymous) to submit reviews
DROP POLICY IF EXISTS "Allow public insert access to reviews" ON public.reviews;
CREATE POLICY "Allow public insert access to reviews"
  ON public.reviews
  FOR INSERT
  TO public
  WITH CHECK (
    char_length(trim(user_name)) >= 2 AND
    rating >= 1 AND rating <= 5 AND
    char_length(trim(review_text)) >= 10
  );

-- 6. Enable Supabase Realtime broadcast for the `reviews` table
ALTER PUBLICATION supabase_realtime ADD TABLE public.reviews;
