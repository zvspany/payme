import { SocialLinksForm } from "@/components/dashboard/social-links-form";
import { db } from "@/lib/db";
import { requireCurrentUser } from "@/lib/session";

export default async function DashboardSocialLinksPage() {
  const user = await requireCurrentUser();

  const profile = await db.profile.findUnique({
    where: { userId: user.id },
    include: {
      socialLinks: {
        select: {
          id: true,
          label: true,
          url: true,
          sortOrder: true,
          isVisible: true
        },
        orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }]
      }
    }
  });

  if (!profile) {
    return <p className="text-sm text-red-300">Profile not found.</p>;
  }

  return (
    <section className="space-y-6">
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold">Social Links</h1>
        <p className="text-sm text-muted">
          Optional links to contact points and social profiles. Keep this short and relevant.
        </p>
      </header>

      <SocialLinksForm links={profile.socialLinks} />
    </section>
  );
}
