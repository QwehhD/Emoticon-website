-- Migration: Add user_name column to emotion_logs table
-- This will store the user's name from allowed_users table

-- Add user_name column to emotion_logs
ALTER TABLE emotion_logs 
ADD COLUMN IF NOT EXISTS user_name TEXT;

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_emotion_logs_user_name ON emotion_logs(user_name);

-- Optional: Update existing records with user names from allowed_users
-- This will populate user_name for existing logs
UPDATE emotion_logs el
SET user_name = au.nama
FROM allowed_users au
WHERE el.card_uid = au.uid
AND el.user_name IS NULL;

-- Add comment to document the column
COMMENT ON COLUMN emotion_logs.user_name IS 'User name from allowed_users table, stored for performance';
