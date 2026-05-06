import { type NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

const PUBLIC_PATHS = ["/login", "/register", "/forgot-password"];

function extractTenantSlug(hostname: string): string {
  const host = hostname.split(":")[0];
  if (host === "localhost" || host === "127.0.0.1") return "dev";
  if (host === "mihakk.com" || host === "www.mihakk.com") return "public";
  return host.replace(/\.mihakk\.com$/, "");
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hostname = request.headers.get("host") ?? "localhost:3000";
  const tenantSlug = extractTenantSlug(hostname);

  // Single client for the entire middleware run.
  // setAll keeps request.cookies and supabaseResponse.cookies in sync so any
  // token refresh is immediately visible to subsequent reads within this run.
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: (cookiesToSet) => {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // One getUser() call — validates the session and triggers a token refresh
  // if the access token is expired. Must not be moved after early returns.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  supabaseResponse.headers.set("x-tenant-slug", tenantSlug);
  supabaseResponse.headers.set("x-pathname", pathname);

  const isPublic = PUBLIC_PATHS.some(
    (p) => pathname === p || pathname.startsWith(p + "/")
  );
  if (isPublic) return supabaseResponse;

  if (pathname.startsWith("/admin")) {
    if (!user) {
      return redirectToLogin(request, pathname);
    }
    const { data } = await supabase
      .from("users")
      .select("role")
      .eq("id", user.id)
      .single();
    if (data?.role !== "super_admin") {
      return redirectToLogin(request, pathname);
    }
    return supabaseResponse;
  }

  if (!user) {
    return redirectToLogin(request, pathname);
  }

  return supabaseResponse;
}

function redirectToLogin(request: NextRequest, next: string): NextResponse {
  const url = new URL("/login", request.url);
  url.searchParams.set("next", next);
  return NextResponse.redirect(url);
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js)$).*)",
  ],
};
