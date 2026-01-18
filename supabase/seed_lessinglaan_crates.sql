-- Seed crates around Lessinglaan 44, 3533AX Utrecht (Tuindorp area)
-- Run this in the Supabase SQL Editor

-- Insert crates with random fortunes around your location
INSERT INTO crates (latitude, longitude, fortune_id)
SELECT lat, lng, (SELECT id FROM fortunes ORDER BY RANDOM() LIMIT 1)
FROM (VALUES
  -- Right at your street
  (52.1048, 5.1283),
  (52.1052, 5.1278),
  (52.1045, 5.1290),

  -- Nearby streets (within 1-2 min walk)
  (52.1055, 5.1270),
  (52.1042, 5.1275),
  (52.1058, 5.1285),
  (52.1040, 5.1295),

  -- Slightly further (2-3 min walk)
  (52.1062, 5.1265),
  (52.1038, 5.1300),
  (52.1065, 5.1290),
  (52.1035, 5.1270),

  -- Around the neighborhood (3-5 min walk)
  (52.1070, 5.1275),
  (52.1030, 5.1285),
  (52.1055, 5.1255),
  (52.1048, 5.1310)
) AS t(lat, lng);

-- Show what was created
SELECT c.id, c.latitude, c.longitude, f.message
FROM crates c
JOIN fortunes f ON c.fortune_id = f.id
ORDER BY c.created_at DESC
LIMIT 15;
