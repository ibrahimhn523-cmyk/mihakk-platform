import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import Card, { CardHeader } from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import Table, { Column } from "@/components/ui/Table";
import type { Attendance, AttendanceStatus, Payment, Student } from "@/types";

type AttendanceRow = Attendance & { program: { name: string } | null };
type PaymentRow = Payment & {
  enrollment: { program: { name: string } | null } | null;
};

const ATT_MAP: Record<
  AttendanceStatus,
  { label: string; variant: "active" | "danger" | "warning" | "default" }
> = {
  present: { label: "حاضر", variant: "active" },
  absent: { label: "غائب", variant: "danger" },
  late: { label: "متأخر", variant: "warning" },
  excused: { label: "بعذر", variant: "default" },
};

const attCols: Column<AttendanceRow>[] = [
  { key: "session_date", header: "التاريخ" },
  { key: "program", header: "البرنامج", render: (r) => r.program?.name ?? "—" },
  {
    key: "status",
    header: "الحالة",
    render: (r) => {
      const s = ATT_MAP[r.status];
      return <Badge variant={s.variant}>{s.label}</Badge>;
    },
  },
];

const paymentCols: Column<PaymentRow>[] = [
  {
    key: "paid_at",
    header: "التاريخ",
    render: (r) => new Date(r.paid_at).toLocaleDateString("ar-SA"),
  },
  {
    key: "program",
    header: "البرنامج",
    render: (r) => r.enrollment?.program?.name ?? "—",
  },
  { key: "amount", header: "المبلغ", render: (r) => `${r.amount} ر.س` },
];

export default async function ParentStudentPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: link } = await supabase
    .from("parent_student_links")
    .select("student_id")
    .eq("parent_user_id", user.id)
    .eq("student_id", id)
    .single();

  if (!link) notFound();

  const { data: student } = await supabase
    .from("students")
    .select("*")
    .eq("id", id)
    .single();

  if (!student) notFound();

  const s = student as Student;

  const [{ data: attendance }, { data: payments }] = await Promise.all([
    supabase
      .from("attendance")
      .select("*, program:programs(name)")
      .eq("student_id", id)
      .order("session_date", { ascending: false })
      .limit(50),
    supabase
      .from("payments")
      .select("*, enrollment:enrollments(program:programs(name))")
      .eq("tenant_id", s.tenant_id)
      .order("paid_at", { ascending: false }),
  ]);

  return (
    <div className="space-y-6 max-w-4xl mx-auto px-4 py-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">{s.full_name}</h1>
        {s.grade && <p className="text-sm text-gray-500 mt-1">{s.grade}</p>}
      </div>

      <Card padding="none">
        <div className="p-4 border-b border-gray-100">
          <CardHeader title="سجل الحضور" />
        </div>
        <div className="p-4">
          <Table<AttendanceRow>
            columns={attCols}
            data={(attendance as AttendanceRow[]) ?? []}
            keyField="id"
            emptyMessage="لا توجد سجلات حضور"
          />
        </div>
      </Card>

      <Card padding="none">
        <div className="p-4 border-b border-gray-100">
          <CardHeader title="سجل المدفوعات" />
        </div>
        <div className="p-4">
          <Table<PaymentRow>
            columns={paymentCols}
            data={(payments as PaymentRow[]) ?? []}
            keyField="id"
            emptyMessage="لا توجد مدفوعات"
          />
        </div>
      </Card>
    </div>
  );
}
