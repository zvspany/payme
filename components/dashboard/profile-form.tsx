"use client";

import { FormEvent, useState, useTransition } from "react";
import { updateProfileAction } from "@/actions/profile";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

type ThemeOption = {
  id: string;
  name: string;
  description: string | null;
};

type ProfileFormProps = {
  initialValues: {
    username: string;
    displayName: string;
    bio: string;
    avatarUrl: string;
    themeId: string;
    isPublic: boolean;
  };
  themes: ThemeOption[];
};

export function ProfileForm({ initialValues, themes }: ProfileFormProps) {
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);
  const [isError, setIsError] = useState(false);

  const [username, setUsername] = useState(initialValues.username);
  const [displayName, setDisplayName] = useState(initialValues.displayName);
  const [bio, setBio] = useState(initialValues.bio);
  const [avatarUrl, setAvatarUrl] = useState(initialValues.avatarUrl);
  const [themeId, setThemeId] = useState(initialValues.themeId);
  const [isPublic, setIsPublic] = useState(initialValues.isPublic);

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage(null);

    const formData = new FormData();
    formData.set("username", username);
    formData.set("displayName", displayName);
    formData.set("bio", bio);
    formData.set("avatarUrl", avatarUrl);
    formData.set("themeId", themeId);
    if (isPublic) {
      formData.set("isPublic", "on");
    }

    startTransition(async () => {
      const result = await updateProfileAction(formData);
      setMessage(result.message);
      setIsError(!result.success);
    });
  }

  return (
    <form onSubmit={onSubmit} className="terminal-card space-y-5">
      <h2 className="terminal-heading">Edit Profile</h2>

      <div className="grid gap-5 md:grid-cols-2">
        <label className="space-y-2 text-sm">
          <span className="form-label">Username</span>
          <Input
            required
            value={username}
            onChange={(event) => setUsername(event.target.value.toLowerCase())}
            minLength={3}
            maxLength={32}
          />
        </label>

        <label className="space-y-2 text-sm">
          <span className="form-label">Display Name</span>
          <Input
            required
            value={displayName}
            onChange={(event) => setDisplayName(event.target.value)}
            minLength={2}
            maxLength={60}
          />
        </label>
      </div>

      <label className="space-y-2 text-sm">
        <span className="form-label">Bio</span>
        <Textarea value={bio} onChange={(event) => setBio(event.target.value)} maxLength={280} rows={4} />
      </label>

      <label className="space-y-2 text-sm">
        <span className="form-label">Avatar URL</span>
        <Input
          type="url"
          placeholder="https://..."
          value={avatarUrl}
          onChange={(event) => setAvatarUrl(event.target.value)}
        />
      </label>

      <label className="space-y-2 text-sm">
        <span className="form-label">Theme</span>
        <Select value={themeId} onChange={(event) => setThemeId(event.target.value)}>
          {themes.map((theme) => (
            <option key={theme.id} value={theme.id}>
              {theme.name}
            </option>
          ))}
        </Select>
      </label>

      <label className="flex items-center gap-3 text-sm text-muted">
        <input
          type="checkbox"
          checked={isPublic}
          onChange={(event) => setIsPublic(event.target.checked)}
          className="h-4 w-4 rounded border-border bg-panel text-accent focus:ring-accent"
        />
        Public profile visible
      </label>

      <p className="text-xs text-muted">
        Validation is basic format checking and does not guarantee account or chain-level correctness.
      </p>

      {message ? <p className={isError ? "text-sm text-red-300" : "text-sm text-accent"}>{message}</p> : null}

      <Button type="submit" variant="primary" className="dashboard-action" disabled={isPending}>
        {isPending ? "Saving..." : "Save profile"}
      </Button>
    </form>
  );
}
