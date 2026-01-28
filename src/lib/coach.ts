import type { DayLog, Settings } from "./storage";
import type { PlanDay } from "./plan";
import type { getSummary } from "./stats";

type Summary = ReturnType<typeof getSummary>;

export function getCoachTips(
  logs: DayLog[],
  todayLog: DayLog | undefined,
  settings: Settings,
  plan: PlanDay,
  summary: Summary
): string[] {
  const tips: string[] = [];

  const protein = todayLog?.proteinG ?? 0;
  const steps = todayLog?.steps ?? 0;
  const calories = todayLog?.calories ?? 0;
  const workoutDone = Boolean(todayLog?.workoutDone);
  const completed = todayLog?.completedExerciseIdx?.length ?? 0;

  if (!workoutDone && plan.exercises.length > 0) {
    tips.push(`Finish today’s workout (${completed}/${plan.exercises.length} done).`);
  }

  if (protein < settings.proteinTarget * 0.7) {
    tips.push(`Protein is low — aim for ${settings.proteinTarget} g today.`);
  }

  if (steps < settings.stepGoal * 0.7) {
    tips.push(`Steps are low — push toward ${settings.stepGoal} today.`);
  }

  if (calories > 0 && calories > settings.calorieTarget * 1.1) {
    tips.push("Calories are running high — tighten portions for fat loss.");
  } else if (calories > 0 && calories < settings.calorieTarget * 0.7) {
    tips.push("Calories are very low — don’t under‑fuel workouts.");
  }

  if (summary.avgSteps7 !== null && summary.avgSteps7 < settings.stepGoal * 0.8) {
    tips.push("Last 7‑day steps average is low — add a 20–30 min walk.");
  }

  if (summary.workouts7 < 3) {
    tips.push("Only a few workouts in the last 7 days — aim for 3–4 this week.");
  }

  if (summary.lossRate === null) {
    tips.push("Log weight 2×/week so I can track fat‑loss pace.");
  } else if (summary.lossRate > 1) {
    tips.push("Weight loss is fast — consider a small calorie increase.");
  } else if (summary.lossRate < 0.1 && calories > 0) {
    tips.push("Fat loss is slow — consider trimming 100–200 kcal/day.");
  }

  if (summary.workouts7 >= 5) {
    tips.push("Nice volume — prioritize sleep and a light recovery walk.");
  }

  if (!logs.length) {
    tips.unshift("Start with a quick log (weight, steps, protein) to personalize tips.");
  }

  return tips.slice(0, 3);
}
