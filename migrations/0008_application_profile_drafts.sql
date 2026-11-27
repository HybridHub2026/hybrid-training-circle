-- A source request can create only one managed profile. It remains a private
-- draft until the owner reviews translations and explicitly authorizes publication.
CREATE TABLE IF NOT EXISTS member_profile_applications (
  submission_id TEXT PRIMARY KEY,
  profile_id TEXT NOT NULL UNIQUE REFERENCES member_profiles(id),
  created_at INTEGER NOT NULL
);
