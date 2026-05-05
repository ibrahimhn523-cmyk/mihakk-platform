import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Card, { CardHeader } from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import Table, { Column } from "@/components/ui/Table";
import type { Attendance, AttendanceStatus } from "@/types";

type AttendanceRow = Attendance & {
  program: { name: string } | null;
};

type LinkedStudent = {
  id: string;
  full_name: string;
  grade?: string | null;
  status: string;
};

const STATUS_MAP: Record<
  AttendanceStatus,
  { label: string; variant: "active" | "danger" | "warning" | "default" }
> = {
  present: { label: "حاضر", variant: "active" },
  absent: { label: "غائب", variant: "danger" },
  late: { label: "متأخر", variant: "warning" },
  excused: { label: "بعذر", variant: "default" },
};

const attendanceCols: Column<AttendanceRow>[] = [
  { key: "session_date", header: "التاريخ" },
  { key: "program", header: "البرنامج", render: (r) => r.program?.name ?? "—" },
  {
    key: "status",
    header: "الحالة",
    render: (r) => {
      const s = STATUS_MAP[r.status];
      return <Badge variant={s.variant}>{s.label}</Badge>;
    },
  },
];

export default async function ParentDashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: links } = await supabase
    .from("parent_student_links")
    .select("student:students(id, full_name, grade, status)")
    .eq("parent_user_id", user.id);

  const students: LinkedStudent[] = (links ?? [])
    .map((l) => l.student as unknown as LinkedStudent)
    .filter(Boolean);

  const studentIds = students.map((s) => s.id);

  const { data: enrollments } = studentIds.length
    ? await supabase
        .from("enrollments")
        .select("student_id, program:programs(name)")
        .in("student_id", studentIds)
        .eq("status", "active")
    : { data: [] };

  const { data: attendance } = studentIds.length
    ? await supabase
        .from("attendance")
        .select("*, program:programs(name)")
        .in("student_id", studentIds)
        .order("session_date", { ascending: false })
        .limit(30)
    : { data: [] };

  return (
    <div className="space-y-6 max-w-4xl mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold text-gray-900">بوابة ولي الأمر</h1>

      {students.length === 0 ? (
        <Card>
          <p className="text-center text-gray-500 py-8">
            لا يوجد طلاب مرتبطون بهذا الحساب. تواصل مع الأكاديمية.
          </p>
        </Card>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {students.map((s) => {
              const enrollCount = (enrollments ?? []).filter(
                (e) => (e as { student_id: string }).student_id === s.id
              ).length;
              return (
                <Card key={s.id}>
                  <CardHeader title={s.full_name} subtitle={s.grade ?? undefined} />
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-500">البرامج المسجّلة</span>
                      <span className="font-medium">{enrollCount}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">الحالة</span>
                      <Badge variant={s.status === "active" ? "active" : "inactive"}>
                        {s.status === "active" ? "نشط" : "غير نشط"}
                      </Badge>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>

          <Card padding="none">
            <div className="p-4 border-b border-gray-100">
              <CardHeader title="سجل الحضور الأخير" />
            </div>
            <div className="p-4">
              <Table<AttendanceRow>
                columns={attendanceCols}
                data={(attendance as AttendanceRow[]) ?? []}
                keyField="id"
                emptyMessage="لا توجد سجلات حضور بعد"
              />
            </div>
          </Card>
        </>
      )}
    </div>
  );
}
