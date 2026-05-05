import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getCurrentTenant } from "@/lib/tenant";
import Card, { CardHeader } from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import Table, { Column } from "@/components/ui/Table";
import type { Student } from "@/types";

const STATUS_MAP: Record<string, { label: string; variant: "active" | "inactive" | "default" }> = {
  active: { label: "نشط", variant: "active" },
  inactive: { label: "غير نشط", variant: "inactive" },
  graduated: { label: "متخرج", variant: "default" },
};

const columns: Column<Student>[] = [
  { key: "full_name", header: "الاسم الكامل" },
  { key: "grade", header: "الصف" },
  { key: "guardian_name", header: "ولي الأمر" },
  { key: "guardian_phone", header: "الجوال" },
  {
    key: "status",
    header: "الحالة",
    render: (row) => {
      const s = STATUS_MAP[row.status] ?? { label: row.status, variant: "default" as const };
      return <Badge variant={s.variant}>{s.label}</Badge>;
    },
  },
  {
    key: "actions",
    header: "",
    render: (row) => (
      <Link href={`/students/${row.id}`}>
        <Button variant="ghost" size="sm">عرض</Button>
      </Link>
    ),
    className: "w-20",
  },
];

export default async function StudentsPage() {
  const tenant = await getCurrentTenant();
  if (!tenant) return null;

  const supabase = await createClient();
  const { data: students } = await supabase
    .from("students")
    .select("*")
    .eq("tenant_id", tenant.id)
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">الطلاب</h1>
          <p className="text-sm text-gray-500 mt-1">{(students ?? []).length} طالب</p>
        </div>
        <Link href="/students/new">
          <Button>+ إضافة طالب</Button>
        </Link>
      </div>

      <Card padding="none">
        <div className="p-4 border-b border-gray-100">
          <CardHeader title="قائمة الطلاب" />
        </div>
        <div className="p-4">
          <Table<Student>
            columns={columns}
            data={(students as Student[]) ?? []}
            keyField="id"
            emptyMessage="لا يوجد طلاب بعد — أضف أول طالب"
          />
        </div>
      </Card>
    </div>
  );
}
