import { headers } from "next/headers";
import { createClient } from "./supabase/server";
import type { Tenant } from "@/types";

export async function getCurrentTenant(): Promise<Tenant | null> {
  const headersList = await headers();
  const host = headersList.get("host") || "";

  // Extract subdomain: bare.mihakk.com → bare
  const subdomain = host.split(".")[0];
  if (!subdomain || subdomain === "www" || subdomain === "mihakk") return null;

  const supabase = await createClient();
  const { data } = await supabase
    .from("tenants")
    .select("*")
    .eq("subdomain", subdomain)
    .eq("status", "active")
    .single();

  return data as Tenant | null;
}
