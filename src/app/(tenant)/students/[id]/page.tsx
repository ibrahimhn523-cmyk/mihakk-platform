import { notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getCurrentTenant } from "@/lib/tenant";
import Card, { CardHeader } from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import Table, { Column } from "@/components/ui/Table";
import type { Student, Enrollment } from "@/types";

const STATUS_MAP: Record<string, { label: string; variant: "active" | "inactive" | "default" }> = {
  active: { label: "نشط", variant: "active" },
  inactive: { label: "غير نشط", variant: "inactive" },
  graduated: { label: "متخرج", variant: "default" },
};

const enrollmentCols: Column<Enrollment & { program: { name: string } | null }>[] = [
  { key: "program", header: "البرنامج", render: (r) => r.program?.name ?? "—" },
  { key: "subscription_type", header: "نوع الاشتراك" },
  { key: "amount_due", header: "المستحق", render: (r) => `${r.amount_due} ر.س` },
  { key: "amount_paid", header: "المدفوع", render: (r) => `${r.amount_paid} ر.س` },
  {
    key: "status",
    header: "الحالة",
    render: (r) => <Badge variant={r.status === "active" ? "active" : "inactive"}>{r.status}</Badge>,
  },
];

export default async function StudentPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const tenant = await getCurrentTenant();
  if (!tenant) return null;

  const supabase = await createClient();
  const { data: student } = await supabase
    .from("students")
    .select("*")
    .eq("id", id)
    .eq("tenant_id", tenant.id)
    .single();

  if (!student) notFound();

  const { data: enrollments } = await supabase
    .from("enrollments")
    .select("*, program:programs(name)")
    .eq("student_id", id)
    .eq("tenant_id", tenant.id)
    .order("created_at", { ascending: false });

  const s = student as Student;
  const status = STATUS_MAP[s.status] ?? { label: s.status, variant: "default" as const };

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{s.full_name}</h1>
          <div className="flex items-center gap-2 mt-1">
            {s.grade && <span className="text-sm text-gray-500">{s.grade}</span>}
            <Badge variant={status.variant}>{status.label}</Badge>
          </div>
        </div>
        <Link href="/students">
          <Button variant="ghost" size="sm">← رجوع</Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Card>
          <CardHeader title="بيانات الطالب" />
          <dl className="space-y-3 text-sm">
            <div className="flex gap-2">
              <dt className="text-gray-500 w-28 shrink-0">الاسم الكامل</dt>
              <dd className="text-gray-900 font-medium">{s.full_name}</dd>
            </div>
            <div className="flex gap-2">
              <dt className="text-gray-500 w-28 shrink-0">الصف</dt>
              <dd className="text-gray-900">{s.grade || "—"}</dd>
            </div>
          </dl>
        </Card>

        <Card>
          <CardHeader title="بيانات ولي الأمر" />
          <dl className="space-y-3 text-sm">
            <div className="flex gap-2">
              <dt className="text-gray-500 w-28 shrink-0">الاسم</dt>
              <dd className="text-gray-900 font-medium">{s.guardian_name}</dd>
            </div>
            <div className="flex gap-2">
              <dt className="text-gray-500 w-28 shrink-0">الجوال</dt>
              <dd className="text-gray-900 dir-ltr">{s.guardian_phone}</dd>
            </div>
            {s.guardian_phone2 && (
              <div className="flex gap-2">
                <dt className="text-gray-500 w-28 shrink-0">جوال بديل</dt>
                <dd className="text-gray-900 dir-ltr">{s.guardian_phone2}</dd>
              </div>
            )}
          </dl>
        </Card>
      </div>

      {s.notes && (
        <Card>
          <CardHeader title="ملاحظات" />
          <p className="text-sm text-gray-700">{s.notes}</p>
        </Card>
      )}

      <Card padding="none">
        <div className="p-4 border-b border-gray-100">
          <CardHeader title="التسجيلات" />
        </div>
        <div className="p-4">
          <Table
            columns={enrollmentCols}
            data={(enrollments ?? []) as (Enrollment & { program: { name: string } | null })[]}
            keyField="id"
            emptyMessage="لا يوجد تسجيلات لهذا الطالب"
          />
        </div>
      </Card>
    </div>
  );
}
