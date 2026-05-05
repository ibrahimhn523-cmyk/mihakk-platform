# CLAUDE.md — منصة محك (Mihakk Platform)
> هذا الملف هو الدماغ الدائم للمشروع. اقرأه كاملاً في بداية كل جلسة. لا تتجاوز أي بند.

---

## ١. هوية المشروع

**الاسم:** محك (Mihakk)
**النوع:** SaaS متعدد المستأجرين لإدارة الأكاديميات التعليمية
**العميل الأول:** أكاديمية بارع — bare.mihakk.com
**Stack:** Next.js 15 + TypeScript + Supabase + Tailwind + Vercel
**GitHub:** ibrahimhn523-cmyk/mihakk-platform
**Supabase:** مشروع Mihakk (RLS مفعّل على كل الجداول)

---

## ٢. مبادئ البناء — لا تخالفها أبداً

1. Responsive أولاً — كل صفحة تعمل على جوال (375px) وشاشة كبيرة (1440px)
2. RTL دائماً — dir="rtl" على كل layout
3. حجم الملف لا يتجاوز 600 سطر — إذا تجاوز قسّم إلى components
4. Types أولاً — عرّف TypeScript types قبل أي كود
5. Server Components افتراضياً — use client فقط عند الحاجة
6. RLS على كل جدول — لا تكتب query بدون tenant_id filter
7. لا تتوقف للسؤال — إذا واجهت غموضاً في تفصيلة، اتخذ القرار المنطقي ووثّقه في ITERATION_LOG.md
8. Commit بعد كل feature — git add . && git commit -m "feat: [وصف]"

---

## ٣. الأدوار السبعة

| الدور | الرمز |
|-------|-------|
| Super Admin | super_admin |
| مدير البرنامج | program_manager |
| مشرف ميداني | supervisor |
| محاسبة | accountant |
| مشرف إعلام | media |
| طالب | student |
| ولي أمر | parent |

---

## ٤. خارطة البناء — المراحل المتبقية

### مكتمل ✅
- Super Admin: tenants, logs, settings, login
- Migrations 001-004, middleware, types

### المرحلة الحالية 🔴

**الأولوية ١ — Migrations جديدة**
أنشئ supabase/migrations/005_tenant_core.sql بجداول:
- programs (id, tenant_id, name, season, start_date, end_date, price_full, price_first, price_second, price_trial, status)
- students (id, tenant_id, full_name, grade, guardian_name, guardian_phone, guardian_phone2, notes, status)
- enrollments (id, tenant_id, student_id, program_id, subscription_type, amount_due, amount_paid, start_date, end_date, status)
- payments (id, tenant_id, enrollment_id, amount, method, method_note, paid_at, created_by, notes)
- attendance (id, tenant_id, student_id, program_id, session_date, status, notes, created_by)

أنشئ supabase/migrations/006_roles_permissions.sql بجداول:
- roles (id, tenant_id, name, permissions JSONB)
- user_roles (id, user_id, role_id, tenant_id)
- parent_student_links (id, tenant_id, parent_user_id, student_id)

فعّل RLS على كل جدول مع سياسة tenant_id.

**الأولوية ٢ — مكونات UI المشتركة**
أنشئ في src/components/ui/:
- Button.tsx — variants: primary, secondary, danger, ghost
- Input.tsx — مع label + error state
- Modal.tsx — overlay + close
- Table.tsx — مع pagination
- Badge.tsx — للحالات
- Card.tsx
- Sidebar.tsx — responsive، يخفي على الجوال

**الأولوية ٣ — واجهة المنشأة**
بالترتيب:
1. src/app/(tenant)/layout.tsx
2. src/app/(tenant)/dashboard/page.tsx
3. src/app/(tenant)/students/page.tsx
4. src/app/(tenant)/students/new/page.tsx
5. src/app/(tenant)/students/[id]/page.tsx
6. src/app/(tenant)/programs/page.tsx
7. src/app/(tenant)/programs/new/page.tsx
8. src/app/(tenant)/attendance/page.tsx
9. src/app/(tenant)/payments/page.tsx
10. src/app/(tenant)/reports/page.tsx

**الأولوية ٤ — بوابة ولي الأمر**
1. src/app/(parent)/dashboard/page.tsx
2. src/app/(parent)/student/[id]/page.tsx

**الأولوية ٥ — Auth + Permissions**
- src/lib/auth/permissions.ts — دالة hasPermission(user, action)
- حدّث middleware.ts

---

## ٥. الألوان والتصميم

الألوان الافتراضية:
- Primary: #2D3651
- Secondary: #D4AF37
- Background: #F5F7FA

كل منشأة تقدر تغير الألوان من tenant_branding. استخدم CSS variables:
--color-primary: var(--tenant-primary, #2D3651)

---

## ٦. قواعد Claude Code

1. اقرأ هذا الملف أولاً في بداية كل جلسة
2. لا تتوقف إلا لو في تعارض جوهري
3. commit بعد كل feature
4. لا تتجاوز 600 سطر في أي ملف
5. اختبر بـ npm run dev قبل كل commit
6. push للـ GitHub بعد كل مجموعة features

---

## ٧. الحالة الحالية (مايو ٢٠٢٦)

| المرحلة | الحالة |
|---------|--------|
| Super Admin UI | ✅ مكتمل |
| Migrations 001-006 | ✅ مكتمل |
| UI Components (7 مكونات) | ✅ مكتمل |
| واجهة المنشأة tenant (10 صفحات) | ✅ مكتمل |
| بوابة ولي الأمر (2 صفحات) | ✅ مكتمل |
| Auth + Permissions | ✅ مكتمل |

الخطوة التالية: تطبيق RLS على migrations 005-006 في Supabase، ثم اختبار end-to-end.
