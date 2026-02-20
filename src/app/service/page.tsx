"use client";

import { useState, useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  fetchServiceEntries,
  createServiceEntryThunk,
  addEntryOptimistic,
  updateServiceEntryThunk,
  deleteServiceEntryThunk,
  deleteEntryOptimistic,
} from "@/store/slices/serviceSlice";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Modal } from "@/components/ui/Modal";

export default function ServicePage() {
  const dispatch = useAppDispatch();
  const entries = useAppSelector((s) =>
    [...s.service.entries].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    )
  );
  const totalHours = useAppSelector((s) =>
    s.service.entries.reduce((sum, e) => sum + e.hours, 0)
  );
  const creatingEntry = useAppSelector((s) => s.service.creatingEntry);
  const updatingEntryId = useAppSelector((s) => s.service.updatingEntryId);
  const deletingEntryId = useAppSelector((s) => s.service.deletingEntryId);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [date, setDate] = useState(
    () => new Date().toISOString().slice(0, 10)
  );
  const [description, setDescription] = useState("");
  const [hours, setHours] = useState("");
  const [reflection, setReflection] = useState("");

  function openAdd() {
    setEditingId(null);
    setDate(new Date().toISOString().slice(0, 10));
    setDescription("");
    setHours("");
    setReflection("");
    setModalOpen(true);
  }

  function openEdit(entry: {
    id: string;
    date: string;
    description: string;
    hours: number;
    reflection: string;
  }) {
    setEditingId(entry.id);
    setDate(entry.date.slice(0, 10));
    setDescription(entry.description);
    setHours(String(entry.hours));
    setReflection(entry.reflection);
    setModalOpen(true);
  }

  useEffect(() => {
    void dispatch(fetchServiceEntries());
  }, [dispatch]);

  function handleSubmit() {
    const h = Number(hours);
    if (!description.trim() || Number.isNaN(h) || h < 0) return;
    const payload = {
      date,
      description: description.trim(),
      hours: h,
      reflection: reflection.trim(),
    };
    if (editingId) {
      void dispatch(
        updateServiceEntryThunk({
          id: editingId,
          ...payload,
        })
      );
    } else {
      dispatch(addEntryOptimistic(payload));
      void dispatch(createServiceEntryThunk(payload));
    }
    setModalOpen(false);
  }

  return (
    <div className="min-h-[calc(100vh-3.5rem)]">
      <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Service
          </h1>
          <Button onClick={openAdd} disabled={creatingEntry}>
            {creatingEntry ? "Adding…" : "Add entry"}
          </Button>
        </div>
        <Card className="mt-6">
          <CardContent className="p-4">
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
              Total hours
            </p>
            <p className="mt-1 text-2xl font-bold text-gray-900 dark:text-white">
              {totalHours.toFixed(1)}h
            </p>
          </CardContent>
        </Card>
        <ul className="mt-6 space-y-4 stagger-children">
          {entries.length === 0 && (
            <li className="rounded-lg border border-dashed border-gray-300 bg-card-bg py-12 text-center text-sm text-gray-500 dark:border-gray-600 dark:text-gray-400">
              No entries yet.
            </li>
          )}
          {entries.map((entry) => (
            <li key={entry.id}>
              <Card className="transition-all duration-150 hover:-translate-y-0.5 hover:shadow-lg">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="font-semibold text-gray-900 dark:text-white">
                        {entry.description}
                      </p>
                      <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                        {entry.date} · {entry.hours}h
                      </p>
                      {entry.reflection && (
                        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                          {entry.reflection}
                        </p>
                      )}
                    </div>
                    <div className="flex gap-2 shrink-0">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openEdit(entry)}
                        disabled={
                          updatingEntryId === entry.id ||
                          deletingEntryId === entry.id
                        }
                      >
                        Edit
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          dispatch(deleteEntryOptimistic(entry.id));
                          void dispatch(deleteServiceEntryThunk(entry.id));
                        }}
                        disabled={
                          updatingEntryId === entry.id ||
                          deletingEntryId === entry.id
                        }
                      >
                        {deletingEntryId === entry.id ? "Deleting…" : "Delete"}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </li>
          ))}
        </ul>
        <Modal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          title={editingId ? "Edit entry" : "Add entry"}
        >
          <div className="space-y-4">
            <Input
              label="Date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
            <Input
              label="Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. Orthodox student union meeting"
            />
            <Input
              label="Hours"
              type="number"
              min={0}
              step={0.5}
              value={hours}
              onChange={(e) => setHours(e.target.value)}
              placeholder="e.g. 2"
            />
            <Textarea
              label="Reflection (optional)"
              value={reflection}
              onChange={(e) => setReflection(e.target.value)}
              placeholder="Reflection"
              rows={3}
            />
            <div className="flex justify-end gap-2">
              <Button
                variant="secondary"
                onClick={() => setModalOpen(false)}
                disabled={
                  creatingEntry ||
                  (editingId != null && updatingEntryId === editingId)
                }
              >
                Cancel
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={
                  creatingEntry ||
                  (editingId != null && updatingEntryId === editingId)
                }
              >
                {creatingEntry ||
                (editingId != null && updatingEntryId === editingId)
                  ? editingId
                    ? "Saving…"
                    : "Adding…"
                  : editingId
                    ? "Save"
                    : "Add"}
              </Button>
            </div>
          </div>
        </Modal>
      </main>
    </div>
  );
}
