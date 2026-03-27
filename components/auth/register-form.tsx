"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function RegisterForm() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setPending(true);

    const response = await fetch("/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email,
        username,
        displayName,
        password
      })
    });

    const payload = (await response.json().catch(() => null)) as { message?: string } | null;
    setPending(false);

    if (!response.ok) {
      setError(payload?.message ?? "Could not create account");
      return;
    }

    router.push("/login?registered=1");
  }

  return (
    <form className="space-y-4" onSubmit={onSubmit}>
      <label className="block space-y-2 text-sm">
        <span className="text-muted">Email</span>
        <Input
          required
          type="email"
          autoComplete="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
        />
      </label>

      <label className="block space-y-2 text-sm">
        <span className="text-muted">Username</span>
        <Input
          required
          minLength={3}
          maxLength={32}
          pattern="[a-z0-9_]{3,32}"
          placeholder="yourname"
          value={username}
          onChange={(event) => setUsername(event.target.value.toLowerCase())}
        />
      </label>

      <label className="block space-y-2 text-sm">
        <span className="text-muted">Display Name</span>
        <Input
          required
          minLength={2}
          maxLength={60}
          value={displayName}
          onChange={(event) => setDisplayName(event.target.value)}
        />
      </label>

      <label className="block space-y-2 text-sm">
        <span className="text-muted">Password</span>
        <Input
          required
          type="password"
          autoComplete="new-password"
          minLength={8}
          value={password}
          onChange={(event) => setPassword(event.target.value)}
        />
      </label>

      <p className="text-xs text-muted">
        Password must be at least 8 chars and include uppercase, lowercase, and a number.
      </p>

      {error ? <p className="text-sm text-red-300">{error}</p> : null}

      <Button type="submit" variant="primary" className="w-full" disabled={pending}>
        {pending ? "Creating account..." : "Create account"}
      </Button>
    </form>
  );
}
