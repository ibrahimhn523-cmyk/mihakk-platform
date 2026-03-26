-- ============================================================
-- MIGRATION: 004_platform_assets_storage
-- الوصف: سياسات Storage لـ bucket "platform-assets"
--        يُنفَّذ بعد إنشاء الـ bucket يدوياً من Supabase Dashboard
-- التاريخ: 2026-03
-- ============================================================

-- ── سياسة الرفع: super_admin فقط ─────────────────────────────

CREATE POLICY "super_admin_upload_platform_assets"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'platform-assets'
  AND get_user_role() = 'super_admin'
);

-- ── سياسة القراءة: عام (مطلوب لعرض الشعار) ───────────────────

CREATE POLICY "public_read_platform_assets"
ON storage.objects FOR SELECT
USING (bucket_id = 'platform-assets');

-- ── سياسة التحديث: super_admin فقط (upsert عند إعادة الرفع) ──

CREATE POLICY "super_admin_update_platform_assets"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'platform-assets'
  AND get_user_role() = 'super_admin'
);

-- ── سياسة الحذف: super_admin فقط ─────────────────────────────

CREATE POLICY "super_admin_delete_platform_assets"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'platform-assets'
  AND get_user_role() = 'super_admin'
);
