import { ProfileForm } from "@/components/dashboard/profile-form";
import { db } from "@/lib/db";
import { DEFAULT_THEME_ID } from "@/lib/constants";
import { requireCurrentUser } from "@/lib/session";

export default async function DashboardProfilePage() {
  const user = await requireCurrentUser();
  const [profile, themes] = await Promise.all([
    db.profile.findUnique({
      where: { userId: user.id }
    }),
    db.theme.findMany({ orderBy: { name: "asc" } })
  ]);

  return (
    <section className="space-y-6">
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold">Profile</h1>
        <p className="text-sm text-muted">
          Update how your public page appears. Username changes update your public URL.
        </p>
      </header>

      <ProfileForm
        initialValues={{
          username: profile?.username ?? "",
          displayName: profile?.displayName ?? "",
          bio: profile?.bio ?? "",
          avatarUrl: profile?.avatarUrl ?? "",
          themeId: profile?.themeId ?? DEFAULT_THEME_ID,
          isPublic: profile?.isPublic ?? true
        }}
        themes={themes}
      />
    </section>
  );
}
