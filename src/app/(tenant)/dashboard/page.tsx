import { createClient } from "@/lib/supabase/server";
import { getCurrentTenant } from "@/lib/tenant";
import Card, { CardHeader } from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";

async function getStats(tenantId: string) {
  const supabase = await createClient();
  const [students, enrollments, payments] = await Promise.all([
    supabase.from("students").select("id", { count: "exact" }).eq("tenant_id", tenantId).eq("status", "active"),
    supabase.from("enrollments").select("id", { count: "exact" }).eq("tenant_id", tenantId).eq("status", "active"),
    supabase.from("payments").select("amount").eq("tenant_id", tenantId),
  ]);

  const totalRevenue = (payments.data ?? []).reduce((sum, p) => sum + (p.amount || 0), 0);

  return {
    activeStudents: students.count ?? 0,
    activeEnrollments: enrollments.count ?? 0,
    totalRevenue,
  };
}

export default async function DashboardPage() {
  const tenant = await getCurrentTenant();
  if (!tenant) return null;

  const stats = await getStats(tenant.id);

  const cards = [
    { label: "الطلاب النشطون", value: stats.activeStudents, color: "text-blue-600", bg: "bg-blue-50" },
    { label: "التسجيلات الفعالة", value: stats.activeEnrollments, color: "text-green-600", bg: "bg-green-50" },
    { label: "إجمالي الإيرادات", value: `${stats.totalRevenue.toLocaleString("ar-SA")} ر.س`, color: "text-yellow-600", bg: "bg-yellow-50" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">لوحة التحكم</h1>
        <p className="text-sm text-gray-500 mt-1">{tenant.name}</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {cards.map((card) => (
          <Card key={card.label}>
            <div className={`inline-flex p-3 rounded-xl ${card.bg} mb-3`}>
              <span className={`text-2xl font-bold ${card.color}`}>{card.value}</span>
            </div>
            <p className="text-sm text-gray-600">{card.label}</p>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader title="الحالة العامة" />
        <div className="flex flex-wrap gap-3">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">المنصة:</span>
            <Badge variant="active">نشط</Badge>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">الباقة:</span>
            <Badge variant="default">أساسية</Badge>
          </div>
        </div>
      </Card>
    </div>
  );
}
