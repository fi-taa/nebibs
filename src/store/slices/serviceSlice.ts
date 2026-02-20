import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { serviceApi } from "@/lib/api";
import type { ServiceEntry } from "../types";

function now(): string {
  return new Date().toISOString();
}

const TEMP_ID_PREFIX = "temp-";

interface ServiceState {
  entries: ServiceEntry[];
  loading: boolean;
  error: string | null;
  creatingEntry: boolean;
  updatingEntryId: string | null;
  deletingEntryId: string | null;
  optimisticDeletedEntry: ServiceEntry | null;
}

const initialState: ServiceState = {
  entries: [],
  loading: false,
  error: null,
  creatingEntry: false,
  updatingEntryId: null,
  deletingEntryId: null,
  optimisticDeletedEntry: null,
};

export const fetchServiceEntries = createAsyncThunk(
  "service/fetch",
  () => serviceApi.list()
);

export const createServiceEntryThunk = createAsyncThunk(
  "service/create",
  (payload: {
    date: string;
    description: string;
    hours: number;
    reflection?: string;
  }) =>
    serviceApi.create({
      date: payload.date,
      description: payload.description,
      hours: payload.hours,
      reflection: payload.reflection,
    })
);

export const updateServiceEntryThunk = createAsyncThunk(
  "service/update",
  (payload: {
    id: string;
    date?: string;
    description?: string;
    hours?: number;
    reflection?: string;
  }) => {
    const body: Record<string, unknown> = {};
    if (payload.date !== undefined) body.date = payload.date;
    if (payload.description !== undefined) body.description = payload.description;
    if (payload.hours !== undefined) body.hours = payload.hours;
    if (payload.reflection !== undefined) body.reflection = payload.reflection;
    return serviceApi.update(payload.id, body);
  }
);

export const deleteServiceEntryThunk = createAsyncThunk(
  "service/delete",
  (id: string) => serviceApi.delete(id)
);

export const serviceSlice = createSlice({
  name: "service",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    addEntryOptimistic: (
      state,
      action: {
        payload: {
          date: string;
          description: string;
          hours: number;
          reflection?: string;
        };
      }
    ) => {
      const p = action.payload;
      const temp: ServiceEntry = {
        id: TEMP_ID_PREFIX + Date.now(),
        date: p.date,
        description: p.description,
        hours: p.hours,
        reflection: p.reflection ?? "",
        createdAt: now(),
        updatedAt: now(),
      };
      state.entries.unshift(temp);
    },
    deleteEntryOptimistic: (state, action: { payload: string }) => {
      const idx = state.entries.findIndex((x) => x.id === action.payload);
      if (idx !== -1) {
        state.optimisticDeletedEntry = state.entries[idx];
        state.entries.splice(idx, 1);
      }
    },
    addEntry: (
      state,
      action: {
        payload: {
          date: string;
          description: string;
          hours: number;
          reflection?: string;
        };
      }
    ) => {
      const entry: ServiceEntry = {
        id: "",
        date: action.payload.date,
        description: action.payload.description,
        hours: action.payload.hours,
        reflection: action.payload.reflection ?? "",
        createdAt: now(),
        updatedAt: now(),
      };
      state.entries.push(entry);
    },
    updateEntry: (
      state,
      action: {
        payload: {
          id: string;
          date?: string;
          description?: string;
          hours?: number;
          reflection?: string;
        };
      }
    ) => {
      const e = state.entries.find((x) => x.id === action.payload.id);
      if (!e) return;
      if (action.payload.date !== undefined) e.date = action.payload.date;
      if (action.payload.description !== undefined)
        e.description = action.payload.description;
      if (action.payload.hours !== undefined) e.hours = action.payload.hours;
      if (action.payload.reflection !== undefined)
        e.reflection = action.payload.reflection;
      e.updatedAt = now();
    },
    deleteEntry: (state, action: { payload: string }) => {
      state.entries = state.entries.filter((x) => x.id !== action.payload);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchServiceEntries.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchServiceEntries.fulfilled, (state, action) => {
        state.loading = false;
        state.entries = action.payload;
        state.error = null;
      })
      .addCase(fetchServiceEntries.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message ?? "Failed to fetch entries";
      })
      .addCase(createServiceEntryThunk.pending, (state) => {
        state.creatingEntry = true;
      })
      .addCase(createServiceEntryThunk.fulfilled, (state, action) => {
        state.creatingEntry = false;
        const tempIdx = state.entries.findIndex((x) =>
          x.id.startsWith(TEMP_ID_PREFIX)
        );
        if (tempIdx !== -1) {
          state.entries[tempIdx] = action.payload;
        } else {
          state.entries.unshift(action.payload);
        }
      })
      .addCase(createServiceEntryThunk.rejected, (state, action) => {
        state.creatingEntry = false;
        state.error = action.error.message ?? "Failed to create entry";
        state.entries = state.entries.filter(
          (x) => !x.id.startsWith(TEMP_ID_PREFIX)
        );
      })
      .addCase(updateServiceEntryThunk.pending, (state, action) => {
        state.updatingEntryId = action.meta.arg.id;
      })
      .addCase(updateServiceEntryThunk.fulfilled, (state, action) => {
        state.updatingEntryId = null;
        const i = state.entries.findIndex((x) => x.id === action.payload.id);
        if (i !== -1) state.entries[i] = action.payload;
      })
      .addCase(updateServiceEntryThunk.rejected, (state, action) => {
        state.updatingEntryId = null;
        state.error = action.error.message ?? "Failed to update entry";
      })
      .addCase(deleteServiceEntryThunk.pending, (state, action) => {
        state.deletingEntryId = action.meta.arg;
      })
      .addCase(deleteServiceEntryThunk.fulfilled, (state, action) => {
        state.deletingEntryId = null;
        state.optimisticDeletedEntry = null;
        state.entries = state.entries.filter((x) => x.id !== action.meta.arg);
      })
      .addCase(deleteServiceEntryThunk.rejected, (state, action) => {
        state.deletingEntryId = null;
        state.error = action.error.message ?? "Failed to delete entry";
        if (state.optimisticDeletedEntry) {
          state.entries.push(state.optimisticDeletedEntry);
          state.optimisticDeletedEntry = null;
        }
      });
  },
});

export const {
  addEntry,
  addEntryOptimistic,
  deleteEntryOptimistic,
  updateEntry,
  deleteEntry,
  clearError,
} = serviceSlice.actions;
