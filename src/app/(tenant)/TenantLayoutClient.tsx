"use client";

import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import Sidebar from "@/components/ui/Sidebar";
import type { NavItem } from "@/components/ui/Sidebar";
import type { Tenant } from "@/types";
import {
  IconDashboard,
  IconStudents,
  IconPrograms,
  IconAttendance,
  IconPayments,
  IconReports,
} from "@/components/icons";

const NAV_ITEMS: NavItem[] = [
  { href: "/dashboard", label: "لوحة التحكم", icon: <IconDashboard /> },
  { href: "/students", label: "الطلاب", icon: <IconStudents /> },
  { href: "/programs", label: "البرامج", icon: <IconPrograms /> },
  { href: "/attendance", label: "الحضور", icon: <IconAttendance /> },
  { href: "/payments", label: "المدفوعات", icon: <IconPayments /> },
  { href: "/reports", label: "التقارير", icon: <IconReports /> },
];

interface Props {
  tenant: Tenant;
  userEmail?: string;
  children: React.ReactNode;
}

export default function TenantLayoutClient({ tenant, userEmail, children }: Props) {
  const router = useRouter();

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
  }

  return (
    <div
      className="flex min-h-screen"
      style={{
        ["--tenant-primary" as string]: tenant.branding?.primary_color ?? "#2D3651",
        ["--tenant-secondary" as string]: tenant.branding?.secondary_color ?? "#D4AF37",
      }}
    >
      <Sidebar
        items={NAV_ITEMS}
        tenantName={tenant.name}
        userEmail={userEmail}
        onSignOut={handleSignOut}
      />
      <main className="flex-1 min-h-screen bg-[#F5F7FA] lg:pr-0 pt-16 lg:pt-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">{children}</div>
      </main>
    </div>
  );
}
