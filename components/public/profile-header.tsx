/* eslint-disable @next/next/no-img-element */
"use client";

import { useMemo, useState } from "react";
type ProfileHeaderProps = {
  displayName: string;
  username: string;
  bio: string | null;
  avatarUrl: string | null;
};

export function ProfileHeader({ displayName, username, bio, avatarUrl }: ProfileHeaderProps) {
  const [avatarFailed, setAvatarFailed] = useState(false);

  const initials = useMemo(() => {
    const words = displayName.trim().split(/\s+/).filter(Boolean);
    if (words.length >= 2) {
      return `${words[0]?.[0] ?? ""}${words[1]?.[0] ?? ""}`.toUpperCase();
    }
    if (words.length === 1) {
      return (words[0]?.[0] ?? username[0] ?? "?").toUpperCase();
    }
    return (username[0] ?? "?").toUpperCase();
  }, [displayName, username]);

  const normalizedAvatarUrl = avatarUrl?.trim() ?? "";
  const hasValidAvatarUrl = useMemo(() => {
    if (!normalizedAvatarUrl) {
      return false;
    }
    if (normalizedAvatarUrl.startsWith("/uploads/avatars/")) {
      return true;
    }
    try {
      const url = new URL(normalizedAvatarUrl);
      if (url.protocol !== "http:" && url.protocol !== "https:") {
        return false;
      }
      // Reject placeholder-like values such as "https://..."
      if (!url.hostname || url.hostname === "..." || !url.hostname.includes(".")) {
        return false;
      }
      return true;
    } catch {
      return false;
    }
  }, [normalizedAvatarUrl]);

  const shouldShowAvatar = hasValidAvatarUrl && !avatarFailed;

  return (
    <header className="terminal-card space-y-4">
      <div className="flex items-start">
        {shouldShowAvatar ? (
          <img
            src={normalizedAvatarUrl}
            alt={`${displayName} avatar`}
            className="shrink-0 rounded-sm border border-border object-cover"
            style={{ width: 160, height: 160 }}
            onError={() => setAvatarFailed(true)}
          />
        ) : (
          <div
            className="flex shrink-0 items-center justify-center rounded-sm border border-border bg-panel text-[5.5rem] font-semibold leading-none text-muted md:text-[6.5rem]"
            style={{ width: 160, height: 160 }}
          >
            {initials}
          </div>
        )}

        <div className="min-h-[160px] space-y-2 pt-1" style={{ marginLeft: 40 }}>
          <h1 className="text-5xl font-bold leading-tight tracking-[0.01em]">{displayName}</h1>
          <p className="text-xl text-muted">@{username}</p>
          {bio ? <p className="max-w-2xl pt-2 text-sm leading-relaxed text-muted">{bio}</p> : null}
        </div>
      </div>
    </header>
  );
}
