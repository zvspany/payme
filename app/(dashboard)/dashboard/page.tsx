import { db } from "@/lib/db";
import { requireCurrentUser } from "@/lib/session";

export default async function DashboardOverviewPage() {
  const user = await requireCurrentUser();

  const profile = await db.profile.findUnique({
    where: { userId: user.id },
    include: {
      paymentMethods: true,
      socialLinks: true
    }
  });

  return (
    <section className="space-y-8">
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold">Overview</h1>
        <p className="text-sm text-muted">
          Manage your public payment profile. PayMe only displays payment details and links.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <article className="terminal-card py-5">
          <p className="terminal-heading">Payment Methods</p>
          <p className="mt-4 text-3xl font-semibold">{profile?.paymentMethods.length ?? 0}</p>
        </article>

        <article className="terminal-card py-5">
          <p className="terminal-heading">Social Links</p>
          <p className="mt-4 text-3xl font-semibold">{profile?.socialLinks.length ?? 0}</p>
        </article>

        <article className="terminal-card py-5">
          <p className="terminal-heading">Public Visibility</p>
          <p className="mt-4 text-3xl font-semibold">{profile?.isPublic ? "On" : "Off"}</p>
        </article>
      </div>

    </section>
  );
}
