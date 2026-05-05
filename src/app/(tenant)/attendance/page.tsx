import { createClient } from "@/lib/supabase/server";
import { getCurrentTenant } from "@/lib/tenant";
import Card, { CardHeader } from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import Table, { Column } from "@/components/ui/Table";
import type { Attendance, AttendanceStatus } from "@/types";

type AttendanceRow = Attendance & {
  student: { full_name: string } | null;
  program: { name: string } | null;
};

const STATUS_MAP: Record<AttendanceStatus, { label: string; variant: "active" | "danger" | "warning" | "default" }> = {
  present: { label: "حاضر", variant: "active" },
  absent: { label: "غائب", variant: "danger" },
  late: { label: "متأخر", variant: "warning" },
  excused: { label: "بعذر", variant: "default" },
};

const columns: Column<AttendanceRow>[] = [
  { key: "session_date", header: "التاريخ" },
  { key: "student", header: "الطالب", render: (r) => r.student?.full_name ?? "—" },
  { key: "program", header: "البرنامج", render: (r) => r.program?.name ?? "—" },
  {
    key: "status",
    header: "الحالة",
    render: (r) => {
      const s = STATUS_MAP[r.status];
      return <Badge variant={s.variant}>{s.label}</Badge>;
    },
  },
  { key: "notes", header: "ملاحظات", render: (r) => r.notes || "—" },
];

export default async function AttendancePage() {
  const tenant = await getCurrentTenant();
  if (!tenant) return null;

  const supabase = await createClient();
  const { data: records } = await supabase
    .from("attendance")
    .select("*, student:students(full_name), program:programs(name)")
    .eq("tenant_id", tenant.id)
    .order("session_date", { ascending: false })
    .limit(100);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">سجل الحضور</h1>

      <Card padding="none">
        <div className="p-4 border-b border-gray-100">
          <CardHeader title="سجلات الحضور" subtitle="آخر ١٠٠ سجل" />
        </div>
        <div className="p-4">
          <Table<AttendanceRow>
            columns={columns}
            data={(records as AttendanceRow[]) ?? []}
            keyField="id"
            emptyMessage="لا توجد سجلات حضور بعد"
          />
        </div>
      </Card>
    </div>
  );
}
