CREATE TABLE IF NOT EXISTS profile_translation_budget (
  id TEXT PRIMARY KEY,
  day TEXT NOT NULL,
  used INTEGER NOT NULL,
  last_at INTEGER NOT NULL
);
CREATE TABLE IF NOT EXISTS profile_translation_cache (
  id TEXT PRIMARY KEY,
  translated_text TEXT NOT NULL,
  created_at INTEGER NOT NULL
);
