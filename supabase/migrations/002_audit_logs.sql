-- ============================================================
-- MIGRATION: 002_audit_logs
-- الوصف: جدول سجل العمليات — يتتبع كل إجراء ينفّذه الـ super_admin
-- التاريخ: 2026-03
-- ============================================================

CREATE TABLE audit_logs (
  id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id     UUID        REFERENCES users(id) ON DELETE SET NULL,
  actor_name   VARCHAR(100) NOT NULL,
  action       VARCHAR(60)  NOT NULL,
  entity_type  VARCHAR(40)  NOT NULL,
  entity_id    UUID,
  entity_name  VARCHAR(150),
  old_value    JSONB,
  new_value    JSONB,
  created_at   TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- ── فهارس للأداء ──────────────────────────────────────────────

CREATE INDEX idx_audit_logs_created_at   ON audit_logs (created_at DESC);
CREATE INDEX idx_audit_logs_actor_id     ON audit_logs (actor_id);
CREATE INDEX idx_audit_logs_entity_type  ON audit_logs (entity_type);
CREATE INDEX idx_audit_logs_action       ON audit_logs (action);

-- ── تفعيل RLS ─────────────────────────────────────────────────

ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- super_admin فقط يقرأ سجل العمليات
CREATE POLICY "super_admin_read_audit_logs"
  ON audit_logs FOR SELECT
  USING (get_user_role() = 'super_admin');

-- النظام يكتب السجلات عبر SECURITY DEFINER — لا يحتاج policy للـ INSERT
CREATE POLICY "super_admin_insert_audit_logs"
  ON audit_logs FOR INSERT
  WITH CHECK (get_user_role() = 'super_admin');
