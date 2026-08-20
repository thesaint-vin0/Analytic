/*
# Create organization RPC

Creates an organization and automatically makes the authenticated
user its owner.

This is performed inside a SECURITY DEFINER function so the first
organization member can be created safely without weakening RLS.
*/

CREATE OR REPLACE FUNCTION create_organization(
  organization_name text,
  organization_slug text
)
RETURNS organizations
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_organization organizations;
BEGIN
  -- Require authentication
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;

  -- Validate organization name
  IF trim(organization_name) = '' THEN
    RAISE EXCEPTION 'Organization name is required';
  END IF;

  -- Validate slug
  IF trim(organization_slug) = '' THEN
    RAISE EXCEPTION 'Organization slug is required';
  END IF;

  -- Create organization
  INSERT INTO organizations (
    name,
    slug,
    created_by
  )
  VALUES (
    trim(organization_name),
    lower(trim(organization_slug)),
    auth.uid()
  )
  RETURNING * INTO new_organization;

  -- Make creator the owner
  INSERT INTO organization_members (
    organization_id,
    user_id,
    role
  )
  VALUES (
    new_organization.id,
    auth.uid(),
    'owner'
  );

  RETURN new_organization;
END;
$$;

-- Only authenticated users can call it
REVOKE EXECUTE
ON FUNCTION create_organization(text, text)
FROM PUBLIC;

GRANT EXECUTE
ON FUNCTION create_organization(text, text)
TO authenticated;