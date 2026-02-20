import type { Experiment, LearningGoal, ServiceEntry } from "@/store/types";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "https://nebibs-backend.onrender.com";

function mapGoal(r: Record<string, unknown>): LearningGoal {
  return {
    id: String(r.id),
    title: String(r.title),
    targetHours:
      r.target_hours != null ? Number(r.target_hours) : undefined,
    progressPercent: Number(r.progress_percent ?? 0),
    notes: String(r.notes ?? ""),
    resources: Array.isArray(r.resources) ? (r.resources as string[]) : [],
    weeklyHours: Array.isArray(r.weekly_hours)
      ? (r.weekly_hours as { week_key: string; hours: number }[]).map(
          (w) => ({ weekKey: w.week_key, hours: Number(w.hours) })
        )
      : [],
    createdAt: String(r.created_at),
    updatedAt: String(r.updated_at),
  };
}

function mapExperiment(r: Record<string, unknown>): Experiment {
  return {
    id: String(r.id),
    title: String(r.title),
    description: String(r.description ?? ""),
    dependencies: Array.isArray(r.dependencies) ? (r.dependencies as string[]) : [],
    nextAction: String(r.next_action ?? ""),
    status: String(r.status ?? "not_started") as Experiment["status"],
    notes: String(r.notes ?? ""),
    createdAt: String(r.created_at),
    updatedAt: String(r.updated_at),
  };
}

function mapServiceEntry(r: Record<string, unknown>): ServiceEntry {
  return {
    id: String(r.id),
    date: String(r.date).slice(0, 10),
    description: String(r.description),
    hours: Number(r.hours),
    reflection: String(r.reflection ?? ""),
    createdAt: String(r.created_at),
    updatedAt: String(r.updated_at),
  };
}

async function request<T>(
  path: string,
  options?: RequestInit & { method?: string; body?: unknown }
): Promise<T> {
  const { method = "GET", body, ...rest } = options ?? {};
  const res = await fetch(`${API_URL}${path}`, {
    method,
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      ...rest.headers,
    },
    ...(body != null && { body: JSON.stringify(body) }),
    ...rest,
  });
  if (!res.ok) {
    const text = await res.text();
    let detail = text;
    try {
      const j = JSON.parse(text) as { detail?: string };
      detail = j.detail ?? text;
    } catch {
      // use text as-is
    }
    throw new Error(detail);
  }
  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

export const learningApi = {
  list: () =>
    request<Record<string, unknown>[]>("/learning/goals").then((rows) =>
      rows.map(mapGoal)
    ),
  create: (body: {
    title: string;
    target_hours?: number;
    notes?: string;
  }) =>
    request<Record<string, unknown>>("/learning/goals", {
      method: "POST",
      body,
    }).then(mapGoal),
  update: (id: string, body: Record<string, unknown>) =>
    request<Record<string, unknown>>(`/learning/goals/${id}`, {
      method: "PATCH",
      body,
    }).then(mapGoal),
  delete: (id: string) =>
    request<undefined>(`/learning/goals/${id}`, { method: "DELETE" }),
};

export const experimentsApi = {
  list: () =>
    request<Record<string, unknown>[]>("/experiments").then((rows) =>
      rows.map(mapExperiment)
    ),
  create: (body: Record<string, unknown>) =>
    request<Record<string, unknown>>("/experiments", {
      method: "POST",
      body,
    }).then(mapExperiment),
  update: (id: string, body: Record<string, unknown>) =>
    request<Record<string, unknown>>(`/experiments/${id}`, {
      method: "PATCH",
      body,
    }).then(mapExperiment),
  delete: (id: string) =>
    request<undefined>(`/experiments/${id}`, { method: "DELETE" }),
};

export const serviceApi = {
  list: () =>
    request<Record<string, unknown>[]>("/service/entries").then((rows) =>
      rows.map(mapServiceEntry)
    ),
  create: (body: {
    date: string;
    description: string;
    hours: number;
    reflection?: string;
  }) =>
    request<Record<string, unknown>>("/service/entries", {
      method: "POST",
      body,
    }).then(mapServiceEntry),
  update: (id: string, body: Record<string, unknown>) =>
    request<Record<string, unknown>>(`/service/entries/${id}`, {
      method: "PATCH",
      body,
    }).then(mapServiceEntry),
  delete: (id: string) =>
    request<undefined>(`/service/entries/${id}`, { method: "DELETE" }),
};
