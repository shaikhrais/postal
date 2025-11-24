-- D1 schema for Postal PoC
-- Create a simple api_keys table for storing issued API keys and metadata

CREATE TABLE IF NOT EXISTS api_keys (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  owner TEXT NOT NULL,
  key TEXT NOT NULL UNIQUE,
  created_at TEXT DEFAULT (datetime('now')),
  revoked INTEGER DEFAULT 0
);

-- Example insert (do not use in production):
-- INSERT INTO api_keys (owner, key) VALUES ('demo', 'test');
