import {
  FaFacebookF,
  FaTwitter,
  FaInstagram,
  FaLinkedinIn,
  FaGithub,
} from "react-icons/fa";
import Link from "next/link";

const SOCIALS = [
  { Icon: FaFacebookF, label: "Facebook" },
  { Icon: FaTwitter, label: "Twitter" },
  { Icon: FaInstagram, label: "Instagram" },
  { Icon: FaLinkedinIn, label: "LinkedIn" },
  { Icon: FaGithub, label: "GitHub" },
];

export default function Footer() {
  return (
    <footer className="relative bg-surface/60 backdrop-blur-sm text-foreground pt-16 pb-8 overflow-hidden border-t border-border">
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-accent/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          {/* Brand */}
          <div className="space-y-4">
            <h2 className="text-3xl font-bold">
              <span className="text-foreground">Crypto</span>
              <span className="text-gradient">Folio</span>
            </h2>
            <p className="text-muted text-sm leading-relaxed">
              The next generation of crypto portfolio management. Secure, fast,
              and built for traders of every level.
            </p>
            <div className="flex gap-3 pt-2">
              {SOCIALS.map(({ Icon, label }) => (
                <a
                  key={label}
                  href="#"
                  aria-label={label}
                  className="w-11 h-11 grid place-items-center rounded-full bg-surface-2 text-muted border border-border hover:text-primary-foreground hover:bg-primary hover:border-primary transition-colors duration-200"
                >
                  <Icon className="w-4 h-4" aria-hidden="true" />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <nav aria-label="Footer">
            <h3 className="text-base font-semibold text-foreground mb-5">
              Quick Links
            </h3>
            <ul className="space-y-3">
              {[
                { label: "Home", href: "/" },
                { label: "Market", href: "/market" },
              ].map((item) => (
                <li key={item.label}>
                  <Link
                    href={item.href}
                    className="text-muted hover:text-primary transition-colors text-sm inline-flex items-center gap-2 group"
                  >
                    <span className="w-1.5 h-1.5 bg-border rounded-full group-hover:bg-primary transition-colors"></span>
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Support */}
          <div>
            <h3 className="text-base font-semibold text-foreground mb-5">
              Support
            </h3>
            <ul className="space-y-3">
              {["Help Center", "Terms of Service", "Legal", "Privacy Policy"].map(
                (item) => (
                  <li key={item}>
                    <a
                      href="#"
                      className="text-muted hover:text-accent transition-colors text-sm inline-flex items-center gap-2 group"
                    >
                      <span className="w-1.5 h-1.5 bg-border rounded-full group-hover:bg-accent transition-colors"></span>
                      {item}
                    </a>
                  </li>
                )
              )}
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h3 className="text-base font-semibold text-foreground mb-5">
              Newsletter
            </h3>
            <p className="text-muted text-sm mb-4">
              Subscribe for the latest crypto news and product updates.
            </p>
            <div className="relative">
              <label htmlFor="newsletter-email" className="sr-only">
                Email address
              </label>
              <input
                id="newsletter-email"
                type="email"
                placeholder="Enter your email"
                className="input-field pr-16 py-3 text-sm"
              />
              <button
                type="button"
                className="absolute right-1.5 top-1.5 bottom-1.5 px-4 rounded-md text-white text-sm font-semibold"
                style={{
                  backgroundImage:
                    "linear-gradient(to right, hsl(var(--primary)), hsl(var(--accent)))",
                }}
              >
                Go
              </button>
            </div>
          </div>
        </div>

        <div className="border-t border-border pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-muted text-sm text-center md:text-left">
            &copy; 2026 CryptoFolio. All rights reserved.
          </p>
          <div className="flex gap-6 text-sm text-muted">
            <a href="#" className="hover:text-foreground transition-colors">Privacy</a>
            <a href="#" className="hover:text-foreground transition-colors">Terms</a>
            <a href="#" className="hover:text-foreground transition-colors">Cookies</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
