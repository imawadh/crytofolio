import Link from "next/link";

export const metadata = {
  title: "Page Not Found",
};

export default function NotFound() {
  return (
    <div className="min-h-dvh flex flex-col items-center justify-center text-center px-4 bg-background text-foreground">
      <div className="glass-card p-10 max-w-md">
        <h2 className="text-6xl font-black mb-2 text-gradient">404</h2>
        <p className="text-xl font-bold mb-2">Page not found</p>
        <p className="text-muted mb-6">
          The page you are looking for doesn&apos;t exist or has been moved.
        </p>
        <Link href="/" className="btn-primary">
          Back to Home
        </Link>
      </div>
    </div>
  );
}
