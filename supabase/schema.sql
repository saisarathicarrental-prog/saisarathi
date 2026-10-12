-- ==============================================================================
-- Sai Sarathi Travels - Supabase PostgreSQL Database Schema
-- File: supabase/schema.sql
-- ==============================================================================
-- Reference copy of supabase/setup_reviews.sql
-- Run this script in your Supabase Dashboard: SQL Editor -> New Query -> Run

CREATE TABLE IF NOT EXISTS public.reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL CHECK (char_length(trim(name)) >= 2 AND char_length(name) <= 100),
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT NOT NULL CHECK (char_length(trim(comment)) >= 10 AND char_length(comment) <= 2000),
  location TEXT DEFAULT 'Verified Traveler' CHECK (char_length(location) <= 100),
  user_name TEXT CHECK (user_name IS NULL OR (char_length(trim(user_name)) >= 2 AND char_length(user_name) <= 100)),
  review_text TEXT CHECK (review_text IS NULL OR (char_length(trim(review_text)) >= 10 AND char_length(review_text) <= 2000)),
  service_type TEXT NULL CHECK (service_type IS NULL OR char_length(service_type) <= 100),
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE OR REPLACE FUNCTION public.handle_review_defaults_and_sync()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.id IS NULL THEN
    NEW.id := gen_random_uuid();
  END IF;

  NEW.created_at := COALESCE(NEW.created_at, timezone('utc'::text, now()));
  NEW.updated_at := timezone('utc'::text, now());

  IF (NEW.name IS NULL OR trim(NEW.name) = '') AND (NEW.user_name IS NOT NULL AND trim(NEW.user_name) <> '') THEN
    NEW.name := trim(NEW.user_name);
  END IF;
  IF (NEW.user_name IS NULL OR trim(NEW.user_name) = '') AND (NEW.name IS NOT NULL AND trim(NEW.name) <> '') THEN
    NEW.user_name := trim(NEW.name);
  END IF;

  IF (NEW.comment IS NULL OR trim(NEW.comment) = '') AND (NEW.review_text IS NOT NULL AND trim(NEW.review_text) <> '') THEN
    NEW.comment := trim(NEW.review_text);
  END IF;
  IF (NEW.review_text IS NULL OR trim(NEW.review_text) = '') AND (NEW.comment IS NOT NULL AND trim(NEW.comment) <> '') THEN
    NEW.review_text := trim(NEW.comment);
  END IF;

  IF NEW.location IS NULL OR trim(NEW.location) = '' THEN
    NEW.location := 'Verified Traveler';
  ELSE
    NEW.location := trim(NEW.location);
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_sync_review_fields ON public.reviews;
CREATE TRIGGER trg_sync_review_fields
  BEFORE INSERT OR UPDATE ON public.reviews
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_review_defaults_and_sync();

CREATE INDEX IF NOT EXISTS idx_reviews_created_at ON public.reviews (created_at DESC);

ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON public.reviews FROM PUBLIC;
GRANT SELECT, INSERT ON public.reviews TO anon, authenticated;

DROP POLICY IF EXISTS "Allow public read access to reviews" ON public.reviews;
CREATE POLICY "Allow public read access to reviews"
  ON public.reviews
  FOR SELECT
  TO public
  USING (true);

DROP POLICY IF EXISTS "Allow public insert access to reviews" ON public.reviews;
CREATE POLICY "Allow public insert access to reviews"
  ON public.reviews
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    char_length(trim(COALESCE(name, user_name, ''))) >= 2 AND
    char_length(COALESCE(name, user_name, '')) <= 100 AND
    rating >= 1 AND
    rating <= 5 AND
    char_length(trim(COALESCE(comment, review_text, ''))) >= 10 AND
    char_length(COALESCE(comment, review_text, '')) <= 2000
  );

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' 
    AND schemaname = 'public' 
    AND tablename = 'reviews'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.reviews;
  END IF;
END $$;
