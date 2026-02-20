import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { experimentsApi } from "@/lib/api";
import type { Experiment, ExperimentStatus } from "../types";

function now(): string {
  return new Date().toISOString();
}

interface ExperimentsState {
  items: Experiment[];
  loading: boolean;
  error: string | null;
}

const initialState: ExperimentsState = {
  items: [],
  loading: false,
  error: null,
};

export const fetchExperiments = createAsyncThunk(
  "experiments/fetch",
  () => experimentsApi.list()
);

export const createExperimentThunk = createAsyncThunk(
  "experiments/create",
  (payload: {
    title: string;
    description?: string;
    dependencies?: string[];
    nextAction?: string;
    status?: ExperimentStatus;
    notes?: string;
  }) =>
    experimentsApi.create({
      title: payload.title,
      description: payload.description ?? "",
      dependencies: payload.dependencies ?? [],
      next_action: payload.nextAction ?? "",
      status: payload.status ?? "not_started",
      notes: payload.notes ?? "",
    })
);

export const updateExperimentThunk = createAsyncThunk(
  "experiments/update",
  (payload: {
    id: string;
    title?: string;
    description?: string;
    dependencies?: string[];
    nextAction?: string;
    status?: ExperimentStatus;
    notes?: string;
  }) => {
    const body: Record<string, unknown> = {};
    if (payload.title !== undefined) body.title = payload.title;
    if (payload.description !== undefined) body.description = payload.description;
    if (payload.dependencies !== undefined) body.dependencies = payload.dependencies;
    if (payload.nextAction !== undefined) body.next_action = payload.nextAction;
    if (payload.status !== undefined) body.status = payload.status;
    if (payload.notes !== undefined) body.notes = payload.notes;
    return experimentsApi.update(payload.id, body);
  }
);

export const deleteExperimentThunk = createAsyncThunk(
  "experiments/delete",
  (id: string) => experimentsApi.delete(id)
);

export const experimentsSlice = createSlice({
  name: "experiments",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
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
        id: "",
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
  extraReducers: (builder) => {
    builder
      .addCase(fetchExperiments.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchExperiments.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
        state.error = null;
      })
      .addCase(fetchExperiments.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message ?? "Failed to fetch experiments";
      })
      .addCase(createExperimentThunk.fulfilled, (state, action) => {
        state.items.unshift(action.payload);
      })
      .addCase(createExperimentThunk.rejected, (state, action) => {
        state.error = action.error.message ?? "Failed to create experiment";
      })
      .addCase(updateExperimentThunk.fulfilled, (state, action) => {
        const i = state.items.findIndex((x) => x.id === action.payload.id);
        if (i !== -1) state.items[i] = action.payload;
      })
      .addCase(updateExperimentThunk.rejected, (state, action) => {
        state.error = action.error.message ?? "Failed to update experiment";
      })
      .addCase(deleteExperimentThunk.fulfilled, (state, action) => {
        state.items = state.items.filter((x) => x.id !== action.meta.arg);
      })
      .addCase(deleteExperimentThunk.rejected, (state, action) => {
        state.error = action.error.message ?? "Failed to delete experiment";
      });
  },
});

export const {
  addExperiment,
  updateExperiment,
  deleteExperiment,
  setStatus,
  clearError,
} = experimentsSlice.actions;
