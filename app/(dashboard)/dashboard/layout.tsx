import Link from "next/link";
import type { ReactNode } from "react";
import { SignOutButton } from "@/components/auth/signout-button";
import { Sidebar } from "@/components/dashboard/sidebar";
import { requireCurrentUser } from "@/lib/session";

export default async function DashboardLayout({
  children
}: {
  children: ReactNode;
}) {
  const user = await requireCurrentUser();

  return (
    <div className="dashboard-shell flex min-h-screen flex-col">
      <header className="mb-7 flex flex-wrap items-center justify-between gap-4 border-b border-border/80 pb-5">
        <div className="space-y-1">
          <Link href="/" className="terminal-heading">
            PayMe
          </Link>
          <p className="text-sm text-muted">{user.email}</p>
        </div>

        <SignOutButton />
      </header>

      <div className="flex flex-col gap-7 md:flex-row">
        <Sidebar username={user.profile?.username} />
        <main className="min-w-0 flex-1">{children}</main>
      </div>
    </div>
  );
}
