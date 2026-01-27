import { formatISO, parseISO } from "date-fns";

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

export type AppState = {
  version: 1;
  logsByDate: Record<string, DayLog>;
};

const STORAGE_KEY = "lacose.fitnessPlanTracker.v1";

export function todayKey(d = new Date()): string {
  // store as yyyy-mm-dd in local timezone
  const iso = formatISO(d, { representation: "date" });
  return iso;
}

export function loadState(): AppState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { version: 1, logsByDate: {} };
    const parsed = JSON.parse(raw) as AppState;
    if (!parsed || parsed.version !== 1 || !parsed.logsByDate) return { version: 1, logsByDate: {} };
    return parsed;
  } catch {
    return { version: 1, logsByDate: {} };
  }
}

export function saveState(state: AppState) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
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
  if (!parsed || parsed.version !== 1 || typeof parsed.logsByDate !== "object") {
    throw new Error("Invalid backup format");
  }
  // light validation on date keys
  for (const k of Object.keys(parsed.logsByDate)) {
    try {
      parseISO(k);
    } catch {
      throw new Error("Invalid date key in backup: " + k);
    }
  }
  saveState(parsed);
}
