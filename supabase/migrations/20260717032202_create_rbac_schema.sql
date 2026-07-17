/*
# Create RBAC schema: profiles, notifications, audit_logs

## Purpose
Enables role-based access control (RBAC) for the analytics dashboard. Each
authenticated user has a profile row with an assigned role. Notifications and
audit logs are persisted per user.

## 1. New Tables

### profiles
- `id` (uuid, PK, references auth.users) — one row per auth user
- `email` (text) — denormalized for fast listing
- `full_name` (text) — display name
- `role` (text, default 'viewer') — one of: super_admin, admin, manager, analyst, viewer
- `avatar_url` (text, nullable)
- `created_at` (timestamptz)
- `updated_at` (timestamptz)

### notifications
- `id` (uuid, PK)
- `user_id` (uuid, references auth.users) — owner
- `title` (text)
- `message` (text)
- `type` (text) — success | warning | error | info
- `read` (boolean, default false)
- `created_at` (timestamptz)

### audit_logs
- `id` (uuid, PK)
- `user_id` (uuid, references auth.users) — who performed the action
- `action` (text) — e.g. 'login', 'update_role', 'delete_user'
- `target_user_id` (uuid, nullable) — subject of the action
- `details` (text)
- `created_at` (timestamptz)

## 2. Security (RLS)

### profiles
- SELECT: authenticated users can read all profiles (needed for user management UI).
- INSERT: a user can insert their own profile row on signup.
- UPDATE: a user can update their own profile; super_admins can update any profile.
- DELETE: only super_admins can delete profiles.

### notifications
- Full owner-scoped CRUD: each user only sees/edits their own notifications.

### audit_logs
- SELECT: super_admin only (audit trail visibility).
- INSERT: any authenticated user can insert a log row.
- UPDATE/DELETE: blocked (audit logs are immutable).

## 3. Helper function
- `is_super_admin()` — returns true if the current user's profile role is 'super_admin'.

## 4. Trigger
- `handle_new_user` — auto-creates a profile row on signup. First user = super_admin.
*/

-- ─── profiles table (must exist before is_super_admin function) ──
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL,
  full_name text NOT NULL DEFAULT '',
  role text NOT NULL DEFAULT 'viewer'
    CHECK (role IN ('super_admin', 'admin', 'manager', 'analyst', 'viewer')),
  avatar_url text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- ─── Helper function: is_super_admin ─────────────────────────────
CREATE OR REPLACE FUNCTION is_super_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role = 'super_admin'
  );
$$;

-- ─── profiles RLS ────────────────────────────────────────────────
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "profiles_select_all" ON profiles;
CREATE POLICY "profiles_select_all"
  ON profiles FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "profiles_insert_own" ON profiles;
CREATE POLICY "profiles_insert_own"
  ON profiles FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "profiles_update_own_or_admin" ON profiles;
CREATE POLICY "profiles_update_own_or_admin"
  ON profiles FOR UPDATE TO authenticated
  USING (auth.uid() = id OR is_super_admin())
  WITH CHECK (auth.uid() = id OR is_super_admin());

DROP POLICY IF EXISTS "profiles_delete_admin_only" ON profiles;
CREATE POLICY "profiles_delete_admin_only"
  ON profiles FOR DELETE TO authenticated
  USING (is_super_admin());

-- ─── notifications table ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  message text NOT NULL,
  type text NOT NULL DEFAULT 'info'
    CHECK (type IN ('success', 'warning', 'error', 'info')),
  read boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "notif_select_own" ON notifications;
CREATE POLICY "notif_select_own"
  ON notifications FOR SELECT TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "notif_insert_own" ON notifications;
CREATE POLICY "notif_insert_own"
  ON notifications FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "notif_update_own" ON notifications;
CREATE POLICY "notif_update_own"
  ON notifications FOR UPDATE TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "notif_delete_own" ON notifications;
CREATE POLICY "notif_delete_own"
  ON notifications FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

-- ─── audit_logs table ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  action text NOT NULL,
  target_user_id uuid,
  details text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "audit_select_admin" ON audit_logs;
CREATE POLICY "audit_select_admin"
  ON audit_logs FOR SELECT TO authenticated USING (is_super_admin());

DROP POLICY IF EXISTS "audit_insert_any" ON audit_logs;
CREATE POLICY "audit_insert_any"
  ON audit_logs FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- ─── Trigger: auto-create profile on signup ──────────────────────
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  user_count integer;
  assigned_role text;
BEGIN
  SELECT count(*) INTO user_count FROM profiles;
  IF user_count = 0 THEN
    assigned_role := 'super_admin';
  ELSE
    assigned_role := 'viewer';
  END IF;

  INSERT INTO profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.email, ''),
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    assigned_role
  )
  ON CONFLICT (id) DO NOTHING;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ─── updated_at trigger for profiles ─────────────────────────────
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS profiles_updated_at ON profiles;
CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
