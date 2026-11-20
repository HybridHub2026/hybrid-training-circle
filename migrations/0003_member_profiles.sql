CREATE TABLE IF NOT EXISTS member_profiles (
  id TEXT PRIMARY KEY,
  payload TEXT NOT NULL,
  published_payload TEXT,
  revision INTEGER NOT NULL DEFAULT 1,
  updated_at INTEGER NOT NULL,
  published_at INTEGER,
  permission_confirmed_at INTEGER,
  archived_at INTEGER
);
CREATE TABLE IF NOT EXISTS member_profile_images (
  id TEXT PRIMARY KEY,
  content_type TEXT NOT NULL,
  bytes BLOB NOT NULL,
  created_at INTEGER NOT NULL
);
