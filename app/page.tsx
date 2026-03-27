import Link from "next/link";
import { auth } from "@/lib/auth";
import { buttonStyles } from "@/components/ui/button";

const previewRows = [
  {
    title: "PayPal",
    meta: "paypal.me/alexdev",
    value: "alexdev",
    actions: "copy · open"
  },
  {
    title: "USDT",
    meta: "TRC20",
    value: "TQ6...k2S",
    actions: "copy · qr"
  },
  {
    title: "Bank Transfer",
    meta: "IBAN",
    value: "DE89 3704 0044 0532 0130 00",
    actions: "copy"
  }
];

const howItWorks = [
  "Create an account and choose your public username.",
  "Add payment methods and optional social/contact links.",
  "Share your profile URL so people can copy details or scan QR."
];

const whyPayMe = [
  "No custody: PayMe does not hold funds.",
  "No processing: PayMe does not execute transactions.",
  "Self-hosted: run it on your own infrastructure.",
  "Open source: inspect and modify everything.",
  "Privacy-friendly: minimal profile data, no tracking layer built in."
];

export default async function HomePage() {
  const session = await auth();

  const primaryHref = session?.user ? "/dashboard" : "/register";
  const primaryLabel = session?.user ? "Open dashboard" : "Create your profile";

  return (
    <main className="terminal-shell md:px-8 md:py-16">
      <section className="space-y-7">
        <div className="space-y-4">
          <p className="terminal-heading">PayMe</p>
          <h1 className="max-w-3xl text-3xl font-semibold leading-tight md:text-5xl">
            One public page for every way people can pay you.
          </h1>
          <p className="max-w-3xl text-lg leading-relaxed text-muted">
            Self-hosted payment profile pages for creators, freelancers, and OSS maintainers. No custody. No
            transaction processing. Just clear payment details and links.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 md:gap-4">
          <Link
            href={primaryHref}
            className={buttonStyles({
              variant: "primary",
              className: "relative -top-1 min-h-[3.1rem] min-w-[13rem] justify-center px-6"
            })}
          >
            {primaryLabel}
          </Link>
          <a
            href="#example"
            className={buttonStyles({
              variant: "secondary",
              className: "relative -top-1 min-h-[3.1rem] min-w-[10.75rem] justify-center px-5"
            })}
            style={{ marginLeft: "14px" }}
          >
            View example
          </a>
        </div>
      </section>

      <section id="example" className="mt-8 space-y-5 md:mt-10">
        <div className="space-y-2">
          <h2 className="text-2xl font-bold">Profile preview</h2>
          <p className="text-sm text-muted">How a public PayMe profile is presented.</p>
        </div>

        <div className="terminal-card space-y-5 md:p-6">
          <div className="space-y-1 border-b border-border/70 pb-4">
            <p className="terminal-heading">Public profile</p>
            <p className="pt-1 text-2xl font-bold">Alex Rivera</p>
            <p className="text-sm text-muted">@alexdev</p>
            <p className="pt-2 text-base text-muted">Open source maintainer. Donations keep maintenance sustainable.</p>
          </div>

          <ul className="list-none space-y-3 p-0">
            {previewRows.map((row) => (
              <li key={row.title} className="method-card">
                <div className="method-card-grid">
                  <div className="method-card-content">
                    <p className="method-card-title">{row.title}</p>
                    <p className="method-card-meta">{row.meta}</p>
                    <p className="method-card-value">{row.value}</p>
                  </div>
                  <p className="text-xs uppercase tracking-[0.12em] text-muted">{row.actions}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="terminal-section grid gap-5 md:grid-cols-2 md:gap-6 md:pt-10">
        <div className="terminal-card space-y-4 md:p-6">
          <h2 className="text-2xl font-bold">How it works</h2>
          <ol className="list-decimal space-y-3 pl-5 text-sm leading-relaxed text-muted">
            {howItWorks.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ol>
        </div>

        <div className="terminal-card space-y-4 md:p-6">
          <h2 className="text-2xl font-bold">Why PayMe</h2>
          <ul className="list-none space-y-3 p-0 text-sm leading-relaxed text-muted">
            {whyPayMe.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      </section>
    </main>
  );
}
