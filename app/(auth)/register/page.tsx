import Link from "next/link";
import { RegisterForm } from "@/components/auth/register-form";

export default function RegisterPage() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md flex-col justify-center px-6 py-16">
      <div className="rounded-xl border border-border/80 bg-panel/50 p-6 md:p-7">
        <div className="mb-8 space-y-3">
          <p className="text-xs uppercase tracking-[0.2em] text-muted">PayMe</p>
          <h1 className="text-2xl font-semibold">Create account</h1>
          <p className="text-sm text-muted">Start publishing your payment details in a self-hosted profile.</p>
        </div>
        <RegisterForm />
        <p className="mt-6 text-sm text-muted">
          Already registered?{" "}
          <Link href="/login" className="text-accent underline underline-offset-4 hover:text-text">
            Sign in
          </Link>
        </p>
      </div>
    </main>
  );
}
