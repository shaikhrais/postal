-- D1 migration: create api_keys table and seed a demo key
CREATE TABLE IF NOT EXISTS api_keys (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  owner TEXT,
  key TEXT UNIQUE,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Seed a demo key (INSERT OR IGNORE protects idempotency)
INSERT OR IGNORE INTO api_keys (owner, key) VALUES ('demo', 'test');
