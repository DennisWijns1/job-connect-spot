-- Add multi-role support to profiles
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS is_handy boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS is_instructor boolean NOT NULL DEFAULT false;

-- Backfill existing records based on user_type
UPDATE profiles SET is_handy = true WHERE user_type IN ('handy', 'both');
UPDATE profiles SET is_instructor = true WHERE user_type = 'instructor';

-- Add upsert support for instructors (needed for upgrade flow)
ALTER TABLE instructors
  ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;

CREATE UNIQUE INDEX IF NOT EXISTS instructors_user_id_key ON instructors(user_id);
