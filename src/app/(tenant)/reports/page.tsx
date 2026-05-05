import { createClient } from "@/lib/supabase/server";
import { getCurrentTenant } from "@/lib/tenant";
import Card, { CardHeader } from "@/components/ui/Card";

async function getReportData(tenantId: string) {
  const supabase = await createClient();

  const [
    { count: totalStudents },
    { count: activeStudents },
    { count: totalEnrollments },
    { count: activeEnrollments },
    { data: payments },
    { data: attendance },
  ] = await Promise.all([
    supabase.from("students").select("id", { count: "exact", head: true }).eq("tenant_id", tenantId),
    supabase.from("students").select("id", { count: "exact", head: true }).eq("tenant_id", tenantId).eq("status", "active"),
    supabase.from("enrollments").select("id", { count: "exact", head: true }).eq("tenant_id", tenantId),
    supabase.from("enrollments").select("id", { count: "exact", head: true }).eq("tenant_id", tenantId).eq("status", "active"),
    supabase.from("payments").select("amount").eq("tenant_id", tenantId),
    supabase.from("attendance").select("status").eq("tenant_id", tenantId),
  ]);

  const totalRevenue = (payments ?? []).reduce((s, p) => s + (p.amount || 0), 0);
  const presentCount = (attendance ?? []).filter((a) => a.status === "present").length;
  const totalAttendance = (attendance ?? []).length;
  const attendanceRate = totalAttendance > 0 ? Math.round((presentCount / totalAttendance) * 100) : 0;

  return {
    totalStudents: totalStudents ?? 0,
    activeStudents: activeStudents ?? 0,
    totalEnrollments: totalEnrollments ?? 0,
    activeEnrollments: activeEnrollments ?? 0,
    totalRevenue,
    attendanceRate,
    totalAttendance,
  };
}

export default async function ReportsPage() {
  const tenant = await getCurrentTenant();
  if (!tenant) return null;

  const data = await getReportData(tenant.id);

  const metrics = [
    { label: "إجمالي الطلاب", value: data.totalStudents, sub: `${data.activeStudents} نشط` },
    { label: "إجمالي التسجيلات", value: data.totalEnrollments, sub: `${data.activeEnrollments} فعال` },
    { label: "إجمالي الإيرادات", value: `${data.totalRevenue.toLocaleString("ar-SA")} ر.س`, sub: "مجموع المدفوعات" },
    { label: "نسبة الحضور", value: `${data.attendanceRate}%`, sub: `${data.totalAttendance} سجل` },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">التقارير</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((m) => (
          <Card key={m.label}>
            <p className="text-sm text-gray-500">{m.label}</p>
            <p className="text-2xl font-bold text-[var(--color-primary)] mt-1">{m.value}</p>
            <p className="text-xs text-gray-400 mt-1">{m.sub}</p>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader title="ملاحظة" />
        <p className="text-sm text-gray-600">
          التقارير التفصيلية والرسوم البيانية ستُضاف في المرحلة القادمة.
        </p>
      </Card>
    </div>
  );
}
