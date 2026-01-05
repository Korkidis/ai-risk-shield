-- Run this in Supabase SQL Editor to see scan results

-- 1. Check latest scan
SELECT
  id,
  file_name,
  status,
  overall_risk_level,
  overall_risk_score,
  ip_risk_score,
  brand_safety_risk_score,
  created_at,
  completed_at
FROM scans
ORDER BY created_at DESC
LIMIT 1;

-- 2. Check IP detections for latest scan
SELECT
  detection_type,
  entity_name,
  confidence_score
FROM ip_detections
WHERE scan_id = (SELECT id FROM scans ORDER BY created_at DESC LIMIT 1);

-- 3. Check brand safety violations for latest scan
SELECT
  category,
  severity,
  confidence_score,
  description
FROM brand_safety_violations
WHERE scan_id = (SELECT id FROM scans ORDER BY created_at DESC LIMIT 1);
