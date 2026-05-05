import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCurrentTenant } from "@/lib/tenant";
import TenantLayoutClient from "./TenantLayoutClient";

export default async function TenantLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [supabase, tenant] = await Promise.all([
    createClient(),
    getCurrentTenant(),
  ]);

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");
  if (!tenant) redirect("/");

  return (
    <TenantLayoutClient tenant={tenant} userEmail={user.email}>
      {children}
    </TenantLayoutClient>
  );
}
