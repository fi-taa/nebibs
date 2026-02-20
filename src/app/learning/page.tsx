"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  createGoal,
  addGoalOptimistic,
  updateGoalThunk,
  deleteGoalThunk,
  deleteGoalOptimistic,
  fetchGoals,
} from "@/store/slices/learningSlice";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Modal } from "@/components/ui/Modal";
import { Collapsible } from "@/components/ui/Collapsible";

function getWeekKey(d: Date): string {
  const start = new Date(d);
  start.setDate(d.getDate() - d.getDay());
  return start.toISOString().slice(0, 10);
}

export default function LearningPage() {
  const searchParams = useSearchParams();
  const idFromUrl = searchParams.get("id");
  const dispatch = useAppDispatch();
  const goals = useAppSelector((s) => s.learning.goals);
  const creatingGoal = useAppSelector((s) => s.learning.creatingGoal);
  const updatingGoalId = useAppSelector((s) => s.learning.updatingGoalId);
  const deletingGoalId = useAppSelector((s) => s.learning.deletingGoalId);
  const [selectedId, setSelectedId] = useState<string | null>(idFromUrl);
  const [modalOpen, setModalOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [targetHours, setTargetHours] = useState("");
  const [notes, setNotes] = useState("");

  const selected = goals.find((g) => g.id === selectedId);

  useEffect(() => {
    void dispatch(fetchGoals());
  }, [dispatch]);

  useEffect(() => {
    if (idFromUrl && goals.some((g) => g.id === idFromUrl))
      setSelectedId(idFromUrl);
  }, [idFromUrl, goals]);

  useEffect(() => {
    if (goals.length > 0 && !selectedId) setSelectedId(goals[0].id);
    if (selectedId && !goals.find((g) => g.id === selectedId))
      setSelectedId(goals[0]?.id ?? null);
  }, [goals, selectedId]);

  function handleAdd() {
    if (!title.trim()) return;
    const payload = {
      title: title.trim(),
      targetHours: targetHours ? Number(targetHours) : undefined,
      notes: notes.trim() || undefined,
    };
    dispatch(addGoalOptimistic(payload));
    void dispatch(createGoal(payload));
    setTitle("");
    setTargetHours("");
    setNotes("");
    setModalOpen(false);
  }

  return (
    <div className="min-h-[calc(100vh-3.5rem)]">
      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Learning
          </h1>
          <Button
            onClick={() => setModalOpen(true)}
            disabled={creatingGoal}
          >
            {creatingGoal ? "Adding…" : "Add goal"}
          </Button>
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-[320px_1fr]">
          <aside className="space-y-2 stagger-children">
            {goals.length === 0 && (
              <Card>
                <CardContent className="py-8 text-center text-sm text-gray-500 dark:text-gray-400">
                  No goals yet. Add one to get started.
                </CardContent>
              </Card>
            )}
            {goals.map((g) => (
              <button
                key={g.id}
                type="button"
                onClick={() => setSelectedId(g.id)}
                className={`w-full rounded-lg border px-4 py-3 text-left transition-all duration-200 ease-out ${
                  selectedId === g.id
                    ? "border-primary bg-card-bg shadow-md dark:border-secondary"
                    : "border-gray-200 bg-card-bg hover:-translate-y-0.5 hover:shadow-md active:scale-[0.99] dark:border-gray-700"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium text-gray-900 dark:text-white">
                    {g.title}
                  </span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {g.progressPercent}%
                  </span>
                </div>
                {g.targetHours != null && (
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    Target: {g.targetHours}h
                  </p>
                )}
              </button>
            ))}
          </aside>

          <div className="min-w-0">
            {!selected ? (
              <Card>
                <CardContent className="py-12 text-center text-sm text-gray-500 dark:text-gray-400">
                  Select a goal or add one to view details and notes.
                </CardContent>
              </Card>
            ) : (
              <LearningDetailPanel
                goal={selected}
                onDelete={() => setSelectedId(null)}
                updatingGoalId={updatingGoalId}
                deletingGoalId={deletingGoalId}
              />
            )}
          </div>
        </div>

        <Modal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          title="Add learning goal"
        >
          <div className="space-y-4">
            <Input
              label="Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Ge'ez, Leadership"
            />
            <Input
              label="Target hours (optional)"
              type="number"
              min={0}
              value={targetHours}
              onChange={(e) => setTargetHours(e.target.value)}
              placeholder="e.g. 20"
            />
            <Input
              label="Notes (optional)"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Initial notes"
            />
            <div className="flex justify-end gap-2">
              <Button
                variant="secondary"
                onClick={() => setModalOpen(false)}
                disabled={creatingGoal}
              >
                Cancel
              </Button>
              <Button onClick={handleAdd} disabled={creatingGoal}>
                {creatingGoal ? "Adding…" : "Add"}
              </Button>
            </div>
          </div>
        </Modal>
      </main>
    </div>
  );
}

function LearningDetailPanel({
  goal,
  onDelete,
  updatingGoalId,
  deletingGoalId,
}: {
  goal: {
    id: string;
    title: string;
    targetHours?: number;
    progressPercent: number;
    notes: string;
    resources: string[];
    weeklyHours: { weekKey: string; hours: number }[];
  };
  onDelete: () => void;
  updatingGoalId: string | null;
  deletingGoalId: string | null;
}) {
  const dispatch = useAppDispatch();
  const [editTitle, setEditTitle] = useState(goal.title);
  const [editProgress, setEditProgress] = useState(goal.progressPercent);
  const [editNotes, setEditNotes] = useState(goal.notes);
  const [newResource, setNewResource] = useState("");
  const [weeklyHours, setWeeklyHours] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const isUpdating = updatingGoalId === goal.id;
  const isDeleting = deletingGoalId === goal.id;

  useEffect(() => {
    setEditTitle(goal.title);
    setEditProgress(goal.progressPercent);
    setEditNotes(goal.notes);
  }, [goal.id, goal.title, goal.progressPercent, goal.notes]);

  function handleSave() {
    void dispatch(
      updateGoalThunk({
        id: goal.id,
        title: editTitle.trim(),
        progressPercent: Math.min(100, Math.max(0, editProgress)),
        notes: editNotes,
      })
    );
  }

  function handleAddResource() {
    if (!newResource.trim()) return;
    void dispatch(
      updateGoalThunk({
        id: goal.id,
        resources: [...goal.resources, newResource.trim()],
      })
    );
    setNewResource("");
  }

  function handleLogHours() {
    const hours = Number(weeklyHours);
    if (Number.isNaN(hours) || hours < 0) return;
    const weekKey = getWeekKey(new Date());
    const existing = goal.weeklyHours.find((w) => w.weekKey === weekKey);
    const nextWeeklyHours = existing
      ? goal.weeklyHours.map((w) =>
          w.weekKey === weekKey ? { ...w, hours } : w
        )
      : [...goal.weeklyHours, { weekKey, hours }];
    void dispatch(
      updateGoalThunk({ id: goal.id, weeklyHours: nextWeeklyHours })
    );
    setWeeklyHours("");
  }

  function handleDelete() {
    dispatch(deleteGoalOptimistic(goal.id));
    void dispatch(deleteGoalThunk(goal.id));
    setDeleteConfirm(false);
    onDelete();
  }

  return (
    <>
      <Card>
        <CardContent className="p-6 space-y-6">
          <Input
            label="Title"
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            onBlur={handleSave}
          />
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Progress %
            </label>
            <div className="flex items-center gap-4">
              <input
                type="range"
                min={0}
                max={100}
                value={editProgress}
                onChange={(e) => setEditProgress(Number(e.target.value))}
                onMouseUp={handleSave}
                onTouchEnd={handleSave}
                className="flex-1"
              />
              <span className="text-sm text-gray-500 dark:text-gray-400 w-10">
                {editProgress}%
              </span>
            </div>
          </div>

          <Collapsible title="Notes" defaultOpen>
            <Textarea
              value={editNotes}
              onChange={(e) => setEditNotes(e.target.value)}
              onBlur={handleSave}
              rows={4}
              placeholder="Reflections and notes..."
            />
          </Collapsible>

          <Collapsible title="Resources" defaultOpen={false}>
            <div className="flex gap-2">
              <Input
                placeholder="Add a link or resource"
                value={newResource}
                onChange={(e) => setNewResource(e.target.value)}
                onKeyDown={(e) =>
                  e.key === "Enter" && (e.preventDefault(), handleAddResource())
                }
              />
              <Button
                variant="secondary"
                onClick={handleAddResource}
                disabled={isUpdating}
              >
                {isUpdating ? "Saving…" : "Add"}
              </Button>
            </div>
            <ul className="mt-3 space-y-2">
              {goal.resources.map((r, i) => (
                <li
                  key={i}
                  className="flex items-center justify-between rounded-md bg-gray-100 py-2 px-3 text-sm dark:bg-gray-800"
                >
                  <a
                    href={r.startsWith("http") ? r : `https://${r}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="truncate max-w-[80%] text-gray-700 dark:text-gray-300"
                  >
                    {r}
                  </a>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                      void dispatch(
                        updateGoalThunk({
                          id: goal.id,
                          resources: goal.resources.filter((_, j) => j !== i),
                        })
                      )
                    }
                  >
                    Remove
                  </Button>
                </li>
              ))}
            </ul>
          </Collapsible>

          <Collapsible title="Log hours this week" defaultOpen={false}>
            <div className="flex gap-2">
              <Input
                type="number"
                min={0}
                step={0.5}
                placeholder="Hours"
                value={weeklyHours}
                onChange={(e) => setWeeklyHours(e.target.value)}
              />
              <Button
                variant="secondary"
                onClick={handleLogHours}
                disabled={isUpdating}
              >
                {isUpdating ? "Saving…" : "Log"}
              </Button>
            </div>
          </Collapsible>

          <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
            <Button
              variant="danger"
              onClick={() => setDeleteConfirm(true)}
              disabled={isUpdating || isDeleting}
            >
              {isDeleting ? "Deleting…" : "Delete goal"}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Modal
        isOpen={deleteConfirm}
        onClose={() => setDeleteConfirm(false)}
        title="Delete goal?"
      >
        <p className="text-gray-600 dark:text-gray-400">
          This cannot be undone.
        </p>
        <div className="mt-4 flex justify-end gap-2">
          <Button
            variant="secondary"
            onClick={() => setDeleteConfirm(false)}
            disabled={isDeleting}
          >
            Cancel
          </Button>
          <Button
            variant="danger"
            onClick={handleDelete}
            disabled={isDeleting}
          >
            {isDeleting ? "Deleting…" : "Delete"}
          </Button>
        </div>
      </Modal>
    </>
  );
}
