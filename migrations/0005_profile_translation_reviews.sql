CREATE TABLE IF NOT EXISTS profile_translation_reviews (
  profile_id TEXT NOT NULL REFERENCES member_profiles(id) ON DELETE CASCADE,
  language TEXT NOT NULL CHECK(language IN ('es','en')),
  source_snapshot TEXT NOT NULL,
  target_snapshot TEXT NOT NULL,
  reviewed_at INTEGER NOT NULL,
  PRIMARY KEY(profile_id,language)
);
