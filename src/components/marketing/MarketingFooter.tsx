import Link from "next/link";

const footerLinks = [
  { href: "/terms", label: "Terms of Service" },
  { href: "/privacy", label: "Privacy Policy" },
  { href: "/refund", label: "Refund Policy" },
];

export default function MarketingFooter() {
  return (
    <footer className="border-t pt-8 text-sm text-muted-foreground">
      <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
        <p>© {new Date().getFullYear()} StepSync Flow. All rights reserved.</p>
        <div className="flex flex-wrap gap-3">
          {footerLinks.map((link) => (
            <Link key={link.href} href={link.href} className="underline">
              {link.label}
            </Link>
          ))}
        </div>
      </div>
    </footer>
  );
}
