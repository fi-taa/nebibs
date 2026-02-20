"use client";

import Link from "next/link";
import { useAppSelector } from "@/store/hooks";
import { CardContent, CardHoverable } from "@/components/ui/Card";

function LetterMotion({
  text,
  className = "",
}: {
  text: string;
  className?: string;
}) {
  const staggerMs = 60;
  return (
    <span className={className} aria-label={text}>
      {text.split("").map((char, i) => (
        <span
          key={i}
          className="hero-text-drift inline-block"
          style={{ animationDelay: `${i * staggerMs}ms` }}
        >
          {char === " " ? "\u00A0" : char}
        </span>
      ))}
    </span>
  );
}

function getWeekKey(d: Date): string {
  const start = new Date(d);
  start.setDate(d.getDate() - d.getDay());
  return start.toISOString().slice(0, 10);
}

export default function Home() {
  const goals = useAppSelector((s) => s.learning.goals);
  const experiments = useAppSelector((s) => s.experiments.items);
  const serviceEntries = useAppSelector((s) => s.service.entries);

  const totalIdeas = experiments.length;
  const inProgressCount = experiments.filter((e) => e.status === "in_progress").length;
  const thisWeekKey = getWeekKey(new Date());
  const learningHoursThisWeek = goals.reduce((sum, g) => {
    const w = g.weeklyHours.find((h) => h.weekKey === thisWeekKey);
    return sum + (w?.hours ?? 0);
  }, 0);
  const serviceHoursTotal = serviceEntries.reduce((sum, e) => sum + e.hours, 0);
  const serviceHoursThisWeek = serviceEntries
    .filter((e) => getWeekKey(new Date(e.date)) === thisWeekKey)
    .reduce((sum, e) => sum + e.hours, 0);

  return (
    <div className="relative min-h-[calc(100vh-3.5rem)]">
      <main className="relative mx-auto max-w-5xl px-4 py-12 sm:px-6 sm:py-16 lg:py-20">
        <section
          className="animate-fade-in-up text-center"
          style={{ animationDelay: "0ms" }}
        >
          <p className="inline-block text-sm font-semibold uppercase tracking-widest text-primary dark:text-secondary">
            <LetterMotion text="Personal lab" />
          </p>
          <h1 className="mt-3 text-4xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-5xl lg:text-6xl">
            <LetterMotion text="Learn, build, reflect." className="inline-block" />
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-lg text-gray-600 dark:text-gray-400">
            One place for learning goals, experiments, and service. Your hub for
            growth and impact.
          </p>
        </section>

        <section
          className="mt-16 opacity-0 sm:mt-20"
          style={{ animation: "fade-in-up 0.5s ease-out 100ms forwards" }}
        >
          <h2 className="mb-4 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
            At a glance
          </h2>
          <div className="grid gap-4 sm:grid-cols-3">
            <Link href="/experiments" className="group">
              <CardHoverable className="h-full border-gray-200/80 transition-all duration-200 group-hover:border-primary/30 group-hover:shadow-lg dark:border-gray-700/80 dark:group-hover:border-secondary/30">
                <CardContent className="flex flex-col p-6">
                  <span className="text-2xl font-bold tabular-nums text-gray-900 dark:text-white">
                    {totalIdeas}
                  </span>
                  <span className="mt-1 text-sm font-medium text-gray-500 dark:text-gray-400">
                    Ideas
                  </span>
                  {inProgressCount > 0 && (
                    <span className="mt-2 text-xs text-primary dark:text-secondary">
                      {inProgressCount} in progress
                    </span>
                  )}
                  <span className="mt-3 inline-flex items-center text-sm font-medium text-gray-400 opacity-0 transition-opacity duration-200 group-hover:opacity-100 dark:text-gray-500">
                    View experiments →
                  </span>
                </CardContent>
              </CardHoverable>
            </Link>
            <Link href="/learning" className="group">
              <CardHoverable className="h-full border-gray-200/80 transition-all duration-200 group-hover:border-primary/30 group-hover:shadow-lg dark:border-gray-700/80 dark:group-hover:border-secondary/30">
                <CardContent className="flex flex-col p-6">
                  <span className="text-2xl font-bold tabular-nums text-gray-900 dark:text-white">
                    {learningHoursThisWeek}h
                  </span>
                  <span className="mt-1 text-sm font-medium text-gray-500 dark:text-gray-400">
                    Learning this week
                  </span>
                  <span className="mt-3 inline-flex items-center text-sm font-medium text-gray-400 opacity-0 transition-opacity duration-200 group-hover:opacity-100 dark:text-gray-500">
                    View goals →
                  </span>
                </CardContent>
              </CardHoverable>
            </Link>
            <Link href="/service" className="group">
              <CardHoverable className="h-full border-gray-200/80 transition-all duration-200 group-hover:border-primary/30 group-hover:shadow-lg dark:border-gray-700/80 dark:group-hover:border-secondary/30">
                <CardContent className="flex flex-col p-6">
                  <span className="text-2xl font-bold tabular-nums text-gray-900 dark:text-white">
                    {serviceHoursTotal}h
                  </span>
                  <span className="mt-1 text-sm font-medium text-gray-500 dark:text-gray-400">
                    Service total
                  </span>
                  {serviceHoursThisWeek > 0 && (
                    <span className="mt-2 text-xs text-primary dark:text-secondary">
                      {serviceHoursThisWeek}h this week
                    </span>
                  )}
                  <span className="mt-3 inline-flex items-center text-sm font-medium text-gray-400 opacity-0 transition-opacity duration-200 group-hover:opacity-100 dark:text-gray-500">
                    View entries →
                  </span>
                </CardContent>
              </CardHoverable>
            </Link>
          </div>
        </section>

        <section
          className="mt-16 opacity-0 sm:mt-20"
          style={{ animation: "fade-in-up 0.5s ease-out 200ms forwards" }}
        >
          <h2 className="mb-4 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
            Quick actions
          </h2>
          <div className="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-center sm:gap-3">
            <Link
              href="/dashboard"
              className="inline-flex items-center justify-center rounded-md bg-primary px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-primary-hover hover:shadow-md dark:bg-primary dark:hover:opacity-90"
            >
              Open dashboard
            </Link>
            <Link
              href="/experiments"
              className="inline-flex items-center justify-center rounded-md border border-gray-300 bg-card-bg px-5 py-2.5 text-sm font-medium text-gray-700 transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md dark:border-gray-600 dark:text-gray-300 dark:hover:border-secondary/40 dark:hover:bg-gray-800"
            >
              Add idea
            </Link>
            <Link
              href="/learning"
              className="inline-flex items-center justify-center rounded-md border border-gray-300 bg-card-bg px-5 py-2.5 text-sm font-medium text-gray-700 transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md dark:border-gray-600 dark:text-gray-300 dark:hover:border-secondary/40 dark:hover:bg-gray-800"
            >
              Learning
            </Link>
            <Link
              href="/service"
              className="inline-flex items-center justify-center rounded-md border border-gray-300 bg-card-bg px-5 py-2.5 text-sm font-medium text-gray-700 transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md dark:border-gray-600 dark:text-gray-300 dark:hover:border-secondary/40 dark:hover:bg-gray-800"
            >
              Log service
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}
