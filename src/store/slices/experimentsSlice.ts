import { createSlice } from "@reduxjs/toolkit";
import type { Experiment, ExperimentStatus } from "../types";

function generateId(): string {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

function now(): string {
  return new Date().toISOString();
}

interface ExperimentsState {
  items: Experiment[];
}

const initialState: ExperimentsState = {
  items: [],
};

export const experimentsSlice = createSlice({
  name: "experiments",
  initialState,
  reducers: {
    addExperiment: (
      state,
      action: {
        payload: {
          title: string;
          description?: string;
          dependencies?: string[];
          nextAction?: string;
          status?: ExperimentStatus;
          notes?: string;
        };
      }
    ) => {
      const item: Experiment = {
        id: generateId(),
        title: action.payload.title,
        description: action.payload.description ?? "",
        dependencies: action.payload.dependencies ?? [],
        nextAction: action.payload.nextAction ?? "",
        status: action.payload.status ?? "not_started",
        notes: action.payload.notes ?? "",
        createdAt: now(),
        updatedAt: now(),
      };
      state.items.push(item);
    },
    updateExperiment: (
      state,
      action: {
        payload: {
          id: string;
          title?: string;
          description?: string;
          dependencies?: string[];
          nextAction?: string;
          status?: ExperimentStatus;
          notes?: string;
        };
      }
    ) => {
      const e = state.items.find((x) => x.id === action.payload.id);
      if (!e) return;
      if (action.payload.title !== undefined) e.title = action.payload.title;
      if (action.payload.description !== undefined)
        e.description = action.payload.description;
      if (action.payload.dependencies !== undefined)
        e.dependencies = action.payload.dependencies;
      if (action.payload.nextAction !== undefined)
        e.nextAction = action.payload.nextAction;
      if (action.payload.status !== undefined) e.status = action.payload.status;
      if (action.payload.notes !== undefined) e.notes = action.payload.notes;
      e.updatedAt = now();
    },
    deleteExperiment: (state, action: { payload: string }) => {
      state.items = state.items.filter((x) => x.id !== action.payload);
    },
    setStatus: (
      state,
      action: { payload: { id: string; status: ExperimentStatus } }
    ) => {
      const e = state.items.find((x) => x.id === action.payload.id);
      if (e) {
        e.status = action.payload.status;
        e.updatedAt = now();
      }
    },
  },
});

export const {
  addExperiment,
  updateExperiment,
  deleteExperiment,
  setStatus,
} = experimentsSlice.actions;
