export type Exercise = {
  name: string;
  sets?: string; // e.g. "3×8–12"
  notes?: string;
};

export type PlanDay = {
  id: string;
  title: string;
  focus: string;
  exercises: Exercise[];
};

// Manu's weekly plan (fat loss: 3 strength + 2 cardio + 1 recovery)
export const WEEK_PLAN: PlanDay[] = [
  {
    id: "d1",
    title: "Day 1 — Strength A",
    focus: "Full body",
    exercises: [
      { name: "Leg press or squat machine", sets: "3×8–12" },
      { name: "Dumbbell bench press", sets: "3×8–12" },
      { name: "Lat pulldown", sets: "3×8–12" },
      { name: "Romanian deadlift (DB or bar)", sets: "3×8–10" },
      { name: "Cable face pulls", sets: "2×12–15" },
      { name: "Plank", sets: "3×30–60s" },
    ],
  },
  {
    id: "d2",
    title: "Day 2 — Cardio + Core",
    focus: "Zone 2",
    exercises: [
      { name: "Zone 2 cardio", sets: "35–45 min", notes: "Incline walk / bike. You can talk in sentences." },
      { name: "Dead bug", sets: "3×10/side" },
      { name: "Side plank", sets: "2×30–45s/side" },
    ],
  },
  {
    id: "d3",
    title: "Day 3 — Strength B",
    focus: "Upper focus",
    exercises: [
      { name: "Incline DB press", sets: "3×8–12" },
      { name: "Seated cable row", sets: "3×8–12" },
      { name: "Shoulder press machine", sets: "3×8–12" },
      { name: "Assisted pull-ups or pulldown", sets: "2×8–12" },
      { name: "Cable lateral raises", sets: "2×12–15" },
      { name: "Triceps pressdown", sets: "2×10–15" },
      { name: "DB curls", sets: "2×10–15" },
    ],
  },
  {
    id: "d4",
    title: "Day 4 — Recovery",
    focus: "Mobility + steps",
    exercises: [
      { name: "Easy walk OR easy bike", sets: "30–40 min" },
      { name: "Mobility (hips/hamstrings/chest/shoulders)", sets: "10 min" },
    ],
  },
  {
    id: "d5",
    title: "Day 5 — Strength C",
    focus: "Lower + back",
    exercises: [
      { name: "Hack squat / goblet squat / leg press", sets: "3×8–12" },
      { name: "Hamstring curl", sets: "3×10–15" },
      { name: "Cable row or chest-supported row", sets: "3×8–12" },
      { name: "Back extension", sets: "2×10–15" },
      { name: "Calf raises", sets: "3×10–15" },
      { name: "Hanging knee raises or crunch machine", sets: "3×10–15" },
    ],
  },
  {
    id: "d6",
    title: "Day 6 — Conditioning",
    focus: "Short + spicy",
    exercises: [
      { name: "Intervals", sets: "10 rounds: 1 min hard / 1 min easy", notes: "Bike/rower best. + 5 min warm-up + 5 min cool-down." },
      { name: "OR Incline treadmill", sets: "25–30 min", notes: "Alternate 2 min brisk / 2 min easy." },
    ],
  },
  {
    id: "d7",
    title: "Day 7 — Off",
    focus: "Rest",
    exercises: [{ name: "Steps + light stretching", sets: "optional" }],
  },
];
