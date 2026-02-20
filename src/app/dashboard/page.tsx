"use client";

import Link from "next/link";
import { useAppSelector } from "@/store/hooks";
import { Card, CardContent, CardHoverable } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";

function getWeekKey(d: Date): string {
  const start = new Date(d);
  start.setDate(d.getDate() - d.getDay());
  return start.toISOString().slice(0, 10);
}

export default function DashboardPage() {
  const goals = useAppSelector((s) => s.learning.goals);
  const experiments = useAppSelector((s) => s.experiments.items);
  const serviceEntries = useAppSelector((s) => s.service.entries);

  const thisWeekKey = getWeekKey(new Date());
  const learningHoursThisWeek = goals.reduce((sum, g) => {
    const w = g.weeklyHours.find((h) => h.weekKey === thisWeekKey);
    return sum + (w?.hours ?? 0);
  }, 0);
  const serviceHoursThisWeek = serviceEntries
    .filter((e) => getWeekKey(new Date(e.date)) === thisWeekKey)
    .reduce((sum, e) => sum + e.hours, 0);
  const totalIdeas = experiments.length;
  const completedCount = experiments.filter((e) => e.status === "completed").length;

  const inProgress = experiments.filter((e) => e.status === "in_progress");
  const withNextAction = experiments.filter(
    (e) => e.status === "in_progress" && e.nextAction.trim()
  );
  const blocked = experiments.filter(
    (e) => e.status === "in_progress" && !e.nextAction.trim()
  );

  return (
    <div className="min-h-[calc(100vh-3.5rem)] bg-background">
      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white sm:text-3xl">
          Dashboard
        </h1>
        <p className="mt-1 text-base font-normal text-gray-500 dark:text-gray-400">
          Overview of learning, experiments, and service.
        </p>

        <section className="mt-8">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Weekly summary
          </h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Link href="/learning">
              <CardHoverable>
                <CardContent className="p-4">
                  <p className="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
                    Learning
                  </p>
                  <p className="mt-2 text-2xl font-bold text-gray-900 dark:text-white">
                    {learningHoursThisWeek}h
                  </p>
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    this week
                  </p>
                </CardContent>
              </CardHoverable>
            </Link>
            <Link href="/service">
              <CardHoverable>
                <CardContent className="p-4">
                  <p className="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
                    Service
                  </p>
                  <p className="mt-2 text-2xl font-bold text-gray-900 dark:text-white">
                    {serviceHoursThisWeek}h
                  </p>
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    this week
                  </p>
                </CardContent>
              </CardHoverable>
            </Link>
            <Link href="/experiments">
              <CardHoverable>
                <CardContent className="p-4">
                  <p className="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
                    Ideas
                  </p>
                  <p className="mt-2 text-2xl font-bold text-gray-900 dark:text-white">
                    {totalIdeas}
                  </p>
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    total
                  </p>
                </CardContent>
              </CardHoverable>
            </Link>
            <Link href="/experiments">
              <CardHoverable>
                <CardContent className="p-4">
                  <p className="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
                    Completed
                  </p>
                  <p className="mt-2 text-2xl font-bold text-gray-900 dark:text-white">
                    {completedCount}
                  </p>
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    experiments
                  </p>
                </CardContent>
              </CardHoverable>
            </Link>
          </div>
        </section>

        <section className="mt-8">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Next actions
          </h2>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            In progress with a clear next step.
          </p>
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {withNextAction.length === 0 && (
              <Card className="sm:col-span-2 lg:col-span-3">
                <CardContent className="py-8 text-center text-sm text-gray-500 dark:text-gray-400">
                  No in-progress experiments with next actions.
                </CardContent>
              </Card>
            )}
            {withNextAction.map((e) => (
              <Link key={e.id} href="/experiments">
                <CardHoverable>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-semibold text-gray-900 dark:text-white">
                        {e.title}
                      </h3>
                      <Badge variant="warning">In progress</Badge>
                    </div>
                    <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                      Next: {e.nextAction}
                    </p>
                    <span className="mt-2 inline-block text-xs font-medium text-primary dark:text-secondary">
                      Edit →
                    </span>
                  </CardContent>
                </CardHoverable>
              </Link>
            ))}
          </div>
        </section>

        <section className="mt-8">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Blocked
          </h2>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            In progress but no next action set.
          </p>
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {blocked.length === 0 && (
              <Card className="sm:col-span-2 lg:col-span-3">
                <CardContent className="py-8 text-center text-sm text-gray-500 dark:text-gray-400">
                  No blocked items.
                </CardContent>
              </Card>
            )}
            {blocked.map((e) => (
              <Link key={e.id} href="/experiments">
                <CardHoverable className="border-amber-200 dark:border-amber-800/80">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-semibold text-gray-900 dark:text-white">
                        {e.title}
                      </h3>
                      <Badge variant="warning">No next action</Badge>
                    </div>
                    <span className="mt-2 inline-block text-xs font-medium text-primary dark:text-secondary">
                      Add next action →
                    </span>
                  </CardContent>
                </CardHoverable>
              </Link>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
