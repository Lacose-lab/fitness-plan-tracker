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
  ex("Goblet squat", "3×8–12", "1 min 30 sec", undefined, ["dumbbells"]),
  ex("Incline dumbbell press", "3×8–12", "1 min", undefined, ["dumbbells"]),
  ex("Overhead pulldown (long bar)", "3×8–12", "1 min", undefined, ["pulldown", "cables"]),
  ex("Dumbbell shoulder press", "3×8–12", "1 min", undefined, ["dumbbells"]),
  ex("Romanian deadlift (DB)", "3×8–10", "1 min 30 sec", undefined, ["dumbbells"]),
  ex("Plank", "3×30–60s", "1 min", undefined, ["bodyweight"]),
  ex("Incline treadmill walk", "20–30 min", undefined, "Zone 2", ["treadmill"]),
];

const day2Exercises: Exercise[] = [
  ex("Leg press", "3×10–12", "1 min 30 sec", undefined, ["leg press"]),
  ex("Flat dumbbell press", "3×8–12", "1 min", undefined, ["dumbbells"]),
  ex("Cable row (short bar/diamond handle)", "3×8–12", "1 min", undefined, ["cables"]),
  ex("Dumbbell lateral raises", "3×12–15", "1 min", undefined, ["dumbbells"]),
  ex("Lunges", "2×10/side", "1 min 30 sec", undefined, ["dumbbells", "bodyweight"]),
  ex("Hanging leg raises", "3×10–12", "1 min", undefined, ["bodyweight"]),
  ex("Elliptical / cross‑walker", "20–30 min", undefined, "Zone 2", ["elliptical"]),
];

const day3Exercises: Exercise[] = [
  ex("Dumbbell row", "3×8–12", "1 min", undefined, ["dumbbells"]),
  ex("Butterfly machine", "2×12–15", "1 min", undefined, ["butterfly"]),
  ex("Goblet squat", "3×8–12", "1 min 30 sec", undefined, ["dumbbells"]),
  ex("Face pulls (rope)", "2×12–15", "1 min", undefined, ["cables"]),
  ex("DB curls", "3×10–15", "1 min", undefined, ["dumbbells"]),
  ex("Side plank", "3×30s/side", "1 min", undefined, ["bodyweight"]),
  ex("Pool swim / walk", "20–30 min", undefined, "Easy pace", ["pool"]),
];

const day4Exercises: Exercise[] = [
  ex("Leg press", "3×10–12", "1 min 30 sec", undefined, ["leg press"]),
  ex("Incline dumbbell press", "3×8–12", "1 min", undefined, ["dumbbells"]),
  ex("Overhead pulldown (long bar)", "3×8–12", "1 min", undefined, ["pulldown", "cables"]),
  ex("Dumbbell shoulder press", "3×8–12", "1 min", undefined, ["dumbbells"]),
  ex("Calf raises (DB)", "3×12–15", "1 min", undefined, ["dumbbells"]),
  ex("Crunches", "3×12–15", "1 min", undefined, ["bodyweight"]),
  ex("Treadmill walk", "20–30 min", undefined, "Zone 2", ["treadmill"]),
];

const day5Exercises: Exercise[] = [
  ex("Romanian deadlift (DB)", "3×8–10", "1 min 30 sec", undefined, ["dumbbells"]),
  ex("Flat dumbbell press", "3×8–12", "1 min", undefined, ["dumbbells"]),
  ex("Cable row (short bar/diamond handle)", "3×8–12", "1 min", undefined, ["cables"]),
  ex("Dumbbell lateral raises", "3×12–15", "1 min", undefined, ["dumbbells"]),
  ex("Hammer curls", "2×10–12", "1 min", undefined, ["dumbbells"]),
  ex("Plank", "3×30–60s", "1 min", undefined, ["bodyweight"]),
  ex("Elliptical / cross‑walker", "20–30 min", undefined, "Zone 2", ["elliptical"]),
];

export function generatePlanCycle(_customExercises: string[], startDate: string, cadenceDays: number): PlanCycle {
  const days: PlanDay[] = [
    {
      id: "d1",
      title: "Day 1 — Full Body A",
      focus: "Push/Pull/Legs + Cardio",
      exercises: day1Exercises,
    },
    {
      id: "d2",
      title: "Day 2 — Full Body B",
      focus: "Legs + Upper + Cardio",
      exercises: day2Exercises,
    },
    {
      id: "d3",
      title: "Day 3 — Full Body C",
      focus: "Upper + Core + Cardio",
      exercises: day3Exercises,
    },
    {
      id: "d4",
      title: "Day 4 — Full Body D",
      focus: "Strength + Cardio",
      exercises: day4Exercises,
    },
    {
      id: "d5",
      title: "Day 5 — Full Body E",
      focus: "Posterior chain + Upper + Cardio",
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
