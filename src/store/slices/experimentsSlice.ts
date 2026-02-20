import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { experimentsApi } from "@/lib/api";
import type { Experiment, ExperimentStatus } from "../types";

function now(): string {
  return new Date().toISOString();
}

const TEMP_ID_PREFIX = "temp-";

interface ExperimentsState {
  items: Experiment[];
  loading: boolean;
  error: string | null;
  creatingExperiment: boolean;
  updatingExperimentId: string | null;
  deletingExperimentId: string | null;
  optimisticDeletedExperiment: Experiment | null;
}

const initialState: ExperimentsState = {
  items: [],
  loading: false,
  error: null,
  creatingExperiment: false,
  updatingExperimentId: null,
  deletingExperimentId: null,
  optimisticDeletedExperiment: null,
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
    addExperimentOptimistic: (
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
      const p = action.payload;
      const temp: Experiment = {
        id: TEMP_ID_PREFIX + Date.now(),
        title: p.title,
        description: p.description ?? "",
        dependencies: p.dependencies ?? [],
        nextAction: p.nextAction ?? "",
        status: p.status ?? "not_started",
        notes: p.notes ?? "",
        createdAt: now(),
        updatedAt: now(),
      };
      state.items.unshift(temp);
    },
    deleteExperimentOptimistic: (state, action: { payload: string }) => {
      const idx = state.items.findIndex((x) => x.id === action.payload);
      if (idx !== -1) {
        state.optimisticDeletedExperiment = state.items[idx];
        state.items.splice(idx, 1);
      }
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
      .addCase(createExperimentThunk.pending, (state) => {
        state.creatingExperiment = true;
      })
      .addCase(createExperimentThunk.fulfilled, (state, action) => {
        state.creatingExperiment = false;
        const tempIdx = state.items.findIndex((x) =>
          x.id.startsWith(TEMP_ID_PREFIX)
        );
        if (tempIdx !== -1) {
          state.items[tempIdx] = action.payload;
        } else {
          state.items.unshift(action.payload);
        }
      })
      .addCase(createExperimentThunk.rejected, (state, action) => {
        state.creatingExperiment = false;
        state.error = action.error.message ?? "Failed to create experiment";
        state.items = state.items.filter(
          (x) => !x.id.startsWith(TEMP_ID_PREFIX)
        );
      })
      .addCase(updateExperimentThunk.pending, (state, action) => {
        state.updatingExperimentId = action.meta.arg.id;
      })
      .addCase(updateExperimentThunk.fulfilled, (state, action) => {
        state.updatingExperimentId = null;
        const i = state.items.findIndex((x) => x.id === action.payload.id);
        if (i !== -1) state.items[i] = action.payload;
      })
      .addCase(updateExperimentThunk.rejected, (state, action) => {
        state.updatingExperimentId = null;
        state.error = action.error.message ?? "Failed to update experiment";
      })
      .addCase(deleteExperimentThunk.pending, (state, action) => {
        state.deletingExperimentId = action.meta.arg;
      })
      .addCase(deleteExperimentThunk.fulfilled, (state, action) => {
        state.deletingExperimentId = null;
        state.optimisticDeletedExperiment = null;
        state.items = state.items.filter((x) => x.id !== action.meta.arg);
      })
      .addCase(deleteExperimentThunk.rejected, (state, action) => {
        state.deletingExperimentId = null;
        state.error = action.error.message ?? "Failed to delete experiment";
        if (state.optimisticDeletedExperiment) {
          state.items.push(state.optimisticDeletedExperiment);
          state.optimisticDeletedExperiment = null;
        }
      });
  },
});

export const {
  addExperiment,
  addExperimentOptimistic,
  deleteExperimentOptimistic,
  updateExperiment,
  deleteExperiment,
  setStatus,
  clearError,
} = experimentsSlice.actions;
