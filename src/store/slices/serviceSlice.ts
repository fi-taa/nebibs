import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { serviceApi } from "@/lib/api";
import type { ServiceEntry } from "../types";

function now(): string {
  return new Date().toISOString();
}

interface ServiceState {
  entries: ServiceEntry[];
  loading: boolean;
  error: string | null;
}

const initialState: ServiceState = {
  entries: [],
  loading: false,
  error: null,
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
      .addCase(createServiceEntryThunk.fulfilled, (state, action) => {
        state.entries.unshift(action.payload);
      })
      .addCase(createServiceEntryThunk.rejected, (state, action) => {
        state.error = action.error.message ?? "Failed to create entry";
      })
      .addCase(updateServiceEntryThunk.fulfilled, (state, action) => {
        const i = state.entries.findIndex((x) => x.id === action.payload.id);
        if (i !== -1) state.entries[i] = action.payload;
      })
      .addCase(updateServiceEntryThunk.rejected, (state, action) => {
        state.error = action.error.message ?? "Failed to update entry";
      })
      .addCase(deleteServiceEntryThunk.fulfilled, (state, action) => {
        state.entries = state.entries.filter((x) => x.id !== action.meta.arg);
      })
      .addCase(deleteServiceEntryThunk.rejected, (state, action) => {
        state.error = action.error.message ?? "Failed to delete entry";
      });
  },
});

export const {
  addEntry,
  updateEntry,
  deleteEntry,
  clearError,
} = serviceSlice.actions;
