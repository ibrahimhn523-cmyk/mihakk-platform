import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getCurrentTenant } from "@/lib/tenant";
import Card, { CardHeader } from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import Table, { Column } from "@/components/ui/Table";
import type { Program, ProgramStatus } from "@/types";

const STATUS_MAP: Record<ProgramStatus, { label: string; variant: "active" | "inactive" | "pending" | "default" }> = {
  upcoming: { label: "قادم", variant: "pending" },
  active: { label: "نشط", variant: "active" },
  completed: { label: "منتهي", variant: "inactive" },
  cancelled: { label: "ملغي", variant: "default" },
};

const columns: Column<Program>[] = [
  { key: "name", header: "اسم البرنامج" },
  { key: "season", header: "الموسم", render: (r) => r.season || "—" },
  { key: "start_date", header: "تاريخ البدء" },
  { key: "end_date", header: "تاريخ الانتهاء" },
  { key: "price_full", header: "السعر الكامل", render: (r) => `${r.price_full} ر.س` },
  {
    key: "status",
    header: "الحالة",
    render: (r) => {
      const s = STATUS_MAP[r.status];
      return <Badge variant={s.variant}>{s.label}</Badge>;
    },
  },
  {
    key: "actions",
    header: "",
    render: (r) => (
      <Link href={`/programs/${r.id}`}>
        <Button variant="ghost" size="sm">عرض</Button>
      </Link>
    ),
    className: "w-20",
  },
];

export default async function ProgramsPage() {
  const tenant = await getCurrentTenant();
  if (!tenant) return null;

  const supabase = await createClient();
  const { data: programs } = await supabase
    .from("programs")
    .select("*")
    .eq("tenant_id", tenant.id)
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">البرامج</h1>
          <p className="text-sm text-gray-500 mt-1">{(programs ?? []).length} برنامج</p>
        </div>
        <Link href="/programs/new">
          <Button>+ إضافة برنامج</Button>
        </Link>
      </div>

      <Card padding="none">
        <div className="p-4 border-b border-gray-100">
          <CardHeader title="قائمة البرامج" />
        </div>
        <div className="p-4">
          <Table<Program>
            columns={columns}
            data={(programs as Program[]) ?? []}
            keyField="id"
            emptyMessage="لا توجد برامج — أضف أول برنامج"
          />
        </div>
      </Card>
    </div>
  );
}
