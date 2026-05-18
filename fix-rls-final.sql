-- ============================================
-- Fix RLS Policy - Final Solution
-- ============================================
-- Masalah: Policy sudah ada tapi roles masih {public}
-- Solusi: Ganti policy INSERT agar explicitly allow anon role
-- ============================================

-- Drop policy INSERT yang ada
DROP POLICY IF EXISTS "Allow anon and authenticated insert" ON emotion_logs;

-- Buat policy baru yang explicitly untuk anon role
CREATE POLICY "Allow anon insert" ON emotion_logs
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- Buat policy untuk authenticated juga (optional)
CREATE POLICY "Allow authenticated insert" ON emotion_logs
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Verifikasi
SELECT 
  policyname,
  roles,
  cmd,
  with_check
FROM pg_policies
WHERE tablename = 'emotion_logs' AND cmd = 'INSERT'
ORDER BY policyname;
