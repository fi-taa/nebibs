import { createSlice } from "@reduxjs/toolkit";
import type { LearningGoal } from "../types";

function generateId(): string {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

function now(): string {
  return new Date().toISOString();
}

interface LearningState {
  goals: LearningGoal[];
}

const initialState: LearningState = {
  goals: [],
};

export const learningSlice = createSlice({
  name: "learning",
  initialState,
  reducers: {
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
});

export const {
  addGoal,
  updateGoal,
  deleteGoal,
  addResource,
  removeResource,
  logWeeklyHours,
} = learningSlice.actions;
