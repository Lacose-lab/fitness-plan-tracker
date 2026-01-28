import type { DayLog, PlanCycle, PlanDay, Settings, Summary } from '@/types';

const LOGS_KEY = 'fitness_logs_v1';
const SETTINGS_KEY = 'fitness_settings_v1';
const CUSTOM_EXERCISES_KEY = 'fitness_custom_exercises_v1';

export function todayKey(): string {
  return new Date().toISOString().split('T')[0];
}

export function listLogs(): DayLog[] {
  const raw = localStorage.getItem(LOGS_KEY);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as DayLog[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function upsertLog(date: string, patch: Partial<DayLog>): void {
  const logs = listLogs();
  const idx = logs.findIndex((l) => l.date === date);
  if (idx >= 0) {
    logs[idx] = { ...logs[idx], ...patch, date };
  } else {
    logs.push({ date, ...patch });
  }
  logs.sort((a, b) => a.date.localeCompare(b.date));
  localStorage.setItem(LOGS_KEY, JSON.stringify(logs));
}

export function getSettings(): Settings {
  const raw = localStorage.getItem(SETTINGS_KEY);
  const defaults: Settings = {
    stepGoal: 10000,
    calorieTarget: 2200,
    proteinTarget: 160,
  };
  if (!raw) return defaults;
  try {
    const parsed = JSON.parse(raw) as Partial<Settings>;
    return { ...defaults, ...parsed };
  } catch {
    return defaults;
  }
}

export function updateSettings(patch: Partial<Settings>): void {
  const current = getSettings();
  localStorage.setItem(SETTINGS_KEY, JSON.stringify({ ...current, ...patch }));
}

export function getCustomExercises(): string[] {
  const raw = localStorage.getItem(CUSTOM_EXERCISES_KEY);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as string[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function updateCustomExercises(list: string[]): void {
  localStorage.setItem(CUSTOM_EXERCISES_KEY, JSON.stringify(list));
}

export function exportJson(): string {
  const data = {
    logs: listLogs(),
    settings: getSettings(),
    customExercises: getCustomExercises(),
    exportedAt: new Date().toISOString(),
  };
  return JSON.stringify(data, null, 2);
}

export function importJson(json: string): void {
  const data = JSON.parse(json);
  if (!data || typeof data !== 'object') throw new Error('Invalid backup');
  if (data.logs) localStorage.setItem(LOGS_KEY, JSON.stringify(data.logs));
  if (data.settings) localStorage.setItem(SETTINGS_KEY, JSON.stringify(data.settings));
  if (data.customExercises) localStorage.setItem(CUSTOM_EXERCISES_KEY, JSON.stringify(data.customExercises));
}

const defaultPlan: PlanCycle = {
  id: 'default',
  name: '4-Day Split',
  days: [
    {
      id: 'day1',
      title: 'Day 1: Upper A',
      focus: 'Chest / Back / Arms',
      exercises: [
        { name: 'Bench Press', sets: '3x8-12', notes: 'Control descent' },
        { name: 'Barbell Row', sets: '3x8-12', notes: 'Squeeze shoulder blades' },
        { name: 'Overhead Press', sets: '3x8-12', notes: 'Core tight' },
        { name: 'Lat Pulldown', sets: '3x10-15', notes: 'Full range' },
        { name: 'Incline Dumbbell Press', sets: '3x10-12', notes: 'Stretch at bottom' },
        { name: 'Face Pulls', sets: '3x15-20', notes: 'External rotation' },
        { name: 'Barbell Curls', sets: '3x10-12', notes: 'No swinging' },
        { name: 'Tricep Pushdowns', sets: '3x12-15', notes: 'Lock out' },
      ],
    },
    {
      id: 'day2',
      title: 'Day 2: Lower A',
      focus: 'Squat / Posterior Chain',
      exercises: [
        { name: 'Squat', sets: '3x6-10', notes: 'Depth below parallel' },
        { name: 'Romanian Deadlift', sets: '3x8-12', notes: 'Hamstring stretch' },
        { name: 'Leg Press', sets: '3x10-15', notes: 'Full extension' },
        { name: 'Walking Lunges', sets: '3x10/leg', notes: 'Torso upright' },
        { name: 'Leg Curls', sets: '3x12-15', notes: 'Squeeze at top' },
        { name: 'Calf Raises', sets: '4x15-20', notes: 'Pause at stretch' },
        { name: 'Plank', sets: '3x60s', notes: 'Hips level' },
      ],
    },
    {
      id: 'day3',
      title: 'Day 3: Rest / Active Recovery',
      focus: 'Mobility / Light Cardio',
      exercises: [
        { name: 'Light walk', sets: '20-30 min', notes: 'Zone 2 heart rate' },
        { name: 'Foam rolling', sets: '10 min', notes: 'Quads, back, IT band' },
        { name: 'Dynamic stretching', sets: '10 min', notes: 'Hips, shoulders' },
      ],
    },
    {
      id: 'day4',
      title: 'Day 4: Upper B',
      focus: 'Back / Chest / Arms',
      exercises: [
        { name: 'Pull-ups / Assisted', sets: '3x6-12', notes: 'Full range' },
        { name: 'Incline Bench Press', sets: '3x8-12', notes: 'Upper chest focus' },
        { name: 'Cable Rows', sets: '3x10-15', notes: 'Squeeze lats' },
        { name: 'Dumbbell Shoulder Press', sets: '3x8-12', notes: 'Control tempo' },
        { name: 'Chest Flyes', sets: '3x12-15', notes: 'Stretch at bottom' },
        { name: 'Lateral Raises', sets: '3x15-20', notes: 'Lead with elbows' },
        { name: 'Hammer Curls', sets: '3x10-12', notes: 'Brachialis focus' },
        { name: 'Skullcrushers', sets: '3x10-12', notes: 'Elbows fixed' },
      ],
    },
    {
      id: 'day5',
      title: 'Day 5: Lower B',
      focus: 'Deadlift / Legs',
      exercises: [
        { name: 'Deadlift', sets: '3x5-8', notes: 'Flat back, hip hinge' },
        { name: 'Front Squat', sets: '3x8-10', notes: 'Elbows up' },
        { name: 'Bulgarian Split Squats', sets: '3x8-10/leg', notes: 'Control descent' },
        { name: 'Leg Extensions', sets: '3x12-15', notes: 'Squeeze quads' },
        { name: 'Seated Calf Raises', sets: '4x15-20', notes: 'Slow eccentric' },
        { name: 'Hanging Leg Raises', sets: '3x10-15', notes: 'No swinging' },
      ],
    },
    {
      id: 'day6',
      title: 'Day 6: Optional Cardio / Weak Points',
      focus: 'Conditioning / Extra work',
      exercises: [
        { name: 'Interval training', sets: '20 min', notes: 'HIIT or LISS' },
        { name: 'Arms superset', sets: '3x15', notes: 'Curl + extension' },
        { name: 'Core circuit', sets: '3 rounds', notes: 'Crunches, leg raises' },
      ],
    },
    {
      id: 'day7',
      title: 'Day 7: Full Rest',
      focus: 'Recovery / Sleep',
      exercises: [
        { name: 'Complete rest', sets: '-', notes: 'Prioritize sleep' },
        { name: 'Light walking', sets: 'Optional', notes: 'If feeling good' },
      ],
    },
  ],
};

export function getPlanCycle(_today: string): PlanCycle {
  const custom = getCustomExercises();
  if (custom.length > 0) {
    return {
      id: 'custom',
      name: 'Custom Plan',
      days: custom.map((name, i) => ({
        id: `custom-${i}`,
        title: name,
        focus: 'Custom exercise',
        exercises: [{ name: 'Complete workout', sets: 'As planned', notes: '' }],
      })),
    };
  }
  return defaultPlan;
}

export function getPlanForDate(dateStr: string): PlanDay {
  const cycle = getPlanCycle(dateStr);
  const date = new Date(dateStr);
  const dayOfWeek = date.getDay();
  const idx = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
  return cycle.days[idx] || cycle.days[0];
}

export function getSummary(): Summary {
  const logs = listLogs();
  const last7 = logs.slice(-7);
  
  const weights = logs.map((l) => l.weightKg).filter((w): w is number => typeof w === 'number');
  const latestWeight = weights.length > 0 ? weights[weights.length - 1] : undefined;
  
  const workouts7 = last7.filter((l) => l.workoutDone).length;
  
  const steps7 = last7.map((l) => l.steps).filter((s): s is number => typeof s === 'number');
  const avgSteps7 = steps7.length > 0 ? Math.round(steps7.reduce((a, b) => a + b, 0) / steps7.length) : undefined;
  
  let streak = 0;
  for (let i = logs.length - 1; i >= 0; i--) {
    if (logs[i].workoutDone) streak++;
    else break;
  }
  
  return { latestWeight, workouts7, avgSteps7, streak };
}
