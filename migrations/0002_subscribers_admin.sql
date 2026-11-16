CREATE TABLE IF NOT EXISTS admin_login_rate (
  id TEXT PRIMARY KEY CHECK(id='owner'),
  day TEXT NOT NULL,
  count INTEGER NOT NULL,
  last_sent INTEGER NOT NULL
);
CREATE TABLE IF NOT EXISTS admin_login_challenges (
  id TEXT PRIMARY KEY,
  code_hash TEXT NOT NULL,
  expires_at INTEGER NOT NULL,
  attempts INTEGER NOT NULL DEFAULT 0,
  used_at INTEGER
);
CREATE TABLE IF NOT EXISTS admin_sessions (
  token_hash TEXT PRIMARY KEY,
  expires_at INTEGER NOT NULL
);
