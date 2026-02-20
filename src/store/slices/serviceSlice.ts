import { createSlice } from "@reduxjs/toolkit";
import type { ServiceEntry } from "../types";

function generateId(): string {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

function now(): string {
  return new Date().toISOString();
}

interface ServiceState {
  entries: ServiceEntry[];
}

const initialState: ServiceState = {
  entries: [],
};

export const serviceSlice = createSlice({
  name: "service",
  initialState,
  reducers: {
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
        id: generateId(),
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
});

export const { addEntry, updateEntry, deleteEntry } = serviceSlice.actions;
