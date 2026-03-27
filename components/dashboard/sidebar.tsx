"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/dashboard", label: "Overview" },
  { href: "/dashboard/profile", label: "Profile" },
  { href: "/dashboard/payment-methods", label: "Payment Methods" },
  { href: "/dashboard/social-links", label: "Social Links" }
];

type SidebarProps = {
  username?: string;
};

export function Sidebar({ username }: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside className="w-full border-b border-border/80 pb-5 md:w-64 md:self-start md:border-b-0 md:border-r md:pb-0 md:pr-6">
      <div className="mb-6 space-y-1">
        <p className="terminal-heading">PayMe Dashboard</p>
        {username ? <p className="text-sm text-muted">Public profile: /u/{username}</p> : null}
      </div>

      <nav aria-label="Dashboard navigation" className="space-y-2">
        {navItems.map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "block rounded-md px-3 py-2.5 text-sm transition-colors",
                active
                  ? "bg-panel text-text"
                  : "text-muted hover:bg-panel/70 hover:text-text"
              )}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
