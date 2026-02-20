export interface LearningGoal {
  id: string;
  title: string;
  targetHours?: number;
  progressPercent: number;
  notes: string;
  resources: string[];
  weeklyHours: { weekKey: string; hours: number }[];
  createdAt: string;
  updatedAt: string;
}

export type ExperimentStatus = "not_started" | "in_progress" | "completed";

export interface Experiment {
  id: string;
  title: string;
  description: string;
  dependencies: string[];
  nextAction: string;
  status: ExperimentStatus;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

export interface ServiceEntry {
  id: string;
  date: string;
  description: string;
  hours: number;
  reflection: string;
  createdAt: string;
  updatedAt: string;
}
