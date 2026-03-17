-- ============================================================
-- MIGRATION: 001_initial_schema
-- الوصف: الهيكل الأساسي لقاعدة بيانات منصة محك
-- التاريخ: 2026-03
-- ============================================================

-- ── Sub-section: تفعيل امتدادات PostgreSQL المطلوبة ──────────────────────
CREATE EXTENSION IF NOT EXISTS "pgcrypto";


-- ============================================================
-- SECTION: [1] tenants — المنشآت
-- الوصف: الجدول الجذر — كل شيء في المنصة يتفرع منه
-- ============================================================

CREATE TABLE tenants (
  id           UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  name         VARCHAR(100) NOT NULL,
  subdomain    VARCHAR(50)  NOT NULL UNIQUE,
  status       VARCHAR(20)  NOT NULL DEFAULT 'trial'
                            CHECK (status IN ('active', 'trial', 'suspended', 'expired')),
  created_at   TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  created_by   UUID
);


-- ============================================================
-- SECTION: [2] tenant_owners — ملاك المنشآت
-- الوصف: شخص واحد أو أكثر مرتبطون بمنشأة — بيانات التواصل الرئيسية
-- ============================================================

CREATE TABLE tenant_owners (
  id           UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id    UUID         NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  full_name    VARCHAR(100) NOT NULL,
  phone        VARCHAR(20)  NOT NULL,
  email        VARCHAR(150),
  created_at   TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);


-- ============================================================
-- SECTION: [3] subscriptions — الاشتراكات
-- الوصف: خطة الاشتراك الفعّالة لكل منشأة وتواريخها
-- ============================================================

CREATE TABLE subscriptions (
  id           UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id    UUID         NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  plan         VARCHAR(20)  NOT NULL DEFAULT 'trial'
                            CHECK (plan IN ('trial', 'basic', 'advanced')),
  starts_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  ends_at      TIMESTAMPTZ  NOT NULL,
  is_active    BOOLEAN      NOT NULL DEFAULT TRUE,
  created_at   TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);


-- ============================================================
-- SECTION: [4] tenant_limits — حدود الاستخدام
-- الوصف: الحد الأقصى المسموح به لكل منشأة حسب خطة الاشتراك
-- ============================================================

