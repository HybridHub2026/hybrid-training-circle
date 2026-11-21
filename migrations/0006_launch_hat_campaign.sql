CREATE TABLE IF NOT EXISTS launch_hat_settings (id INTEGER PRIMARY KEY CHECK(id=1),launched_at INTEGER,created_at INTEGER NOT NULL);
CREATE TABLE IF NOT EXISTS launch_hat_slots (slot INTEGER PRIMARY KEY CHECK(slot BETWEEN 1 AND 100),submission_id TEXT UNIQUE REFERENCES form_submissions(id) ON DELETE SET NULL,email_key TEXT UNIQUE,code TEXT UNIQUE,claim_id TEXT UNIQUE,language TEXT,consent_text TEXT,claimed_at INTEGER,redeemed_at INTEGER,order_reference TEXT UNIQUE,person_confirmed_at INTEGER);
INSERT INTO launch_hat_settings(id,created_at) VALUES(1,unixepoch()*1000) ON CONFLICT DO NOTHING;
WITH RECURSIVE numbers(n) AS (SELECT 1 UNION ALL SELECT n+1 FROM numbers WHERE n<100) INSERT OR IGNORE INTO launch_hat_slots(slot) SELECT n FROM numbers;
