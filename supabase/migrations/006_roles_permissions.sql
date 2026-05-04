CREATE TABLE roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE NOT NULL,
  name VARCHAR(50) NOT NULL,
  permissions JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (tenant_id, name)
);

CREATE TABLE user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  role_id UUID REFERENCES roles(id) ON DELETE CASCADE NOT NULL,
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (user_id, role_id, tenant_id)
);

CREATE TABLE parent_student_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE NOT NULL,
  parent_user_id UUID NOT NULL,
  student_id UUID REFERENCES students(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (tenant_id, parent_user_id, student_id)
);

ALTER TABLE roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE parent_student_links ENABLE ROW LEVEL SECURITY;

CREATE POLICY "tenant_isolation" ON roles FOR ALL USING (tenant_id = get_user_tenant_id());
CREATE POLICY "tenant_isolation" ON user_roles FOR ALL USING (tenant_id = get_user_tenant_id());
CREATE POLICY "tenant_isolation" ON parent_student_links FOR ALL USING (tenant_id = get_user_tenant_id());

-- Seed default roles for new tenants via function
CREATE OR REPLACE FUNCTION seed_default_roles(p_tenant_id UUID)
RETURNS VOID LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  INSERT INTO roles (tenant_id, name, permissions) VALUES
    (p_tenant_id, 'program_manager', '{"students":["read","create","update","delete"],"programs":["read","create","update","delete"],"enrollments":["read","create","update","delete"],"payments":["read","create","update","delete"],"attendance":["read","create","update","delete"],"reports":["read"]}'),
    (p_tenant_id, 'supervisor',      '{"students":["read"],"programs":["read"],"enrollments":["read"],"attendance":["read","create","update"],"reports":["read"]}'),
    (p_tenant_id, 'accountant',      '{"students":["read"],"enrollments":["read"],"payments":["read","create","update"],"reports":["read"]}'),
    (p_tenant_id, 'media',           '{"students":["read"],"programs":["read"]}'),
    (p_tenant_id, 'student',         '{"enrollments":["read"],"attendance":["read"]}'),
    (p_tenant_id, 'parent',          '{"enrollments":["read"],"attendance":["read"],"payments":["read"]}')
  ON CONFLICT (tenant_id, name) DO NOTHING;
END;
$$;
