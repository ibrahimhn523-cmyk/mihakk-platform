CREATE TABLE programs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE NOT NULL,
  name VARCHAR(100) NOT NULL,
  season VARCHAR(50),
  start_date DATE,
  end_date DATE,
  price_full NUMERIC(10,2),
  price_first NUMERIC(10,2),
  price_second NUMERIC(10,2),
  price_trial NUMERIC(10,2),
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active','completed','cancelled')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE students (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE NOT NULL,
  full_name VARCHAR(100) NOT NULL,
  grade VARCHAR(50),
  guardian_name VARCHAR(100),
  guardian_phone VARCHAR(20),
  guardian_phone2 VARCHAR(20),
  notes TEXT,
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active','inactive')),
  deleted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE enrollments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE NOT NULL,
  student_id UUID REFERENCES students(id),
  program_id UUID REFERENCES programs(id),
  subscription_type VARCHAR(20) CHECK (subscription_type IN ('full','first','second','trial')),
  amount_due NUMERIC(10,2),
  amount_paid NUMERIC(10,2) DEFAULT 0,
  start_date DATE,
  end_date DATE,
  status VARCHAR(20) DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE NOT NULL,
  enrollment_id UUID REFERENCES enrollments(id),
  amount NUMERIC(10,2) NOT NULL,
  method VARCHAR(30) CHECK (method IN ('cash','bank_transfer','stc_pay','other')),
  method_note TEXT,
  paid_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID,
  notes TEXT
);

CREATE TABLE attendance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE NOT NULL,
  student_id UUID REFERENCES students(id),
  program_id UUID REFERENCES programs(id),
  session_date DATE NOT NULL,
  status VARCHAR(20) CHECK (status IN ('present','absent','late','excused')),
  notes TEXT,
  created_by UUID,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance ENABLE ROW LEVEL SECURITY;

CREATE POLICY "tenant_isolation" ON programs FOR ALL USING (tenant_id = get_user_tenant_id());
CREATE POLICY "tenant_isolation" ON students FOR ALL USING (tenant_id = get_user_tenant_id());
CREATE POLICY "tenant_isolation" ON enrollments FOR ALL USING (tenant_id = get_user_tenant_id());
CREATE POLICY "tenant_isolation" ON payments FOR ALL USING (tenant_id = get_user_tenant_id());
CREATE POLICY "tenant_isolation" ON attendance FOR ALL USING (tenant_id = get_user_tenant_id());
