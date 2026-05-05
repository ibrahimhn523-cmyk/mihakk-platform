import { createClient } from "@/lib/supabase/server";
import { getCurrentTenant } from "@/lib/tenant";
import Card, { CardHeader } from "@/components/ui/Card";
import Table, { Column } from "@/components/ui/Table";
import type { Payment, PaymentMethod } from "@/types";

type PaymentRow = Payment & {
  enrollment: {
    student: { full_name: string } | null;
    program: { name: string } | null;
  } | null;
};

const METHOD_LABELS: Record<PaymentMethod, string> = {
  cash: "نقد",
  transfer: "تحويل",
  online: "إلكتروني",
  other: "أخرى",
};

const columns: Column<PaymentRow>[] = [
  { key: "paid_at", header: "التاريخ", render: (r) => new Date(r.paid_at).toLocaleDateString("ar-SA") },
  { key: "student", header: "الطالب", render: (r) => r.enrollment?.student?.full_name ?? "—" },
  { key: "program", header: "البرنامج", render: (r) => r.enrollment?.program?.name ?? "—" },
  { key: "amount", header: "المبلغ", render: (r) => `${r.amount.toLocaleString("ar-SA")} ر.س` },
  { key: "method", header: "طريقة الدفع", render: (r) => METHOD_LABELS[r.method] ?? r.method },
  { key: "notes", header: "ملاحظات", render: (r) => r.notes || "—" },
];

export default async function PaymentsPage() {
  const tenant = await getCurrentTenant();
  if (!tenant) return null;

  const supabase = await createClient();
  const { data: payments } = await supabase
    .from("payments")
    .select("*, enrollment:enrollments(student:students(full_name), program:programs(name))")
    .eq("tenant_id", tenant.id)
    .order("paid_at", { ascending: false })
    .limit(100);

  const total = (payments ?? []).reduce((sum, p) => sum + (p.amount || 0), 0);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">المدفوعات</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Card>
          <p className="text-sm text-gray-500">إجمالي المدفوعات</p>
          <p className="text-3xl font-bold text-[var(--color-primary)] mt-1">
            {total.toLocaleString("ar-SA")}
            <span className="text-base font-normal text-gray-500 mr-1">ر.س</span>
          </p>
        </Card>
        <Card>
          <p className="text-sm text-gray-500">عدد العمليات</p>
          <p className="text-3xl font-bold text-[var(--color-primary)] mt-1">
            {(payments ?? []).length}
          </p>
        </Card>
      </div>

      <Card padding="none">
        <div className="p-4 border-b border-gray-100">
          <CardHeader title="سجل المدفوعات" subtitle="آخر ١٠٠ عملية" />
        </div>
        <div className="p-4">
          <Table<PaymentRow>
            columns={columns}
            data={(payments as PaymentRow[]) ?? []}
            keyField="id"
            emptyMessage="لا توجد مدفوعات بعد"
          />
        </div>
      </Card>
    </div>
  );
}
