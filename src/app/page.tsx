"use client";

import Link from "next/link";
import { useAppSelector } from "@/store/hooks";
import { CardContent, CardHoverable } from "@/components/ui/Card";

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
    <div className="min-h-[calc(100vh-3.5rem)] bg-background">
      <main className="mx-auto max-w-4xl px-4 py-16 sm:px-6 sm:py-24">
        <section className="text-center">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
            My personal lab for learning, building, and reflecting.
          </h1>
          <p className="mt-4 text-lg font-normal text-gray-600 dark:text-gray-400">
            Track learning goals, experiments, and service in one place.
          </p>
        </section>
        <section className="mt-12 grid gap-4 sm:grid-cols-3">
          <Link href="/experiments">
            <CardHoverable>
              <CardContent className="p-6">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Total ideas
                </p>
                <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">
                  {totalIdeas}
                </p>
              </CardContent>
            </CardHoverable>
          </Link>
          <Link href="/learning">
            <CardHoverable>
              <CardContent className="p-6">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Learning this week
                </p>
                <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">
                  {learningHoursThisWeek}h
                </p>
              </CardContent>
            </CardHoverable>
          </Link>
          <Link href="/service">
            <CardHoverable>
              <CardContent className="p-6">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Service hours
                </p>
                <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">
                  {serviceHoursThisWeek}h this week · {serviceHoursTotal}h total
                </p>
              </CardContent>
            </CardHoverable>
          </Link>
        </section>
        <section className="mt-12 flex flex-wrap justify-center gap-4">
          <Link
            href="/learning"
            className="rounded-md border border-gray-300 bg-card-bg px-4 py-2 text-sm font-medium text-gray-700 transition-all duration-150 hover:-translate-y-0.5 hover:shadow-md dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800"
          >
            Learning
          </Link>
          <Link
            href="/experiments"
            className="rounded-md border border-gray-300 bg-card-bg px-4 py-2 text-sm font-medium text-gray-700 transition-all duration-150 hover:-translate-y-0.5 hover:shadow-md dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800"
          >
            Experiments
          </Link>
          <Link
            href="/service"
            className="rounded-md border border-gray-300 bg-card-bg px-4 py-2 text-sm font-medium text-gray-700 transition-all duration-150 hover:-translate-y-0.5 hover:shadow-md dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800"
          >
            Service
          </Link>
          <Link
            href="/dashboard"
            className="rounded-md border border-gray-300 bg-card-bg px-4 py-2 text-sm font-medium text-gray-700 transition-all duration-150 hover:-translate-y-0.5 hover:shadow-md dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800"
          >
            Dashboard
          </Link>
        </section>
      </main>
    </div>
  );
}
