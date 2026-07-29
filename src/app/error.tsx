"use client";
export default function GlobalError({ reset }: { reset: () => void }) {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 p-6">
      <h1 className="text-xl font-semibold">Something went wrong</h1>
      <button
        className="rounded-lg bg-primary px-4 py-2 text-sm text-white"
        onClick={reset}
      >
        Try again
      </button>
    </main>
  );
}
