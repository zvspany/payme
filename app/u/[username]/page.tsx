import { notFound } from "next/navigation";
import type { CSSProperties } from "react";
import { db } from "@/lib/db";
import { THEME_TOKENS } from "@/lib/constants";
import { ProfileHeader } from "@/components/public/profile-header";
import { PaymentMethodCard } from "@/components/public/payment-method-card";
import { SocialLinksList } from "@/components/public/social-links-list";

export const revalidate = 60;

type PublicProfilePageProps = {
  params: Promise<{
    username: string;
  }>;
};

export default async function PublicProfilePage({ params }: PublicProfilePageProps) {
  const { username } = await params;
  const normalizedUsername = username?.trim().toLowerCase();

  if (!normalizedUsername) {
    notFound();
  }

  const profile = await db.profile.findUnique({
    where: { username: normalizedUsername },
    include: {
      paymentMethods: {
        select: {
          id: true,
          type: true,
          label: true,
          value: true,
          network: true,
          description: true,
          isVisible: true
        },
        where: { isVisible: true },
        orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }]
      },
      socialLinks: {
        select: {
          id: true,
          label: true,
          url: true
        },
        where: { isVisible: true },
        orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }]
      }
    }
  });

  if (!profile || !profile.isPublic) {
    notFound();
  }

  const tokens = THEME_TOKENS[profile.themeId] ?? THEME_TOKENS["terminal-dark"];

  return (
    <main
      className="profile-shell min-h-screen"
      style={
        {
          "--color-bg": tokens.bg,
          "--color-panel": tokens.panel,
          "--color-text": tokens.text,
          "--color-muted": tokens.muted,
          "--color-border": tokens.border,
          "--color-accent": tokens.accent
        } as CSSProperties
      }
    >
      <div className="space-y-8">
        <ProfileHeader
          displayName={profile.displayName}
          username={profile.username}
          bio={profile.bio}
          avatarUrl={profile.avatarUrl}
        />

        <section className="terminal-section space-y-4">
          <h2 className="terminal-heading">Payment Methods</h2>
          {profile.paymentMethods.length === 0 ? (
            <p className="rounded-lg border border-dashed border-border p-4 text-sm text-muted">
              No payment methods published yet.
            </p>
          ) : (
            <div className="space-y-3">
              {profile.paymentMethods.map((method) => (
                <PaymentMethodCard key={method.id} method={method} />
              ))}
            </div>
          )}
        </section>

        <SocialLinksList links={profile.socialLinks} />

        <footer className="terminal-section text-xs text-muted">
          PayMe is a profile and presentation layer. It does not process payments or hold funds.
        </footer>
      </div>
    </main>
  );
}
