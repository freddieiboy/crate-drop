-- Seed crates around Utrecht city center (Dom Tower area)
-- Run this in the Supabase SQL Editor after running the initial migration

-- Insert crates with random fortunes
INSERT INTO crates (latitude, longitude, fortune_id)
SELECT lat, lng, (SELECT id FROM fortunes ORDER BY RANDOM() LIMIT 1)
FROM (VALUES
  -- Near Dom Tower
  (52.0907, 5.1214),
  (52.0912, 5.1220),
  (52.0902, 5.1208),

  -- Oudegracht canal area
  (52.0895, 5.1185),
  (52.0888, 5.1178),
  (52.0918, 5.1195),

  -- Near Centraal Station
  (52.0894, 5.1100),
  (52.0890, 5.1115),

  -- Neude square area
  (52.0925, 5.1175),
  (52.0930, 5.1168),

  -- Vredenburg area
  (52.0920, 5.1135),
  (52.0915, 5.1148),

  -- Near Utrecht University / Drift
  (52.0885, 5.1235),
  (52.0878, 5.1245),
  (52.0870, 5.1255)
) AS t(lat, lng);

-- Show what was created
SELECT c.id, c.latitude, c.longitude, f.message
FROM crates c
JOIN fortunes f ON c.fortune_id = f.id;
