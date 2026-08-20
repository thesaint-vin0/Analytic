/*
# Pulse Organizations & Multi-Tenant Access

Creates the organization layer for the Pulse analytics platform.

Each user can belong to one or more organizations.
Analytics data will later belong to an organization rather than
directly to an individual user.
*/

-- ============================================================
-- ORGANIZATIONS
-- ============================================================

CREATE TABLE IF NOT EXISTS organizations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  logo_url text,
  created_by uuid NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- ============================================================
-- ORGANIZATION MEMBERS
-- ============================================================

CREATE TABLE IF NOT EXISTS organization_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL
    REFERENCES organizations(id) ON DELETE CASCADE,
  user_id uuid NOT NULL
    REFERENCES auth.users(id) ON DELETE CASCADE,

  role text NOT NULL DEFAULT 'member'
    CHECK (
      role IN (
        'owner',
        'admin',
        'manager',
        'analyst',
        'viewer'
      )
    ),

  created_at timestamptz NOT NULL DEFAULT now(),

  UNIQUE (organization_id, user_id)
);

-- ============================================================
-- INDEXES
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_organizations_created_by
  ON organizations(created_by);

CREATE INDEX IF NOT EXISTS idx_organization_members_org
  ON organization_members(organization_id);

CREATE INDEX IF NOT EXISTS idx_organization_members_user
  ON organization_members(user_id);

-- ============================================================
-- RLS
-- ============================================================

ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE organization_members ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- HELPER FUNCTIONS
-- ============================================================

CREATE OR REPLACE FUNCTION is_organization_member(
  target_organization_id uuid
)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM organization_members
    WHERE organization_id = target_organization_id
      AND user_id = auth.uid()
  );
$$;

CREATE OR REPLACE FUNCTION has_organization_role(
  target_organization_id uuid,
  allowed_roles text[]
)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM organization_members
    WHERE organization_id = target_organization_id
      AND user_id = auth.uid()
      AND role = ANY(allowed_roles)
  );
$$;

-- ============================================================
-- ORGANIZATION POLICIES
-- ============================================================

DROP POLICY IF EXISTS "organizations_select_member"
ON organizations;

CREATE POLICY "organizations_select_member"
ON organizations
FOR SELECT
TO authenticated
USING (
  is_organization_member(id)
);

DROP POLICY IF EXISTS "organizations_insert_authenticated"
ON organizations;

CREATE POLICY "organizations_insert_authenticated"
ON organizations
FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = created_by
);

DROP POLICY IF EXISTS "organizations_update_admin"
ON organizations;

CREATE POLICY "organizations_update_admin"
ON organizations
FOR UPDATE
TO authenticated
USING (
  has_organization_role(
    id,
    ARRAY['owner', 'admin']
  )
)
WITH CHECK (
  has_organization_role(
    id,
    ARRAY['owner', 'admin']
  )
);

DROP POLICY IF EXISTS "organizations_delete_owner"
ON organizations;

CREATE POLICY "organizations_delete_owner"
ON organizations
FOR DELETE
TO authenticated
USING (
  has_organization_role(
    id,
    ARRAY['owner']
  )
);

-- ============================================================
-- MEMBER POLICIES
-- ============================================================

DROP POLICY IF EXISTS "organization_members_select_member"
ON organization_members;

CREATE POLICY "organization_members_select_member"
ON organization_members
FOR SELECT
TO authenticated
USING (
  is_organization_member(organization_id)
);

DROP POLICY IF EXISTS "organization_members_insert_admin"
ON organization_members;

CREATE POLICY "organization_members_insert_admin"
ON organization_members
FOR INSERT
TO authenticated
WITH CHECK (
  has_organization_role(
    organization_id,
    ARRAY['owner', 'admin']
  )
);

DROP POLICY IF EXISTS "organization_members_update_admin"
ON organization_members;

CREATE POLICY "organization_members_update_admin"
ON organization_members
FOR UPDATE
TO authenticated
USING (
  has_organization_role(
    organization_id,
    ARRAY['owner', 'admin']
  )
)
WITH CHECK (
  has_organization_role(
    organization_id,
    ARRAY['owner', 'admin']
  )
);

DROP POLICY IF EXISTS "organization_members_delete_admin"
ON organization_members;

CREATE POLICY "organization_members_delete_admin"
ON organization_members
FOR DELETE
TO authenticated
USING (
  has_organization_role(
    organization_id,
    ARRAY['owner', 'admin']
  )
);

-- ============================================================
-- UPDATED AT
-- ============================================================

DROP TRIGGER IF EXISTS organizations_updated_at
ON organizations;

CREATE TRIGGER organizations_updated_at
BEFORE UPDATE ON organizations
FOR EACH ROW
EXECUTE FUNCTION update_updated_at();