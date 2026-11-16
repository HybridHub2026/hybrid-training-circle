PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS form_submissions (
  id TEXT PRIMARY KEY,
  kind TEXT NOT NULL CHECK(kind IN ('launch','contact')),
  language TEXT NOT NULL CHECK(language IN ('pt','es','en')),
  email TEXT NOT NULL,
  name TEXT NOT NULL DEFAULT '',
  subject TEXT NOT NULL DEFAULT '',
  message TEXT NOT NULL DEFAULT '',
  consent_text TEXT NOT NULL,
  request_hash TEXT NOT NULL,
  created_at INTEGER NOT NULL
);
CREATE UNIQUE INDEX IF NOT EXISTS unique_launch_email ON form_submissions(email) WHERE kind='launch';

CREATE TABLE IF NOT EXISTS form_mail_outbox (
  id TEXT PRIMARY KEY,
  submission_id TEXT NOT NULL REFERENCES form_submissions(id) ON DELETE CASCADE,
  recipient TEXT NOT NULL CHECK(recipient IN ('user','admin')),
  state TEXT NOT NULL DEFAULT 'pending' CHECK(state IN ('pending','sending','sent','review')),
  attempts INTEGER NOT NULL DEFAULT 0,
  next_attempt_at INTEGER NOT NULL DEFAULT 0,
  lease_until INTEGER NOT NULL DEFAULT 0,
  first_attempt_at INTEGER,
  message_id TEXT,
  last_error TEXT
);
CREATE INDEX IF NOT EXISTS pending_form_mail ON form_mail_outbox(state,next_attempt_at);

CREATE TABLE IF NOT EXISTS form_mail_budget (
  day TEXT PRIMARY KEY,
  used INTEGER NOT NULL DEFAULT 0
);