CREATE TABLE tenant_limits (
  id               UUID     PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id        UUID     NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  max_students     INTEGER  NOT NULL DEFAULT 50  CHECK (max_students > 0),
  max_programs     INTEGER  NOT NULL DEFAULT 3   CHECK (max_programs > 0),
  max_users        INTEGER  NOT NULL DEFAULT 5   CHECK (max_users > 0),
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


-- ============================================================
-- SECTION: [5] tenant_services — الخدمات المفعّلة
-- الوصف: قائمة الخدمات (core/addon) المفعّلة لكل منشأة
-- ============================================================

CREATE TABLE tenant_services (
  id             UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id      UUID        NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  service_key    VARCHAR(50) NOT NULL,
  is_enabled     BOOLEAN     NOT NULL DEFAULT FALSE,
  service_type   VARCHAR(10) NOT NULL DEFAULT 'core'
                             CHECK (service_type IN ('core', 'addon')),
  enabled_at     TIMESTAMPTZ,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (tenant_id, service_key)
);


-- ============================================================
-- SECTION: [6] users — المستخدمون
-- الوصف: كل مستخدمي المنصة — super_admin لا يرتبط بمنشأة (tenant_id = NULL)
-- ============================================================

CREATE TABLE users (
  id               UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id        UUID        REFERENCES tenants(id) ON DELETE CASCADE,
  full_name        VARCHAR(100) NOT NULL,
  phone            VARCHAR(20)  NOT NULL,
  role             VARCHAR(30)  NOT NULL
                               CHECK (role IN ('super_admin', 'owner', 'program_manager', 'supervisor')),
  must_change_pwd  BOOLEAN      NOT NULL DEFAULT TRUE,
  is_active        BOOLEAN      NOT NULL DEFAULT TRUE,
  created_at       TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);


-- ============================================================
-- SECTION: [7] tenant_branding — الهوية البصرية
-- الوصف: ألوان وخطوط وشعار كل منشأة — تُطبَّق عبر CSS Variables
-- ============================================================

CREATE TABLE tenant_branding (
  id                    UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id             UUID         NOT NULL UNIQUE REFERENCES tenants(id) ON DELETE CASCADE,
  primary_color         VARCHAR(7)   NOT NULL DEFAULT '#0F172A'
                                     CHECK (primary_color ~ '^#[0-9A-Fa-f]{6}$'),
  secondary_color       VARCHAR(7)   NOT NULL DEFAULT '#6366F1'
                                     CHECK (secondary_color ~ '^#[0-9A-Fa-f]{6}$'),
  logo_url              TEXT,
  font_arabic           VARCHAR(30)  NOT NULL DEFAULT 'Tajawal'
                                     CHECK (font_arabic IN ('Tajawal', 'Cairo', 'Noto Kufi Arabic', 'IBM Plex Arabic')),
  font_latin            VARCHAR(30)  NOT NULL DEFAULT 'Inter'
                                     CHECK (font_latin IN ('Inter', 'DM Sans', 'Poppins', 'Plus Jakarta Sans')),
  sidebar_hidden_items  JSONB        NOT NULL DEFAULT '[]',
  created_at            TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);


-- ============================================================
-- SECTION: [8] integrations — التكاملات الخارجية
-- الوصف: إعدادات ربط الخدمات الخارجية لكل منشأة (WhatsApp, SMS, إلخ)
-- ============================================================

CREATE TABLE integrations (
  id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id    UUID        NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  provider     VARCHAR(20) NOT NULL
                           CHECK (provider IN ('whatsapp', 'sms', 'payment', 'accounting', 'crm')),
  config       JSONB       NOT NULL DEFAULT '{}',
  is_active    BOOLEAN     NOT NULL DEFAULT FALSE,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (tenant_id, provider)
);


-- ============================================================
-- SECTION: Row Level Security — تفعيل الحماية على كل جدول
-- الوصف: يمنع أي وصول مباشر بدون سياسة صريحة
-- ============================================================

ALTER TABLE tenants          ENABLE ROW LEVEL SECURITY;
ALTER TABLE tenant_owners    ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions    ENABLE ROW LEVEL SECURITY;
ALTER TABLE tenant_limits    ENABLE ROW LEVEL SECURITY;
ALTER TABLE tenant_services  ENABLE ROW LEVEL SECURITY;
ALTER TABLE users            ENABLE ROW LEVEL SECURITY;
ALTER TABLE tenant_branding  ENABLE ROW LEVEL SECURITY;
ALTER TABLE integrations     ENABLE ROW LEVEL SECURITY;


-- ============================================================
-- SECTION: RLS Policies — سياسات الوصول
-- ── Sub-section: دالة مساعدة للتحقق من دور المستخدم ──────────
-- ============================================================

CREATE OR REPLACE FUNCTION get_user_role()
RETURNS VARCHAR AS $$
  SELECT role FROM users WHERE id = auth.uid()
$$ LANGUAGE sql SECURITY DEFINER STABLE;

CREATE OR REPLACE FUNCTION get_user_tenant_id()
RETURNS UUID AS $$
  SELECT tenant_id FROM users WHERE id = auth.uid()
$$ LANGUAGE sql SECURITY DEFINER STABLE;


-- ── Sub-section: سياسات جدول tenants ─────────────────────────

-- super_admin يرى كل المنشآت
CREATE POLICY "super_admin_all_tenants"
  ON tenants FOR ALL
  USING (get_user_role() = 'super_admin');

-- المستخدم العادي يرى منشأته فقط
CREATE POLICY "tenant_user_own_tenant"
  ON tenants FOR SELECT
  USING (id = get_user_tenant_id());


-- ── Sub-section: سياسات جدول tenant_owners ───────────────────

CREATE POLICY "super_admin_all_tenant_owners"
  ON tenant_owners FOR ALL
  USING (get_user_role() = 'super_admin');

CREATE POLICY "tenant_user_own_tenant_owners"
  ON tenant_owners FOR SELECT
  USING (tenant_id = get_user_tenant_id());


-- ── Sub-section: سياسات جدول subscriptions ───────────────────

CREATE POLICY "super_admin_all_subscriptions"
  ON subscriptions FOR ALL
  USING (get_user_role() = 'super_admin');

CREATE POLICY "tenant_user_own_subscriptions"
  ON subscriptions FOR SELECT
  USING (tenant_id = get_user_tenant_id());


-- ── Sub-section: سياسات جدول tenant_limits ───────────────────

CREATE POLICY "super_admin_all_tenant_limits"
  ON tenant_limits FOR ALL
  USING (get_user_role() = 'super_admin');

CREATE POLICY "tenant_user_own_tenant_limits"
  ON tenant_limits FOR SELECT
  USING (tenant_id = get_user_tenant_id());


-- ── Sub-section: سياسات جدول tenant_services ─────────────────

CREATE POLICY "super_admin_all_tenant_services"
  ON tenant_services FOR ALL
  USING (get_user_role() = 'super_admin');

CREATE POLICY "tenant_user_own_tenant_services"
  ON tenant_services FOR SELECT
  USING (tenant_id = get_user_tenant_id());


-- ── Sub-section: سياسات جدول users ───────────────────────────

CREATE POLICY "super_admin_all_users"
  ON users FOR ALL
  USING (get_user_role() = 'super_admin');

-- المستخدم يرى زملاءه في نفس المنشأة فقط
CREATE POLICY "tenant_user_own_users"
  ON users FOR SELECT
  USING (tenant_id = get_user_tenant_id());

-- المستخدم يعدّل بياناته الشخصية فقط
CREATE POLICY "user_update_own_profile"
  ON users FOR UPDATE
  USING (id = auth.uid());


-- ── Sub-section: سياسات جدول tenant_branding ─────────────────

CREATE POLICY "super_admin_all_branding"
  ON tenant_branding FOR ALL
  USING (get_user_role() = 'super_admin');

CREATE POLICY "tenant_user_own_branding"
  ON tenant_branding FOR SELECT
  USING (tenant_id = get_user_tenant_id());

-- owner فقط يعدّل إعدادات الهوية البصرية
CREATE POLICY "owner_update_own_branding"
  ON tenant_branding FOR UPDATE
  USING (
    tenant_id = get_user_tenant_id()
    AND get_user_role() = 'owner'
  );


-- ── Sub-section: سياسات جدول integrations ────────────────────

CREATE POLICY "super_admin_all_integrations"
  ON integrations FOR ALL
  USING (get_user_role() = 'super_admin');

CREATE POLICY "tenant_user_own_integrations"
  ON integrations FOR SELECT
  USING (tenant_id = get_user_tenant_id());

-- owner فقط يعدّل إعدادات التكاملات
CREATE POLICY "owner_manage_own_integrations"
  ON integrations FOR ALL
  USING (
    tenant_id = get_user_tenant_id()
    AND get_user_role() = 'owner'
  );


-- ============================================================
-- ملاحظة: ترتيب تنفيذ الجداول وسبب الترتيب
-- ============================================================
--
-- الترتيب مبني على تبعيات الـ Foreign Keys:
--
-- [1] tenants
--     الجدول الجذر — لا يعتمد على أي جدول آخر
--     يجب إنشاؤه أولاً لأن كل الجداول التالية تشير إليه
--
-- [2] tenant_owners
--     يعتمد على: tenants
--     معلومات المالك مرتبطة بالمنشأة مباشرة
--
-- [3] subscriptions
--     يعتمد على: tenants
--     يجب أن تُنشأ المنشأة قبل إنشاء اشتراكها
--
-- [4] tenant_limits
--     يعتمد على: tenants
--     الحدود تُحدَّد بعد إنشاء الاشتراك مباشرة
--
-- [5] tenant_services
--     يعتمد على: tenants
--     الخدمات تُفعَّل بعد تحديد الحدود
--
-- [6] users
--     يعتمد على: tenants
--     المستخدمون يُنشؤون بعد تجهيز المنشأة كاملاً
--     tenant_id قابل للـ NULL لأن super_admin لا ينتمي لمنشأة
--
-- [7] tenant_branding
--     يعتمد على: tenants
--     الهوية البصرية اختيارية — تُضاف بعد إنشاء المنشأة
--     UNIQUE على tenant_id: منشأة واحدة = سجل هوية واحد
--
-- [8] integrations
--     يعتمد على: tenants
--     التكاملات تُضاف في مرحلة لاحقة حسب الطلب
--     UNIQUE على (tenant_id, provider): لا تكرار لنفس المزود
--
-- ============================================================
