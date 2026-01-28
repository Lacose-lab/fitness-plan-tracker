export type Exercise = {
  name: string;
  sets?: string;
  notes?: string;
  equipment?: string[];
};

export type PlanDay = {
  id: string;
  title: string;
  focus: string;
  exercises: Exercise[];
};

export type PlanCycle = {
  startDate: string; // yyyy-mm-dd
  cadenceDays: number;
  days: PlanDay[];
};

const ex = (name: string, reps: string, rest?: string, notes?: string, equipment?: string[]): Exercise => ({
  name,
  sets: reps,
  notes: [rest ? `Rest ${rest}` : undefined, notes].filter(Boolean).join(" · ") || undefined,
  equipment,
});

const day1Exercises: Exercise[] = [
  ex("Incline dumbbell press", "3×8–12", "1 min", undefined, ["dumbbells"]),
  ex("Flat dumbbell press", "3×8–12", "1 min", undefined, ["dumbbells"]),
  ex("Butterfly machine", "2×12–15", "1 min", undefined, ["butterfly"]),
  ex("Dumbbell shoulder press", "3×8–12", "1 min", undefined, ["dumbbells"]),
  ex("Dumbbell lateral raises", "3×12–15", "1 min", undefined, ["dumbbells"]),
  ex("Triceps rope pressdown", "2×10–15", "1 min", undefined, ["cables"]),
  ex("Plank", "3×30–60s", "1 min", undefined, ["bodyweight"]),
  ex("Crunches", "3×12–15", "1 min", undefined, ["bodyweight"]),
];

const day2Exercises: Exercise[] = [
  ex("Leg press", "3×10–12", "1 min 30 sec", undefined, ["leg press"]),
  ex("Goblet squat", "3×10–12", "1 min 30 sec", undefined, ["dumbbells"]),
  ex("Romanian deadlift (DB)", "3×8–10", "1 min 30 sec", undefined, ["dumbbells"]),
  ex("Lunges", "2×10/side", "1 min 30 sec", undefined, ["dumbbells", "bodyweight"]),
  ex("Calf raises (DB)", "3×12–15", "1 min", undefined, ["dumbbells"]),
  ex("Hanging leg raises", "3×10–12", "1 min", undefined, ["bodyweight"]),
  ex("Incline treadmill walk", "25–35 min", undefined, "Zone 2", ["treadmill"]),
];

const day3Exercises: Exercise[] = [
  ex("Overhead pulldown (long bar)", "3×8–12", "1 min", undefined, ["pulldown", "cables"]),
  ex("Cable row (short bar/diamond handle)", "3×8–12", "1 min", undefined, ["cables"]),
  ex("Dumbbell row", "2×10–12", "1 min", undefined, ["dumbbells"]),
  ex("Face pulls (rope)", "2×12–15", "1 min", undefined, ["cables"]),
  ex("DB curls", "3×10–15", "1 min", undefined, ["dumbbells"]),
  ex("Hammer curls", "2×10–12", "1 min", undefined, ["dumbbells"]),
];

const day4Exercises: Exercise[] = [
  ex("Zone 2 cardio", "30–40 min", undefined, "Treadmill / cross‑walker / pool", ["treadmill", "elliptical", "pool"]),
  ex("Crunches", "3×12–15", "1 min", undefined, ["bodyweight"]),
  ex("Lying leg raises", "3×10–12", "1 min", undefined, ["bodyweight"]),
  ex("Side plank", "3×30s/side", "1 min", undefined, ["bodyweight"]),
];

const day5Exercises: Exercise[] = [
  ex("Incline dumbbell press", "3×8–12", "1 min", undefined, ["dumbbells"]),
  ex("Flat dumbbell press", "3×8–12", "1 min", undefined, ["dumbbells"]),
  ex("Butterfly machine", "2×12–15", "1 min", undefined, ["butterfly"]),
  ex("Dumbbell lateral raises", "3×12–15", "1 min", undefined, ["dumbbells"]),
  ex("Rear‑delt fly (DB)", "2×12–15", "1 min", undefined, ["dumbbells"]),
  ex("DB curls", "3×10–12", "1 min", undefined, ["dumbbells"]),
  ex("Cable curls (short bar)", "2×12–15", "1 min", undefined, ["cables"]),
];

export function generatePlanCycle(_customExercises: string[], startDate: string, cadenceDays: number): PlanCycle {
  const days: PlanDay[] = [
    {
      id: "d1",
      title: "Day 1 — Upper (Chest/Shoulders/Triceps)",
      focus: "Upper push + abs",
      exercises: day1Exercises,
    },
    {
      id: "d2",
      title: "Day 2 — Lower + Abs + Cardio",
      focus: "Legs + core",
      exercises: day2Exercises,
    },
    {
      id: "d3",
      title: "Day 3 — Upper (Back/Biceps/Shoulders)",
      focus: "Upper pull",
      exercises: day3Exercises,
    },
    {
      id: "d4",
      title: "Day 4 — Cardio + Abs",
      focus: "Fat loss",
      exercises: day4Exercises,
    },
    {
      id: "d5",
      title: "Day 5 — Upper (Chest/Shoulders/Biceps)",
      focus: "Upper focus",
      exercises: day5Exercises,
    },
    {
      id: "d6",
      title: "Day 6 — Off",
      focus: "Rest",
      exercises: [{ name: "Steps + light stretching", sets: "optional", equipment: ["bodyweight"] }],
    },
    {
      id: "d7",
      title: "Day 7 — Off",
      focus: "Rest",
      exercises: [{ name: "Steps + light stretching", sets: "optional", equipment: ["bodyweight"] }],
    },
  ];

  return { startDate, cadenceDays, days };
}

export function planDayForDate(date: string, cycle: PlanCycle): PlanDay {
  const dayIndex = Math.max(0, Math.min(6, (new Date(date).getDay() + 6) % 7)); // Mon=0..Sun=6
  return cycle.days[dayIndex] ?? cycle.days[0];
}
