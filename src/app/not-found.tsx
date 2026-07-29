import Link from "next/link";
export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-3 p-6 text-center">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
        404
      </p>
      <h1 className="text-2xl font-semibold">This view went missing</h1>
      <p className="text-sm text-muted-foreground">
        The page may have moved or you may not have access to it.
      </p>
      <Link
        className="mt-2 rounded-lg bg-primary px-4 py-2 text-sm text-white"
        href="/projects"
      >
        Back to projects
      </Link>
    </main>
  );
}
