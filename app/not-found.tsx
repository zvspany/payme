import Link from "next/link";

export default function NotFoundPage() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-lg flex-col items-center justify-center px-6 py-16 text-center">
      <p className="text-xs uppercase tracking-[0.2em] text-muted">404</p>
      <h1 className="mt-3 text-2xl font-semibold">Profile not found</h1>
      <p className="mt-3 text-sm text-muted">
        This profile is unavailable or currently private.
      </p>
      <Link href="/" className="mt-6 rounded-md border border-border px-3 py-2 text-sm text-muted hover:text-text">
        Back to home
      </Link>
    </main>
  );
}
