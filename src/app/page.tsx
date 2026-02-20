import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-[calc(100vh-3.5rem)] bg-zinc-50 font-sans dark:bg-zinc-950">
      <main className="mx-auto max-w-3xl px-4 py-16 sm:px-6 sm:py-24">
        <section className="text-center">
          <h1 className="text-4xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50 sm:text-5xl">
            Welcome to Nebibs
          </h1>
          <p className="mt-4 text-lg leading-relaxed text-zinc-600 dark:text-zinc-400">
            This is your demo page. Edit{" "}
            <code className="rounded bg-zinc-200 px-1.5 py-0.5 font-mono text-sm dark:bg-zinc-800">
              src/app/page.tsx
            </code>{" "}
            to get started.
          </p>
        </section>
        <section className="mt-16 grid gap-6 sm:grid-cols-2">
          <Link
            href="/"
            className="group rounded-xl border border-zinc-200 bg-white p-6 transition hover:border-zinc-300 hover:shadow-sm dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-zinc-700"
          >
            <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
              Get started
            </h2>
            <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
              Explore the codebase and build something new.
            </p>
          </Link>
          <Link
            href="/"
            className="group rounded-xl border border-zinc-200 bg-white p-6 transition hover:border-zinc-300 hover:shadow-sm dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-zinc-700"
          >
            <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
              Deploy
            </h2>
            <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
              Already on Vercel. Push to your repo to redeploy.
            </p>
          </Link>
        </section>
      </main>
    </div>
  );
}
