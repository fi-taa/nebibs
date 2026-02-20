import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { learningApi } from "@/lib/api";
import type { LearningGoal } from "../types";

function now(): string {
  return new Date().toISOString();
}

function generateId(): string {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

const TEMP_ID_PREFIX = "temp-";

interface LearningState {
  goals: LearningGoal[];
  loading: boolean;
  error: string | null;
  creatingGoal: boolean;
  updatingGoalId: string | null;
  deletingGoalId: string | null;
  optimisticDeletedGoal: LearningGoal | null;
}

const initialState: LearningState = {
  goals: [],
  loading: false,
  error: null,
  creatingGoal: false,
  updatingGoalId: null,
  deletingGoalId: null,
  optimisticDeletedGoal: null,
};

export const fetchGoals = createAsyncThunk(
  "learning/fetchGoals",
  () => learningApi.list()
);

export const createGoal = createAsyncThunk(
  "learning/createGoal",
  (payload: { title: string; targetHours?: number; notes?: string }) =>
    learningApi.create({
      title: payload.title,
      target_hours: payload.targetHours,
      notes: payload.notes,
    })
);

export const updateGoalThunk = createAsyncThunk(
  "learning/updateGoal",
  (payload: {
    id: string;
    title?: string;
    targetHours?: number;
    progressPercent?: number;
    notes?: string;
    resources?: string[];
    weeklyHours?: { weekKey: string; hours: number }[];
  }) => {
    const body: Record<string, unknown> = {};
    if (payload.title !== undefined) body.title = payload.title;
    if (payload.targetHours !== undefined) body.target_hours = payload.targetHours;
    if (payload.progressPercent !== undefined)
      body.progress_percent = payload.progressPercent;
    if (payload.notes !== undefined) body.notes = payload.notes;
    if (payload.resources !== undefined) body.resources = payload.resources;
    if (payload.weeklyHours !== undefined)
      body.weekly_hours = payload.weeklyHours.map((w) => ({
        week_key: w.weekKey,
        hours: w.hours,
      }));
    return learningApi.update(payload.id, body);
  }
);

export const deleteGoalThunk = createAsyncThunk(
  "learning/deleteGoal",
  (id: string) => learningApi.delete(id)
);

export const learningSlice = createSlice({
  name: "learning",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    addGoalOptimistic: (
      state,
      action: {
        payload: { title: string; targetHours?: number; notes?: string };
      }
    ) => {
      const temp: LearningGoal = {
        id: TEMP_ID_PREFIX + Date.now(),
        title: action.payload.title,
        targetHours: action.payload.targetHours,
        progressPercent: 0,
        notes: action.payload.notes ?? "",
        resources: [],
        weeklyHours: [],
        createdAt: now(),
        updatedAt: now(),
      };
      state.goals.unshift(temp);
    },
    revertOptimisticCreate: (state) => {
      state.goals = state.goals.filter((g) => !g.id.startsWith(TEMP_ID_PREFIX));
    },
    deleteGoalOptimistic: (state, action: { payload: string }) => {
      const idx = state.goals.findIndex((g) => g.id === action.payload);
      if (idx !== -1) {
        state.optimisticDeletedGoal = state.goals[idx];
        state.goals.splice(idx, 1);
      }
    },
    revertOptimisticDelete: (state) => {
      if (state.optimisticDeletedGoal) {
        state.goals.push(state.optimisticDeletedGoal);
        state.optimisticDeletedGoal = null;
      }
    },
    addGoal: (
      state,
      action: {
        payload: {
          title: string;
          targetHours?: number;
          notes?: string;
        };
      }
    ) => {
      const goal: LearningGoal = {
        id: generateId(),
        title: action.payload.title,
        targetHours: action.payload.targetHours,
        progressPercent: 0,
        notes: action.payload.notes ?? "",
        resources: [],
        weeklyHours: [],
        createdAt: now(),
        updatedAt: now(),
      };
      state.goals.push(goal);
    },
    updateGoal: (
      state,
      action: {
        payload: {
          id: string;
          title?: string;
          targetHours?: number;
          progressPercent?: number;
          notes?: string;
        };
      }
    ) => {
      const g = state.goals.find((x) => x.id === action.payload.id);
      if (!g) return;
      if (action.payload.title !== undefined) g.title = action.payload.title;
      if (action.payload.targetHours !== undefined)
        g.targetHours = action.payload.targetHours;
      if (action.payload.progressPercent !== undefined)
        g.progressPercent = action.payload.progressPercent;
      if (action.payload.notes !== undefined) g.notes = action.payload.notes;
      g.updatedAt = now();
    },
    deleteGoal: (state, action: { payload: string }) => {
      state.goals = state.goals.filter((g) => g.id !== action.payload);
    },
    addResource: (
      state,
      action: { payload: { goalId: string; resource: string } }
    ) => {
      const g = state.goals.find((x) => x.id === action.payload.goalId);
      if (g) {
        g.resources.push(action.payload.resource);
        g.updatedAt = now();
      }
    },
    removeResource: (
      state,
      action: { payload: { goalId: string; index: number } }
    ) => {
      const g = state.goals.find((x) => x.id === action.payload.goalId);
      if (g && action.payload.index >= 0 && action.payload.index < g.resources.length) {
        g.resources.splice(action.payload.index, 1);
        g.updatedAt = now();
      }
    },
    logWeeklyHours: (
      state,
      action: { payload: { goalId: string; weekKey: string; hours: number } }
    ) => {
      const g = state.goals.find((x) => x.id === action.payload.goalId);
      if (!g) return;
      const existing = g.weeklyHours.find(
        (w) => w.weekKey === action.payload.weekKey
      );
      if (existing) existing.hours = action.payload.hours;
      else g.weeklyHours.push({ weekKey: action.payload.weekKey, hours: action.payload.hours });
      g.updatedAt = now();
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchGoals.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchGoals.fulfilled, (state, action) => {
        state.loading = false;
        state.goals = action.payload;
        state.error = null;
      })
      .addCase(fetchGoals.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message ?? "Failed to fetch goals";
      })
      .addCase(createGoal.pending, (state) => {
        state.creatingGoal = true;
      })
      .addCase(createGoal.fulfilled, (state, action) => {
        state.creatingGoal = false;
        const tempIdx = state.goals.findIndex((g) =>
          g.id.startsWith(TEMP_ID_PREFIX)
        );
        if (tempIdx !== -1) {
          state.goals[tempIdx] = action.payload;
        } else {
          state.goals.unshift(action.payload);
        }
      })
      .addCase(createGoal.rejected, (state, action) => {
        state.creatingGoal = false;
        state.error = action.error.message ?? "Failed to create goal";
        state.goals = state.goals.filter((g) => !g.id.startsWith(TEMP_ID_PREFIX));
      })
      .addCase(updateGoalThunk.pending, (state, action) => {
        state.updatingGoalId = action.meta.arg.id;
      })
      .addCase(updateGoalThunk.fulfilled, (state, action) => {
        state.updatingGoalId = null;
        const i = state.goals.findIndex((g) => g.id === action.payload.id);
        if (i !== -1) state.goals[i] = action.payload;
      })
      .addCase(updateGoalThunk.rejected, (state, action) => {
        state.updatingGoalId = null;
        state.error = action.error.message ?? "Failed to update goal";
      })
      .addCase(deleteGoalThunk.pending, (state, action) => {
        state.deletingGoalId = action.meta.arg;
      })
      .addCase(deleteGoalThunk.fulfilled, (state, action) => {
        state.deletingGoalId = null;
        state.optimisticDeletedGoal = null;
        state.goals = state.goals.filter((g) => g.id !== action.meta.arg);
      })
      .addCase(deleteGoalThunk.rejected, (state, action) => {
        state.deletingGoalId = null;
        state.error = action.error.message ?? "Failed to delete goal";
        if (state.optimisticDeletedGoal) {
          state.goals.push(state.optimisticDeletedGoal);
          state.optimisticDeletedGoal = null;
        }
      });
  },
});

export const {
  addGoal,
  addGoalOptimistic,
  revertOptimisticCreate,
  deleteGoalOptimistic,
  revertOptimisticDelete,
  updateGoal,
  deleteGoal,
  addResource,
  removeResource,
  logWeeklyHours,
  clearError,
} = learningSlice.actions;
