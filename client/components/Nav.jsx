"use client";

import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useModal } from "./ModalProvider";
import ThemeToggle from "./ThemeToggle";

export default function Nav() {
  const router = useRouter();
  const pathname = usePathname();
  const { open } = useModal();

  // Auth state derives from localStorage (browser only). Default false on
  // server + first client render to avoid hydration mismatch.
  const [authed, setAuthed] = useState(false);

  useEffect(() => {
    setAuthed(!!localStorage.getItem("authToken"));
  }, [pathname]);

  const handlelogout = () => {
    localStorage.removeItem("authToken");
    setAuthed(false);
    router.push("/");
  };

  const isMarket = pathname === "/market";

  return (
    <header className="fixed w-full z-50 top-4 px-4 sm:px-6 lg:px-8">
      <nav
        aria-label="Primary"
        className="max-w-7xl mx-auto glass-card flex justify-between items-center h-[68px] px-4 sm:px-6"
      >
        {/* Logo */}
        <Link
          href="/"
          className="text-2xl md:text-3xl font-extrabold tracking-tight shrink-0"
        >
          <span className="text-foreground">Crypto</span>
          <span className="text-gradient">Folio</span>
        </Link>

        {/* Links */}
        <div className="flex items-center gap-3 sm:gap-4">
          <Link
            href="/market"
            aria-current={isMarket ? "page" : undefined}
            className={`nav-link text-base hidden sm:block ${isMarket ? "active" : ""}`}
          >
            Market
          </Link>

          <ThemeToggle />

          {!authed ? (
            <>
              <button
                type="button"
                onClick={() => open[0](true)}
                className="nav-link text-base hidden sm:block"
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => open[1](true)}
                className="btn-primary text-sm md:text-base"
              >
                Get Started
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={() => router.push("/dashboard")}
                aria-current={pathname === "/dashboard" ? "page" : undefined}
                className={`nav-link text-base ${pathname === "/dashboard" ? "active" : ""}`}
              >
                Dashboard
              </button>
              <button
                type="button"
                onClick={handlelogout}
                className="inline-flex items-center justify-center gap-2 font-medium py-2.5 px-5 rounded-lg text-sm md:text-base border border-danger/40 text-danger transition-colors duration-200 hover:bg-danger/10 hover:border-danger"
              >
                Sign Out
              </button>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}
