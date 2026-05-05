"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export interface NavItem {
  href: string;
  label: string;
  icon: React.ReactNode;
}

interface SidebarProps {
  items: NavItem[];
  tenantName?: string;
  tenantLogo?: string;
  userEmail?: string;
  onSignOut?: () => void;
}

export default function Sidebar({
  items,
  tenantName = "محك",
  userEmail,
  onSignOut,
}: SidebarProps) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  const NavLinks = () => (
    <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
      {items.map((item) => {
        const active = pathname === item.href || pathname.startsWith(item.href + "/");
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={() => setOpen(false)}
            className={[
              "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
              active
                ? "bg-[var(--color-secondary)]/10 text-[var(--color-secondary)]"
                : "text-gray-300 hover:bg-white/10 hover:text-white",
            ].join(" ")}
          >
            <span className="w-5 h-5 shrink-0">{item.icon}</span>
            {item.label}
          </Link>
        );
      })}
    </nav>
  );

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-[var(--color-primary)]">
      <div className="px-5 py-5 border-b border-white/10">
        <span className="text-xl font-bold text-white">{tenantName}</span>
      </div>
      <NavLinks />
      {(userEmail || onSignOut) && (
        <div className="px-4 py-4 border-t border-white/10">
          {userEmail && (
            <p className="text-xs text-gray-400 truncate mb-2">{userEmail}</p>
          )}
          {onSignOut && (
            <button
              onClick={onSignOut}
              className="w-full text-right text-sm text-gray-300 hover:text-white transition-colors py-1"
            >
              تسجيل الخروج
            </button>
          )}
        </div>
      )}
    </div>
  );

  return (
    <>
      {/* Mobile toggle */}
      <button
        className="fixed top-4 right-4 z-40 p-2 rounded-lg bg-[var(--color-primary)] text-white shadow-lg lg:hidden"
        onClick={() => setOpen(true)}
        aria-label="فتح القائمة"
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      {/* Mobile overlay */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Mobile drawer */}
      <aside
        className={[
          "fixed top-0 right-0 h-full w-64 z-50 transform transition-transform duration-300 lg:hidden",
          open ? "translate-x-0" : "translate-x-full",
        ].join(" ")}
      >
        <SidebarContent />
      </aside>

      {/* Desktop sidebar */}
      <aside className="hidden lg:flex w-64 h-screen sticky top-0 shrink-0">
        <div className="w-full">
          <SidebarContent />
        </div>
      </aside>
    </>
  );
}
