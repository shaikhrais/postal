param(
  [string]$DbName = "postal_api_keys"
)

# Creates the api_keys table (if missing) and inserts a demo API key.
# Requires `wrangler` in PATH and an authenticated session (or use --api-token).

$create = "CREATE TABLE IF NOT EXISTS api_keys (id INTEGER PRIMARY KEY AUTOINCREMENT, owner TEXT, key TEXT UNIQUE, created_at DATETIME DEFAULT CURRENT_TIMESTAMP);"
$insert = "INSERT OR IGNORE INTO api_keys (owner, key) VALUES ('demo', 'test');"

Write-Output "Running D1 migration: create table if missing..."
wrangler d1 execute $DbName --remote --command $create

Write-Output "Seeding demo API key (idempotent)..."
wrangler d1 execute $DbName --remote --command $insert

Write-Output "Done. Verify with: wrangler d1 execute $DbName --remote --command \"SELECT id, owner, key, created_at FROM api_keys;\""
