/* eslint-disable @next/next/no-img-element */
type ProfileHeaderProps = {
  displayName: string;
  username: string;
  bio: string | null;
  avatarUrl: string | null;
};

export function ProfileHeader({ displayName, username, bio, avatarUrl }: ProfileHeaderProps) {
  const words = displayName.trim().split(/\s+/).filter(Boolean);
  const initials =
    words.length >= 2
      ? `${words[0]?.[0] ?? ""}${words[1]?.[0] ?? ""}`.toUpperCase()
      : (words[0]?.slice(0, 2) ?? username.slice(0, 2)).toUpperCase();

  return (
    <header className="terminal-card space-y-4">
      <div className="flex items-center gap-4">
        {avatarUrl ? (
          <img
            src={avatarUrl}
            alt={`${displayName} avatar`}
            className="h-16 w-16 rounded-full border border-border object-cover"
          />
        ) : (
          <div className="flex h-16 w-16 items-center justify-center rounded-full border border-border bg-panel text-lg font-semibold text-muted">
            {initials}
          </div>
        )}

        <div className="space-y-1.5">
          <h1 className="text-3xl font-bold leading-tight">{displayName}</h1>
          <p className="text-sm text-muted">@{username}</p>
        </div>
      </div>

      {bio ? <p className="max-w-2xl text-sm leading-relaxed text-muted">{bio}</p> : null}
    </header>
  );
}
