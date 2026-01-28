export type Exercise = {
  name: string;
  sets?: string;
  notes?: string;
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

const ex = (name: string, reps: string, rest?: string, notes?: string): Exercise => ({
  name,
  sets: reps,
  notes: [rest ? `Rest ${rest}` : undefined, notes].filter(Boolean).join(" · ") || undefined,
});

const day1Exercises: Exercise[] = [
  ex("Incline dumbbell press", "12–15 reps", "1 min"),
  ex("Machine chest press", "12–15 reps", "1 min"),
  ex("Close‑grip seated row", "12–15 reps", "1 min"),
  ex("Wide‑grip lat pulldown", "10–12 reps", "1 min 30 sec"),
  ex("Dumbbell shoulder press", "12–15 reps", "1 min"),
  ex("Dumbbell lateral raises", "15 reps", "1 min"),
  ex("Dumbbell overhead tricep extension", "12–15 reps", "1 min"),
  ex("Plank", "20–30 sec", "1 min"),
  ex("Treadmill walk", "30 min", undefined, "Steady pace"),
];

const day2Exercises: Exercise[] = [
  ex("Dumbbell goblet squat", "12–15 reps", "1 min 30 sec"),
  ex("Dumbbell Romanian deadlift", "12–15 reps", "1 min 30 sec"),
  ex("Leg extensions", "12–15 reps", "1 min 30 sec"),
  ex("Lunges", "10–12 reps", "1 min 30 sec"),
  ex("Hip thrusts", "10–12 reps", "1 min"),
  ex("Dumbbell bicep curls", "12–15 reps", "1 min"),
  ex("Chest‑supported DB bicep curls", "12–15 reps", "1 min"),
  ex("Cable tricep pushdown", "12–15 reps", "1 min"),
  ex("Dumbbell skull crushers", "10–12 reps", "1 min"),
  ex("Crunches", "12–15 reps", "1 min"),
  ex("Lying leg raises", "15 reps", "1 min"),
  ex("Treadmill walk", "30 min", undefined, "Steady pace"),
];

const day3Exercises: Exercise[] = [
  ex("Wide‑grip cable row", "10–12 reps", "1 min"),
  ex("Incline dumbbell press", "10–12 reps", "1 min"),
  ex("Dumbbell row", "12–15 reps", "1 min"),
  ex("Flat dumbbell press", "10–12 reps", "1 min 30 sec"),
  ex("Dumbbell shoulder press", "12–15 reps", "1 min"),
  ex("Dumbbell lateral raises", "15 reps", "1 min"),
  ex("Dumbbell hammer curls", "15 reps", "1 min"),
  ex("Bent‑over rear‑delt fly", "15 reps", "1 min"),
  ex("Treadmill walk", "30 min", undefined, "Steady pace"),
];

export function generatePlanCycle(_customExercises: string[], startDate: string, cadenceDays: number): PlanCycle {
  const days: PlanDay[] = [
    {
      id: "d1",
      title: "Day 1 — Upper Body",
      focus: "Push/Pull + Core + Cardio",
      exercises: day1Exercises,
    },
    {
      id: "d2",
      title: "Day 2 — Lower Body & Arms",
      focus: "Legs + Arms + Abs",
      exercises: day2Exercises,
    },
    {
      id: "d3",
      title: "Day 3 — Upper Body",
      focus: "Push/Pull + Cardio",
      exercises: day3Exercises,
    },
    {
      id: "d4",
      title: "Day 4 — Recovery",
      focus: "Mobility + Steps",
      exercises: [
        { name: "Light walk", sets: "20–30 min" },
        { name: "Mobility (hips/shoulders)", sets: "10 min" },
      ],
    },
    {
      id: "d5",
      title: "Day 5 — Optional Conditioning",
      focus: "Cardio",
      exercises: [{ name: "Zone 2 cardio", sets: "30–40 min" }],
    },
    {
      id: "d6",
      title: "Day 6 — Off",
      focus: "Rest",
      exercises: [{ name: "Steps + light stretching", sets: "optional" }],
    },
    {
      id: "d7",
      title: "Day 7 — Off",
      focus: "Rest",
      exercises: [{ name: "Steps + light stretching", sets: "optional" }],
    },
  ];

  return { startDate, cadenceDays, days };
}

export function planDayForDate(date: string, cycle: PlanCycle): PlanDay {
  const dayIndex = Math.max(0, Math.min(6, (new Date(date).getDay() + 6) % 7)); // Mon=0..Sun=6
  return cycle.days[dayIndex] ?? cycle.days[0];
}
