"use client";

import { useState, useMemo, useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  fetchExperiments,
  createExperimentThunk,
  updateExperimentThunk,
  deleteExperimentThunk,
  setStatus,
} from "@/store/slices/experimentsSlice";
import type { ExperimentStatus } from "@/store/types";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHoverable } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Select } from "@/components/ui/Select";
import { Modal } from "@/components/ui/Modal";
import { Badge } from "@/components/ui/Badge";

const statusOptions: { value: ExperimentStatus; label: string }[] = [
  { value: "not_started", label: "Not started" },
  { value: "in_progress", label: "In progress" },
  { value: "completed", label: "Completed" },
];

function statusVariant(
  s: ExperimentStatus
): "default" | "warning" | "success" {
  if (s === "completed") return "success";
  if (s === "in_progress") return "warning";
  return "default";
}

export default function ExperimentsPage() {
  const dispatch = useAppDispatch();
  const items = useAppSelector((s) => s.experiments.items);
  const [statusFilter, setStatusFilter] = useState<ExperimentStatus | "">("");
  const [viewMode, setViewMode] = useState<"table" | "cards">("table");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formTitle, setFormTitle] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formDependencies, setFormDependencies] = useState("");
  const [formNextAction, setFormNextAction] = useState("");
  const [formStatus, setFormStatus] = useState<ExperimentStatus>("not_started");
  const [formNotes, setFormNotes] = useState("");

  const filtered = useMemo(() => {
    if (!statusFilter) return items;
    return items.filter((x) => x.status === statusFilter);
  }, [items, statusFilter]);

  useEffect(() => {
    void dispatch(fetchExperiments());
  }, [dispatch]);

  function openAdd() {
    setEditingId(null);
    setFormTitle("");
    setFormDescription("");
    setFormDependencies("");
    setFormNextAction("");
    setFormStatus("not_started");
    setFormNotes("");
    setModalOpen(true);
  }

  function openEdit(item: {
    id: string;
    title: string;
    description: string;
    dependencies: string[];
    nextAction: string;
    status: ExperimentStatus;
    notes: string;
  }) {
    setEditingId(item.id);
    setFormTitle(item.title);
    setFormDescription(item.description);
    setFormDependencies(item.dependencies.join(", "));
    setFormNextAction(item.nextAction);
    setFormStatus(item.status);
    setFormNotes(item.notes);
    setModalOpen(true);
  }

  function handleSubmit() {
    if (!formTitle.trim()) return;
    const deps = formDependencies
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    if (editingId) {
      void dispatch(
        updateExperimentThunk({
          id: editingId,
          title: formTitle.trim(),
          description: formDescription.trim(),
          dependencies: deps,
          nextAction: formNextAction.trim(),
          status: formStatus,
          notes: formNotes.trim(),
        })
      );
    } else {
      void dispatch(
        createExperimentThunk({
          title: formTitle.trim(),
          description: formDescription.trim(),
          dependencies: deps,
          nextAction: formNextAction.trim(),
          status: formStatus,
          notes: formNotes.trim(),
        })
      );
    }
    setModalOpen(false);
  }

  return (
    <div className="min-h-[calc(100vh-3.5rem)]">
      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Experiments / Ideas
          </h1>
          <div className="flex flex-wrap items-center gap-2">
            <Select
              options={[
                { value: "", label: "All statuses" },
                ...statusOptions,
              ]}
              value={statusFilter}
              onChange={(e) =>
                setStatusFilter(
                  e.target.value === "" ? "" : (e.target.value as ExperimentStatus)
                )
              }
            />
            <div className="flex rounded-md border border-gray-300 dark:border-gray-600 overflow-hidden">
              <button
                type="button"
                onClick={() => setViewMode("table")}
                className={`px-3 py-1.5 text-sm font-medium transition-all duration-150 ${viewMode === "table" ? "bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white" : "bg-card-bg dark:bg-gray-800 text-gray-600 dark:text-gray-400"}`}
              >
                Table
              </button>
              <button
                type="button"
                onClick={() => setViewMode("cards")}
                className={`px-3 py-1.5 text-sm font-medium transition-all duration-150 ${viewMode === "cards" ? "bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white" : "bg-card-bg dark:bg-gray-800 text-gray-600 dark:text-gray-400"}`}
              >
                Cards
              </button>
            </div>
            <Button onClick={openAdd}>Add idea</Button>
          </div>
        </div>
        {viewMode === "table" && (
          <div className="mt-6 overflow-x-auto rounded-lg border border-gray-200 bg-card-bg shadow-md dark:border-gray-700">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="p-4 font-semibold text-gray-900 dark:text-white">
                    Title
                  </th>
                  <th className="p-4 font-semibold text-gray-900 dark:text-white">
                    Status
                  </th>
                  <th className="p-4 font-semibold text-gray-900 dark:text-white">
                    Next action
                  </th>
                  <th className="p-4 font-semibold text-gray-900 dark:text-white">
                    Dependencies
                  </th>
                  <th className="p-4 font-semibold text-gray-900 dark:text-white">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="stagger-children">
                {filtered.map((item) => (
                  <tr
                    key={item.id}
                    className="border-b border-gray-100 dark:border-gray-700 transition-all duration-200 ease-out hover:bg-gray-50 dark:hover:bg-gray-800/50"
                  >
                    <td className="p-4 font-medium text-gray-900 dark:text-white">
                      {item.title}
                    </td>
                    <td className="p-4">
                      <Badge variant={statusVariant(item.status)}>
                        {statusOptions.find((o) => o.value === item.status)
                          ?.label ?? item.status}
                      </Badge>
                    </td>
                    <td className="max-w-[200px] truncate p-4 text-gray-600 dark:text-gray-400">
                      {item.nextAction || "—"}
                    </td>
                    <td className="max-w-[120px] truncate p-4 text-xs text-gray-500 dark:text-gray-400">
                      {item.dependencies.length ? item.dependencies.join(", ") : "—"}
                    </td>
                    <td className="p-4">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openEdit(item)}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => void dispatch(deleteExperimentThunk(item.id))}
                      >
                        Delete
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filtered.length === 0 && (
              <p className="p-8 text-center text-gray-500 dark:text-gray-400">
                No ideas yet.
              </p>
            )}
          </div>
        )}
        {viewMode === "cards" && (
          <ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 stagger-children">
            {filtered.map((item) => (
              <li key={item.id}>
                <Card className="transition-all duration-200 ease-out hover:-translate-y-0.5 hover:shadow-lg">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-2">
                      <h2 className="font-semibold text-gray-900 dark:text-white">
                        {item.title}
                      </h2>
                      <Badge variant={statusVariant(item.status)}>
                        {statusOptions.find((o) => o.value === item.status)
                          ?.label ?? item.status}
                      </Badge>
                    </div>
                    {item.description && (
                      <p className="mt-2 text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                        {item.description}
                      </p>
                    )}
                    {item.nextAction && (
                      <p className="mt-2 text-sm text-gray-500 dark:text-gray-500">
                        Next: {item.nextAction}
                      </p>
                    )}
                    {item.dependencies.length > 0 && (
                      <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                        Deps: {item.dependencies.join(", ")}
                      </p>
                    )}
                    <div className="mt-3 flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openEdit(item)}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => void dispatch(deleteExperimentThunk(item.id))}
                      >
                        Delete
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </li>
            ))}
            {filtered.length === 0 && (
              <li className="col-span-full rounded-lg border border-dashed border-gray-300 bg-card-bg py-12 text-center text-sm text-gray-500 dark:border-gray-600 dark:text-gray-400">
                No ideas yet.
              </li>
            )}
          </ul>
        )}
        <Modal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          title={editingId ? "Edit idea" : "Add idea"}
        >
          <div className="space-y-4">
            <Input
              label="Title"
              value={formTitle}
              onChange={(e) => setFormTitle(e.target.value)}
              placeholder="Idea title"
            />
            <Textarea
              label="Description"
              value={formDescription}
              onChange={(e) => setFormDescription(e.target.value)}
              placeholder="Description"
              rows={3}
            />
            <Input
              label="Dependencies (comma-separated)"
              value={formDependencies}
              onChange={(e) => setFormDependencies(e.target.value)}
              placeholder="e.g. API key, design mockup"
            />
            <Input
              label="Next action (&lt;24h)"
              value={formNextAction}
              onChange={(e) => setFormNextAction(e.target.value)}
              placeholder="One concrete next step"
            />
            <Select
              label="Status"
              options={statusOptions}
              value={formStatus}
              onChange={(e) =>
                setFormStatus(e.target.value as ExperimentStatus)
              }
            />
            <Textarea
              label="Notes"
              value={formNotes}
              onChange={(e) => setFormNotes(e.target.value)}
              placeholder="Notes"
              rows={2}
            />
            <div className="flex justify-end gap-2">
              <Button variant="secondary" onClick={() => setModalOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSubmit}>
                {editingId ? "Save" : "Add"}
              </Button>
            </div>
          </div>
        </Modal>
      </main>
    </div>
  );
}
