import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { learningApi } from "@/lib/api";
import type { LearningGoal } from "../types";

function now(): string {
  return new Date().toISOString();
}

interface LearningState {
  goals: LearningGoal[];
  loading: boolean;
  error: string | null;
}

const initialState: LearningState = {
  goals: [],
  loading: false,
  error: null,
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
      .addCase(createGoal.fulfilled, (state, action) => {
        state.goals.unshift(action.payload);
      })
      .addCase(createGoal.rejected, (state, action) => {
        state.error = action.error.message ?? "Failed to create goal";
      })
      .addCase(updateGoalThunk.fulfilled, (state, action) => {
        const i = state.goals.findIndex((g) => g.id === action.payload.id);
        if (i !== -1) state.goals[i] = action.payload;
      })
      .addCase(updateGoalThunk.rejected, (state, action) => {
        state.error = action.error.message ?? "Failed to update goal";
      })
      .addCase(deleteGoalThunk.fulfilled, (state, action) => {
        state.goals = state.goals.filter((g) => g.id !== action.meta.arg);
      })
      .addCase(deleteGoalThunk.rejected, (state, action) => {
        state.error = action.error.message ?? "Failed to delete goal";
      });
  },
});

export const {
  addGoal,
  updateGoal,
  deleteGoal,
  addResource,
  removeResource,
  logWeeklyHours,
  clearError,
} = learningSlice.actions;
