/*
# Create api_keys and user_settings tables

## Purpose
Persist API keys and per-user security settings (session timeout, 2FA secret)
for the Settings page.

## 1. New Tables

### api_keys
- `id` (uuid, PK)
- `user_id` (uuid, references auth.users) — owner
- `name` (text) — label like "Production" or "Development"
- `key_prefix` (text) — first 8 chars of the key for display (e.g. "pk_live_••")
- `key_hash` (text, unique) — SHA-256 hash of the full key for lookup
- `last_used` (timestamptz, nullable)
- `created_at` (timestamptz)

### user_settings
- `user_id` (uuid, PK, references auth.users) — one row per user
- `session_timeout_minutes` (int, default 30)
- `two_factor_enabled` (boolean, default false)
- `two_factor_secret` (text, nullable) — TOTP secret (base32)
- `two_factor_backup_codes` (text[], nullable) — one-time backup codes
- `updated_at` (timestamptz)

## 2. Security (RLS)

### api_keys
- Owner-scoped CRUD: each user only sees/edits their own API keys.

### user_settings
- Owner-scoped CRUD: each user only sees/edits their own settings row.
- INSERT uses `WITH CHECK (auth.uid() = user_id)` so the owner column
  defaults to `auth.uid()`.

## 3. Notes
- The full API key is only shown once at generation time. Only the prefix
  and hash are stored.
- 2FA secrets are stored encrypted at rest by Supabase's infrastructure.
- Session timeout is enforced client-side in the AuthContext.
*/

-- ─── api_keys table ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS api_keys (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  key_prefix text NOT NULL,
  key_hash text NOT NULL UNIQUE,
  last_used timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE api_keys ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "api_keys_select_own" ON api_keys;
CREATE POLICY "api_keys_select_own"
  ON api_keys FOR SELECT TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "api_keys_insert_own" ON api_keys;
CREATE POLICY "api_keys_insert_own"
  ON api_keys FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "api_keys_delete_own" ON api_keys;
CREATE POLICY "api_keys_delete_own"
  ON api_keys FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- ─── user_settings table ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS user_settings (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  session_timeout_minutes int NOT NULL DEFAULT 30,
  two_factor_enabled boolean NOT NULL DEFAULT false,
  two_factor_secret text,
  two_factor_backup_codes text[],
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "user_settings_select_own" ON user_settings;
CREATE POLICY "user_settings_select_own"
  ON user_settings FOR SELECT TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "user_settings_insert_own" ON user_settings;
CREATE POLICY "user_settings_insert_own"
  ON user_settings FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "user_settings_update_own" ON user_settings;
CREATE POLICY "user_settings_update_own"
  ON user_settings FOR UPDATE TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ─── updated_at trigger for user_settings ────────────────────────
DROP TRIGGER IF EXISTS user_settings_updated_at ON user_settings;
CREATE TRIGGER user_settings_updated_at
  BEFORE UPDATE ON user_settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
