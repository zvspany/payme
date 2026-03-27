import Link from "next/link";
import { LoginForm } from "@/components/auth/login-form";

export default function LoginPage() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md flex-col justify-center px-6 py-16">
      <div className="rounded-xl border border-border/80 bg-panel/50 p-6 md:p-7">
        <div className="mb-8 space-y-3">
          <p className="text-xs uppercase tracking-[0.2em] text-muted">PayMe</p>
          <h1 className="text-2xl font-semibold">Sign in</h1>
          <p className="text-sm text-muted">Use your email and password to manage your public payment profile.</p>
        </div>
        <LoginForm />
        <p className="mt-6 text-sm text-muted">
          No account yet?{" "}
          <Link href="/register" className="text-accent underline underline-offset-4 hover:text-text">
            Create one
          </Link>
        </p>
      </div>
    </main>
  );
}
