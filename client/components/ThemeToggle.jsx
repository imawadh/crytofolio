"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { FiSun, FiMoon } from "react-icons/fi";

export default function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const isDark = resolvedTheme === "dark";

  // Render a stable placeholder until mounted to avoid hydration mismatch.
  return (
    <button
      type="button"
      aria-label={isDark ? "Switch to light theme" : "Switch to dark theme"}
      title={isDark ? "Switch to light theme" : "Switch to dark theme"}
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className="grid place-items-center w-11 h-11 rounded-lg border border-border bg-surface-2 text-foreground transition-colors duration-200 hover:border-primary/55"
    >
      {mounted ? (
        isDark ? (
          <FiSun className="w-5 h-5" aria-hidden="true" />
        ) : (
          <FiMoon className="w-5 h-5" aria-hidden="true" />
        )
      ) : (
        <span className="w-5 h-5" aria-hidden="true" />
      )}
    </button>
  );
}
