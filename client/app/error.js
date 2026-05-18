"use client";

import { useEffect } from "react";

export default function Error({ error, reset }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-dvh flex flex-col items-center justify-center text-center px-4 bg-background text-foreground">
      <div className="glass-card p-10 max-w-md">
        <h2 className="text-3xl font-bold mb-3">Something went wrong</h2>
        <p className="text-muted mb-6">
          An unexpected error occurred while loading this page.
        </p>
        <button onClick={() => reset()} className="btn-primary">
          Try again
        </button>
      </div>
    </div>
  );
}
