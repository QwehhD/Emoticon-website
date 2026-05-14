-- Supabase SQL Schema for Emotion Logs
-- Run this in the Supabase SQL Editor to create the emotion_logs table

-- Create the allowed_users table for MQTT validation
CREATE TABLE IF NOT EXISTS allowed_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  uid TEXT NOT NULL UNIQUE,
  nama TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for allowed_users
CREATE INDEX IF NOT EXISTS idx_allowed_users_uid ON allowed_users(uid);

-- Enable RLS for allowed_users
ALTER TABLE allowed_users ENABLE ROW LEVEL SECURITY;

-- Create a policy that allows all authenticated users to read
CREATE POLICY IF NOT EXISTS "Enable read access for all authenticated users" ON allowed_users
  FOR SELECT
  USING (auth.role() = 'authenticated');

-- Create the emotion_logs table
CREATE TABLE emotion_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  card_uid TEXT NOT NULL,
  emotion TEXT NOT NULL,
  timestamp BIGINT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better query performance
CREATE INDEX idx_emotion_logs_card_uid ON emotion_logs(card_uid);
CREATE INDEX idx_emotion_logs_timestamp ON emotion_logs(timestamp DESC);
CREATE INDEX idx_emotion_logs_emotion ON emotion_logs(emotion);

-- Enable RLS (Row Level Security)
ALTER TABLE emotion_logs ENABLE ROW LEVEL SECURITY;

-- Create a policy that allows all authenticated users to read
CREATE POLICY "Enable read access for all authenticated users" ON emotion_logs
  FOR SELECT
  USING (auth.role() = 'authenticated');

-- Create a policy that allows all authenticated users to insert
CREATE POLICY "Enable insert access for all authenticated users" ON emotion_logs
  FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

-- Create a policy that allows users to delete their own logs
CREATE POLICY "Enable delete access for own records" ON emotion_logs
  FOR DELETE
  USING (true); -- Adjust this based on your authentication model

-- Optional: Create a view for emotion statistics
CREATE VIEW emotion_stats_30d AS
SELECT
  card_uid,
  emotion,
  COUNT(*) as count,
  MAX(timestamp) as last_logged
FROM emotion_logs
WHERE timestamp > (EXTRACT(EPOCH FROM NOW()) * 1000 - (30 * 24 * 60 * 60 * 1000))
GROUP BY card_uid, emotion
ORDER BY card_uid, count DESC;

-- Grant permissions (adjust based on your Supabase project settings)
GRANT SELECT ON emotion_logs TO authenticated;
GRANT INSERT ON emotion_logs TO authenticated;
GRANT DELETE ON emotion_logs TO authenticated;
