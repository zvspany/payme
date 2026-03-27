import { buttonStyles } from "@/components/ui/button";
import { SocialLink } from "@prisma/client";

type PublicSocialLink = Pick<SocialLink, "id" | "label" | "url">;

type SocialLinksListProps = {
  links: PublicSocialLink[];
};

export function SocialLinksList({ links }: SocialLinksListProps) {
  if (links.length === 0) {
    return null;
  }

  return (
    <section className="terminal-section space-y-3">
      <h2 className="terminal-heading">Social / Contact</h2>
      <ul className="space-y-3">
        {links.map((link) => (
          <li key={link.id}>
            <a
              href={link.url}
              target="_blank"
              rel="noreferrer"
              className={buttonStyles({ variant: "secondary", className: "bg-panel/45" })}
            >
              {link.label}
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}
