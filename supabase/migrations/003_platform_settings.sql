-- ============================================================
-- MIGRATION: 003_platform_settings
-- الوصف: إعدادات المنصة (محك نفسها) — منفصلة عن tenant_branding
--        لأن المنصة ليست منشأة، وtenant_id في tenant_branding NOT NULL
-- التاريخ: 2026-03
-- ============================================================

CREATE TABLE platform_settings (
  id               UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  platform_name    VARCHAR(100) NOT NULL DEFAULT 'محك',
  support_email    VARCHAR(150),
  primary_color    VARCHAR(7)   NOT NULL DEFAULT '#0F172A'
                               CHECK (primary_color ~ '^#[0-9A-Fa-f]{6}$'),
  secondary_color  VARCHAR(7)   NOT NULL DEFAULT '#6366F1'
                               CHECK (secondary_color ~ '^#[0-9A-Fa-f]{6}$'),
  logo_url         TEXT,
  font_arabic      VARCHAR(30)  NOT NULL DEFAULT 'Tajawal'
                               CHECK (font_arabic IN ('Tajawal','Cairo','Noto Kufi Arabic','IBM Plex Arabic')),
  font_latin       VARCHAR(30)  NOT NULL DEFAULT 'Inter'
                               CHECK (font_latin IN ('Inter','DM Sans','Poppins','Plus Jakarta Sans')),
  updated_at       TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- ── سجل واحد فقط دائماً ──────────────────────────────────────

INSERT INTO platform_settings (id) VALUES (gen_random_uuid());

-- ── RLS ───────────────────────────────────────────────────────

ALTER TABLE platform_settings ENABLE ROW LEVEL SECURITY;

-- super_admin يقرأ ويعدّل
CREATE POLICY "super_admin_manage_platform_settings"
  ON platform_settings FOR ALL
  USING (get_user_role() = 'super_admin');

-- أي مستخدم مسجّل يقرأ (مطلوب لتطبيق الـ CSS Variables)
CREATE POLICY "authenticated_read_platform_settings"
  ON platform_settings FOR SELECT
  TO authenticated
  USING (true);
