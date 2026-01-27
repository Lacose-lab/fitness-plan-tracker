import { differenceInCalendarDays, parseISO } from "date-fns";
import { listLogs, type DayLog } from "./storage";

export function weeklyLossRateKgPerWeek(logs: DayLog[]): number | null {
  const w = logs.filter((l) => typeof l.weightKg === "number");
  if (w.length < 2) return null;
  const first = w[0];
  const last = w[w.length - 1];
  const days = differenceInCalendarDays(parseISO(last.date), parseISO(first.date));
  if (days < 7) return null;
  const delta = (last.weightKg as number) - (first.weightKg as number);
  return -(delta / (days / 7));
}

export function completionStreak(logs: DayLog[]): number {
  const byDate = new Map(logs.map((l) => [l.date, l]));
  // Walk backwards from today.
  const today = new Date();
  let streak = 0;
  for (let i = 0; i < 365; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    const log = byDate.get(key);
    if (log?.workoutDone) streak++;
    else break;
  }
  return streak;
}

export function getSummary() {
  const logs = listLogs();
  const last7 = logs.slice(-7);
  const weights = logs.filter((l) => typeof l.weightKg === "number");
  const latestWeight = weights.length ? (weights[weights.length - 1].weightKg as number) : null;

  const avgSteps7 = last7.length
    ? Math.round(
        last7.reduce((acc, l) => acc + (typeof l.steps === "number" ? l.steps : 0), 0) /
          Math.max(1, last7.filter((l) => typeof l.steps === "number").length || 1)
      )
    : null;

  const workouts7 = last7.reduce((acc, l) => acc + (l.workoutDone ? 1 : 0), 0);

  return {
    logs,
    latestWeight,
    avgSteps7,
    workouts7,
    lossRate: weeklyLossRateKgPerWeek(logs),
    streak: completionStreak(logs),
  };
}
