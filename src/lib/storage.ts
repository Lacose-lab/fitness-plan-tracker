import { differenceInCalendarDays, formatISO, parseISO } from "date-fns";
import type { PlanCycle } from "./plan";
import { generatePlanCycle, planDayForDate } from "./plan";

export type DayLog = {
  date: string; // yyyy-mm-dd
  weightKg?: number;
  steps?: number;
  calories?: number;
  proteinG?: number;
  workoutDone?: boolean;
  planDayId?: string;
  // Daily checklist for the selected plan day (by exercise index)
  completedExerciseIdx?: number[];
  note?: string;
};

export type Settings = {
  stepGoal: number;
  calorieTarget: number;
  proteinTarget: number;
  shuffleEveryDays: number;
};

export type AppState = {
  version: 2;
  logsByDate: Record<string, DayLog>;
  settings: Settings;
  planCycle?: PlanCycle;
  customExercises?: string[];
};

const STORAGE_KEY = "lacose.fitnessPlanTracker.v2";

export function todayKey(d = new Date()): string {
  // store as yyyy-mm-dd in local timezone
  const iso = formatISO(d, { representation: "date" });
  return iso;
}

const DEFAULT_SETTINGS: Settings = {
  stepGoal: 10000,
  calorieTarget: 2100,
  proteinTarget: 160,
  shuffleEveryDays: 21,
};

export function loadState(): AppState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { version: 2, logsByDate: {}, settings: DEFAULT_SETTINGS };

    const parsed = JSON.parse(raw) as Partial<AppState>;
    if (!parsed || parsed.version !== 2 || !parsed.logsByDate) {
      return { version: 2, logsByDate: {}, settings: DEFAULT_SETTINGS };
    }

    return {
      version: 2,
      logsByDate: parsed.logsByDate,
      settings: parsed.settings ?? DEFAULT_SETTINGS,
      planCycle: parsed.planCycle,
      customExercises: parsed.customExercises ?? [],
    };
  } catch {
    return { version: 2, logsByDate: {}, settings: DEFAULT_SETTINGS };
  }
}

export function saveState(state: AppState) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function getCustomExercises(): string[] {
  return loadState().customExercises ?? [];
}

export function updateCustomExercises(list: string[]) {
  const state = loadState();
  state.customExercises = list;
  saveState(state);
}

export function ensurePlanCycle(date: string): PlanCycle {
  const state = loadState();
  const cadenceDays = state.settings.shuffleEveryDays ?? 21;
  const last = state.planCycle;
  if (!last) {
    const cycle = generatePlanCycle(state.customExercises ?? [], date, cadenceDays);
    state.planCycle = cycle;
    saveState(state);
    return cycle;
  }

  const age = differenceInCalendarDays(parseISO(date), parseISO(last.startDate));
  if (age >= cadenceDays) {
    const cycle = generatePlanCycle(state.customExercises ?? [], date, cadenceDays);
    state.planCycle = cycle;
    saveState(state);
    return cycle;
  }

  return last;
}

export function getPlanForDate(date: string) {
  const cycle = ensurePlanCycle(date);
  return planDayForDate(date, cycle);
}

export function getPlanCycle(date: string) {
  return ensurePlanCycle(date);
}

export function upsertLog(date: string, patch: Partial<DayLog>) {
  const state = loadState();
  const existing = state.logsByDate[date] ?? { date };
  state.logsByDate[date] = { ...existing, ...patch, date };
  saveState(state);
}

export function getLog(date: string): DayLog | undefined {
  return loadState().logsByDate[date];
}

export function listLogs(): DayLog[] {
  const state = loadState();
  return Object.values(state.logsByDate)
    .map((l) => ({ ...l }))
    .sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : 0));
}

export function exportJson(): string {
  return JSON.stringify(loadState(), null, 2);
}

export function importJson(raw: string) {
  const parsed = JSON.parse(raw) as AppState;
  if (!parsed || parsed.version !== 2 || typeof parsed.logsByDate !== "object") {
    throw new Error("Invalid backup format");
  }
  for (const k of Object.keys(parsed.logsByDate)) {
    try {
      parseISO(k);
    } catch {
      throw new Error("Invalid date key in backup: " + k);
    }
  }
  saveState(parsed);
}
