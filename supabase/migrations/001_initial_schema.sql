-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Fortunes table
CREATE TABLE fortunes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  message TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Crates table
CREATE TABLE crates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  latitude DOUBLE PRECISION NOT NULL,
  longitude DOUBLE PRECISION NOT NULL,
  fortune_id UUID NOT NULL REFERENCES fortunes(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- User collections table
CREATE TABLE user_collections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL,
  crate_id UUID NOT NULL REFERENCES crates(id),
  collected_at TIMESTAMPTZ DEFAULT NOW(),
  opened_at TIMESTAMPTZ,
  UNIQUE(user_id, crate_id)
);

-- Indexes for performance
CREATE INDEX idx_crates_location ON crates (latitude, longitude);
CREATE INDEX idx_collections_user ON user_collections (user_id);
CREATE INDEX idx_collections_crate ON user_collections (crate_id);

-- Enable Row Level Security
ALTER TABLE crates ENABLE ROW LEVEL SECURITY;
ALTER TABLE fortunes ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_collections ENABLE ROW LEVEL SECURITY;

-- RLS Policies (permissive for MVP)
CREATE POLICY "Crates are publicly readable"
  ON crates FOR SELECT
  USING (true);

CREATE POLICY "Fortunes are publicly readable"
  ON fortunes FOR SELECT
  USING (true);

CREATE POLICY "Anyone can view collections"
  ON user_collections FOR SELECT
  USING (true);

CREATE POLICY "Anyone can insert collections"
  ON user_collections FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can update collections"
  ON user_collections FOR UPDATE
  USING (true);

-- Seed fortune messages
INSERT INTO fortunes (message) VALUES
  ('The path you didn''t take is still being built.'),
  ('Someone is thinking about you right now.'),
  ('Your next big idea is already waiting for you.'),
  ('The detour becomes the destination.'),
  ('What you seek is seeking you.'),
  ('The best view comes after the hardest climb.'),
  ('Small steps still move you forward.'),
  ('Your curiosity will be rewarded.'),
  ('This moment is exactly where you need to be.'),
  ('The universe rewards the bold.'),
  ('A stranger will become a friend today.'),
  ('Your patience will pay off soon.'),
  ('The answer you need is closer than you think.'),
  ('Trust the timing of your life.'),
  ('Something wonderful is about to happen.'),
  ('Your kindness creates ripples you cannot see.'),
  ('Today''s struggle is tomorrow''s strength.'),
  ('The right door will open when you stop pushing.'),
  ('You are exactly where you need to be.'),
  ('Adventure awaits just around the corner.'),
  ('Your dreams are valid and within reach.'),
  ('Sometimes the scenic route is the best route.'),
  ('A chance encounter will change your perspective.'),
  ('Your intuition knows the way.'),
  ('The magic you seek is in the work you avoid.'),
  ('Every expert was once a beginner.'),
  ('Your story is still being written.'),
  ('The best is yet to come.'),
  ('A surprise is headed your way.'),
  ('You are capable of amazing things.'),
  ('Today is full of possibility.'),
  ('Your next chapter will be your best.'),
  ('Embrace the unknown with open arms.'),
  ('Good things come to those who wander.'),
  ('Your journey is unique and valuable.'),
  ('A moment of rest is a moment of growth.'),
  ('The universe is conspiring in your favor.'),
  ('Your presence makes a difference.'),
  ('New beginnings are disguised as endings.'),
  ('The secret to getting ahead is getting started.'),
  ('You have permission to take up space.'),
  ('Your potential is limitless.'),
  ('Today''s small win is tomorrow''s big victory.'),
  ('The wind is at your back.'),
  ('You are more resilient than you know.'),
  ('A new perspective awaits you.'),
  ('Your creativity will solve this.'),
  ('The stars are aligning for you.'),
  ('You are on the right path.'),
  ('Something you lost will return to you.'),
  ('Your voice matters more than you think.'),
  ('An unexpected gift is coming.'),
  ('You will find what you are looking for.'),
  ('The universe has your back.'),
  ('A breakthrough is near.'),
  ('Your hard work will be recognized.'),
  ('Today is a good day to try something new.'),
  ('You are braver than you believe.'),
  ('A moment of clarity is approaching.'),
  ('Your courage inspires others.'),
  ('The pieces are falling into place.'),
  ('You deserve good things.'),
  ('An opportunity will present itself soon.'),
  ('Your smile can change someone''s day.'),
  ('The journey is the reward.'),
  ('You are making progress every day.'),
  ('A beautiful friendship is forming.'),
  ('Your efforts are not in vain.'),
  ('The world needs what you have to offer.'),
  ('Today''s seeds become tomorrow''s garden.'),
  ('You have the power to create change.'),
  ('A pleasant surprise awaits you.'),
  ('Your story will inspire someone.'),
  ('The fog will lift soon.'),
  ('You are worthy of love and belonging.'),
  ('A turning point is near.'),
  ('Your light shines brighter than you know.'),
  ('Good fortune follows good intentions.'),
  ('You are exactly enough.'),
  ('The universe is listening.'),
  ('A door is opening for you.'),
  ('Your persistence will pay off.'),
  ('Today holds hidden treasures.'),
  ('You make the world a better place.'),
  ('An adventure is calling your name.'),
  ('Your dreams are not too big.'),
  ('The answers will come in time.'),
  ('You are surrounded by possibility.'),
  ('A new connection will enrich your life.'),
  ('Your path is unfolding perfectly.'),
  ('The best surprises are unplanned.'),
  ('You have everything you need within you.'),
  ('A wave of good luck is coming.'),
  ('Your future self will thank you.'),
  ('The world is waiting for your contribution.'),
  ('Today is the first day of something amazing.'),
  ('You are more powerful than you realize.'),
  ('A moment of peace will find you.'),
  ('Your journey has just begun.'),
  ('The best stories have unexpected twists.'),
  ('You are on the verge of something great.');
