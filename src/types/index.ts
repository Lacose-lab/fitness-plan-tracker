export interface DayLog {
  date: string;
  weightKg?: number;
  steps?: number;
  calories?: number;
  proteinG?: number;
  planDayId?: string;
  completedExerciseIdx?: number[];
  workoutDone?: boolean;
  note?: string;
}

export interface Exercise {
  name: string;
  sets?: string;
  notes?: string;
}

export interface PlanDay {
  id: string;
  title: string;
  focus: string;
  exercises: Exercise[];
}

export interface PlanCycle {
  id: string;
  name: string;
  days: PlanDay[];
}

export interface Settings {
  stepGoal: number;
  calorieTarget: number;
  proteinTarget: number;
}

export interface Summary {
  latestWeight?: number;
  workouts7: number;
  avgSteps7?: number;
  streak: number;
}

export type Metric = 'weightKg' | 'steps' | 'calories' | 'proteinG';
export type Tab = 'today' | 'stats' | 'log' | 'plan' | 'progress' | 'settings';
export type Range = 'today' | 'week' | 'month';
