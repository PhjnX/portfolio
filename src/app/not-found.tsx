import Link from "next/link";

export default function NotFound() {
  return (
    <main className="grid min-h-dvh place-items-center px-4 text-center">
      <div>
        <p className="text-sm font-bold text-muted">404</p>
        <h1 className="mt-2 font-display text-4xl font-bold tracking-tight md:text-5xl">Page not found</h1>
        <Link
          href="/"
          className="mt-8 inline-flex rounded-full bg-fg px-5 py-3 text-sm font-bold text-bg transition-opacity hover:opacity-85"
        >
          Back home
        </Link>
      </div>
    </main>
  );
}
