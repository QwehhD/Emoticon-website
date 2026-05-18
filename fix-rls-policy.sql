-- Fix RLS Policy untuk Emotion Logs
-- Jalankan script ini di Supabase SQL Editor
-- 
-- Masalah: Policy lama memerlukan authenticated user, 
-- tapi MQTT backend menggunakan anon key
--
-- Solusi: Buat policy baru yang allow anon role untuk insert

-- Drop policy lama yang terlalu ketat
DROP POLICY IF EXISTS "Enable insert access for all authenticated users" ON emotion_logs;

-- Buat policy baru yang allow anon role untuk insert
CREATE POLICY "Enable insert access for anon users" ON emotion_logs
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- Verifikasi policy yang aktif
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'emotion_logs'
ORDER BY policyname;
