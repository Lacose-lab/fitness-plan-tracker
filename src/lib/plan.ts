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

const strengthCore = [
  { name: "Plank", sets: "3×30–60s" },
  { name: "Dead bug", sets: "3×10/side" },
  { name: "Side plank", sets: "2×30–45s/side" },
];

const lowerPool = [
  { name: "Leg press", sets: "3×8–12" },
  { name: "Goblet squat", sets: "3×8–12" },
  { name: "Hack squat", sets: "3×8–12" },
  { name: "Romanian deadlift (DB)", sets: "3×8–10" },
  { name: "Hamstring curl", sets: "3×10–15" },
  { name: "Calf raises", sets: "3×10–15" },
];

const pushPool = [
  { name: "Dumbbell bench press", sets: "3×8–12" },
  { name: "Incline DB press", sets: "3×8–12" },
  { name: "Chest fly (machine)", sets: "2×10–15" },
  { name: "Shoulder press machine", sets: "3×8–12" },
  { name: "Lateral raises (cable/DB)", sets: "2×12–15" },
  { name: "Triceps pressdown", sets: "2×10–15" },
];

const pullPool = [
  { name: "Lat pulldown", sets: "3×8–12" },
  { name: "Seated cable row", sets: "3×8–12" },
  { name: "Chest‑supported row", sets: "3×8–12" },
  { name: "Face pulls", sets: "2×12–15" },
  { name: "DB curls", sets: "2×10–15" },
];

const cardioPool = [
  { name: "Zone 2 cardio", sets: "35–45 min", notes: "Incline walk / bike." },
  { name: "Intervals", sets: "10 rounds: 1 min hard / 1 min easy", notes: "Bike/rower best." },
  { name: "Incline treadmill", sets: "25–30 min", notes: "Alternate 2 min brisk / 2 min easy." },
  { name: "Stair climber", sets: "20–30 min" },
  { name: "Rowing", sets: "20–30 min" },
];

function pick<T>(arr: T[], count: number): T[] {
  const copy = arr.slice();
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy.slice(0, count);
}

function asExercise(name: string): Exercise {
  return { name, sets: "2×10–15" };
}

export function generatePlanCycle(customExercises: string[], startDate: string, cadenceDays: number): PlanCycle {
  const custom = customExercises.filter(Boolean).map(asExercise);

  const lower = pick([...lowerPool, ...custom], 2);
  const push = pick([...pushPool, ...custom], 2);
  const pull = pick([...pullPool, ...custom], 2);
  const cardio = pick(cardioPool, 3);

  const days: PlanDay[] = [
    {
      id: "d1",
      title: "Day 1 — Strength A",
      focus: "Lower + Push + Pull",
      exercises: [...lower, ...push.slice(0, 1), ...pull.slice(0, 1), pick(strengthCore, 1)[0]],
    },
    {
      id: "d2",
      title: "Day 2 — Cardio + Core",
      focus: "Zone 2",
      exercises: [cardio[0], pick(strengthCore, 1)[0]],
    },
    {
      id: "d3",
      title: "Day 3 — Strength B",
      focus: "Upper focus",
      exercises: [...push, ...pull.slice(0, 1)],
    },
    {
      id: "d4",
      title: "Day 4 — Conditioning",
      focus: "Intervals",
      exercises: [cardio[1], { name: "Mobility (hips/shoulders)", sets: "10 min" }],
    },
    {
      id: "d5",
      title: "Day 5 — Strength C",
      focus: "Lower + Back",
      exercises: [...lower.slice(0, 1), ...pull, pick(strengthCore, 1)[0]],
    },
    {
      id: "d6",
      title: "Day 6 — Cardio",
      focus: "Steady",
      exercises: [cardio[2]],
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
