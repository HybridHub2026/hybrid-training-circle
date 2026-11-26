CREATE TABLE IF NOT EXISTS partner_application_images (
  submission_id TEXT PRIMARY KEY REFERENCES form_submissions(id) ON DELETE CASCADE,
  content_type TEXT NOT NULL CHECK(content_type='image/webp'),
  bytes BLOB NOT NULL,
  created_at INTEGER NOT NULL
);
