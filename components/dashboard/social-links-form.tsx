"use client";

import { FormEvent, useState, useTransition } from "react";
import {
  createSocialLinkAction,
  deleteSocialLinkAction,
  moveSocialLinkAction,
  toggleSocialLinkAction
} from "@/actions/social-links";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type SocialLinksFormProps = {
  links: SocialLinkItem[];
};

type SocialLinkItem = {
  id: string;
  label: string;
  url: string;
  sortOrder: number;
  isVisible: boolean;
};

export function SocialLinksForm({ links }: SocialLinksFormProps) {
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);
  const [isError, setIsError] = useState(false);

  const [label, setLabel] = useState("");
  const [url, setUrl] = useState("");
  const [isVisible, setIsVisible] = useState(true);

  function runAction(executor: () => Promise<{ success: boolean; message: string }>) {
    setMessage(null);

    startTransition(async () => {
      const result = await executor();
      setMessage(result.message);
      setIsError(!result.success);

      if (result.success) {
        setLabel("");
        setUrl("");
        setIsVisible(true);
      }
    });
  }

  function handleCreate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    runAction(async () => {
      const formData = new FormData();
      formData.set("label", label);
      formData.set("url", url);
      if (isVisible) {
        formData.set("isVisible", "on");
      }
      return createSocialLinkAction(formData);
    });
  }

  function handleDelete(id: string) {
    runAction(async () => {
      const formData = new FormData();
      formData.set("id", id);
      return deleteSocialLinkAction(formData);
    });
  }

  function handleToggle(id: string) {
    runAction(async () => {
      const formData = new FormData();
      formData.set("id", id);
      return toggleSocialLinkAction(formData);
    });
  }

  function handleMove(id: string, direction: "up" | "down") {
    runAction(async () => {
      const formData = new FormData();
      formData.set("id", id);
      formData.set("direction", direction);
      return moveSocialLinkAction(formData);
    });
  }

  return (
    <div className="space-y-5">
      <form className="terminal-card space-y-5" onSubmit={handleCreate}>
        <h2 className="terminal-heading">Add Social/Contact Link</h2>

        <div className="grid gap-4 md:grid-cols-2">
          <label className="space-y-2 text-sm">
            <span className="form-label">Label</span>
            <Input required value={label} onChange={(event) => setLabel(event.target.value)} placeholder="GitHub" />
          </label>

          <label className="space-y-2 text-sm">
            <span className="form-label">URL</span>
            <Input
              required
              type="url"
              value={url}
              onChange={(event) => setUrl(event.target.value)}
              placeholder="https://github.com/username"
            />
          </label>
        </div>

        <label className="flex items-center gap-3 text-sm text-muted">
          <input
            type="checkbox"
            checked={isVisible}
            onChange={(event) => setIsVisible(event.target.checked)}
            className="h-4 w-4 rounded border-border bg-panel text-accent focus:ring-accent"
          />
          Visible on public profile
        </label>

        <div className="pt-2">
          <Button type="submit" variant="primary" className="dashboard-action" disabled={isPending}>
            {isPending ? "Saving..." : "Add link"}
          </Button>
        </div>
      </form>

      {message ? <p className={isError ? "text-sm text-red-300" : "text-sm text-accent"}>{message}</p> : null}

      {links.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border p-4 text-sm text-muted">No social links yet.</div>
      ) : (
        <section className="space-y-3">
          {links.map((link, index) => (
          <article key={link.id} className="terminal-card">
            <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold">{link.label}</p>
                  <p className="text-xs text-muted">{link.url}</p>
                  {!link.isVisible ? <p className="text-xs text-amber-200">Hidden on public profile</p> : null}
                </div>

                <div className="flex flex-wrap gap-2">
                  <Button className="dashboard-action-small" disabled={isPending || index === 0} onClick={() => handleMove(link.id, "up")}>
                    ↑
                  </Button>
                  <Button className="dashboard-action-small" disabled={isPending || index === links.length - 1} onClick={() => handleMove(link.id, "down")}>
                    ↓
                  </Button>
                  <Button className="dashboard-action-small" disabled={isPending} onClick={() => handleToggle(link.id)}>
                    {link.isVisible ? "Hide" : "Show"}
                  </Button>
                  <Button className="dashboard-action-small" variant="danger" disabled={isPending} onClick={() => handleDelete(link.id)}>
                    Delete
                  </Button>
                </div>
              </div>
            </article>
          ))}
        </section>
      )}
    </div>
  );
}
