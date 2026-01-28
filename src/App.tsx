import { useEffect, useMemo, useState, useCallback } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { format } from 'date-fns';
import { 
  Activity, 
  Dumbbell, 
  Calendar, 
  TrendingUp, 
  Settings, 
  Scale, 
  Footprints, 
  Flame, 
  Beef,
  ChevronRight,
  Plus,
  Check,
  RotateCcw,
  Download,
  Upload,
  BarChart3
} from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';

import type { DayLog, Metric, Tab, Range } from '@/types';
import {
  todayKey,
  listLogs,
  upsertLog,
  getSettings,
  updateSettings,
  getPlanCycle,
  getPlanForDate,
  getSummary,
  exportJson,
  importJson,
  getCustomExercises,
  updateCustomExercises,
} from '@/lib/storage';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend, Filler);

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const APP_VERSION = '0.3.2';

// Icons for metrics
const MetricIcon = ({ metric, className }: { metric: Metric; className?: string }) => {
  switch (metric) {
    case 'weightKg':
      return <Scale className={className} />;
    case 'steps':
      return <Footprints className={className} />;
    case 'calories':
      return <Flame className={className} />;
    case 'proteinG':
      return <Beef className={className} />;
    default:
      return null;
  }
};

// Metric config
const metricConfig: Record<Metric, { label: string; unit: string; placeholder: string; step: number }> = {
  weightKg: { label: 'Weight', unit: 'kg', placeholder: '75.5', step: 0.1 },
  steps: { label: 'Steps', unit: 'steps', placeholder: '10000', step: 100 },
  calories: { label: 'Calories', unit: 'kcal', placeholder: '2200', step: 50 },
  proteinG: { label: 'Protein', unit: 'g', placeholder: '160', step: 5 },
};

// Progress Bar Component
function ProgressBar({ 
  label, 
  value, 
  max, 
  suffix = '', 
  color = 'bg-blue-500' 
}: { 
  label: string; 
  value: number; 
  max: number; 
  suffix?: string;
  color?: string;
}) {
  const pct = Math.min(100, Math.round((value / Math.max(1, max)) * 100));
  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center text-sm">
        <span className="font-medium text-slate-300">{label}</span>
        <span className="text-slate-400">
          {value}/{max}{suffix}
        </span>
      </div>
      <div className="h-2 bg-slate-700/50 rounded-full overflow-hidden">
        <div 
          className={cn("h-full rounded-full transition-all duration-500", color)}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

// Metric Sheet Component
function MetricSheet({
  open,
  onOpenChange,
  metric,
  value,
  onSave,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  metric: Metric;
  value?: number;
  onSave: (val?: number) => void;
}) {
  const [inputValue, setInputValue] = useState(value?.toString() || '');
  const config = metricConfig[metric];

  useEffect(() => {
    if (open) {
      setInputValue(value?.toString() || '');
    }
  }, [open, value]);

  const handleSave = () => {
    const num = inputValue ? parseFloat(inputValue) : undefined;
    onSave(num);
    onOpenChange(false);
  };

  const quickAdds = metric === 'weightKg' ? [0.5, 1] : metric === 'steps' ? [1000, 2000] : [50, 100];

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="bg-slate-900 border-slate-800">
        <SheetHeader>
          <SheetTitle className="text-slate-100 flex items-center gap-2">
            <MetricIcon metric={metric} className="w-5 h-5" />
            Log {config.label}
          </SheetTitle>
        </SheetHeader>
        <div className="mt-6 space-y-4">
          <div className="flex items-end gap-2">
            <div className="flex-1">
              <Input
                type="number"
                inputMode="decimal"
                placeholder={config.placeholder}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                className="bg-slate-800 border-slate-700 text-slate-100 text-2xl h-14"
                autoFocus
              />
            </div>
            <span className="text-slate-400 pb-4">{config.unit}</span>
          </div>
          
          <div className="flex gap-2">
            {quickAdds.map((add) => (
              <Button
                key={add}
                variant="outline"
                size="sm"
                onClick={() => {
                  const current = parseFloat(inputValue) || 0;
                  setInputValue((current + add).toString());
                }}
                className="border-slate-700 text-slate-300 hover:bg-slate-800"
              >
                +{add}
              </Button>
            ))}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setInputValue('')}
              className="border-slate-700 text-slate-300 hover:bg-slate-800"
            >
              Clear
            </Button>
          </div>

          <Button onClick={handleSave} className="w-full bg-blue-600 hover:bg-blue-700">
            Save
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}

// Main App Component
function App() {
  const [tab, setTab] = useState<Tab>('today');
  const [tick, setTick] = useState(0);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [sheetMetric, setSheetMetric] = useState<Metric>('weightKg');
  const [range, setRange] = useState<Range>('today');

  // Derived state
  const today = useMemo(() => todayKey(), []);
  const logs = useMemo(() => listLogs(), [tick]);
  const todayLog = useMemo(() => logs.find((l) => l.date === today), [logs, today]);
  const settings = useMemo(() => getSettings(), [tick]);
  const summary = useMemo(() => getSummary(), [tick]);
  const customExercises = useMemo(() => getCustomExercises(), [tick]);
  const planCycle = useMemo(() => getPlanCycle(today), [today, tick]);
  const todayPlan = useMemo(() => getPlanForDate(today), [today, tick]);
  const selectedPlan = planCycle.days.find((d) => d.id === todayLog?.planDayId) || todayPlan;

  // Initialize today's log
  useEffect(() => {
    if (!todayLog?.planDayId) {
      upsertLog(today, { planDayId: todayPlan.id, completedExerciseIdx: [] });
      setTick((t) => t + 1);
    }
  }, []);

  // Save helper
  const save = useCallback((patch: Partial<DayLog>) => {
    upsertLog(today, patch);
    setTick((t) => t + 1);
  }, [today]);

  // Open metric sheet
  const openMetric = useCallback((m: Metric) => {
    setSheetMetric(m);
    setSheetOpen(true);
  }, []);

  // Toggle exercise
  const toggleExercise = useCallback((i: number) => {
    const current = new Set(todayLog?.completedExerciseIdx || []);
    if (current.has(i)) current.delete(i);
    else current.add(i);

    const next = Array.from(current).sort((a, b) => a - b);
    const total = selectedPlan.exercises.length;
    const allDone = total > 0 && next.length === total;

    save({ completedExerciseIdx: next, workoutDone: allDone });
  }, [todayLog, selectedPlan, save]);

  // Reset checklist
  const resetChecklist = useCallback(() => {
    save({ completedExerciseIdx: [], workoutDone: false });
  }, [save]);

  // Set plan day
  const setPlanDay = useCallback((planDayId: string) => {
    save({ planDayId, completedExerciseIdx: [], workoutDone: false });
  }, [save]);

  // Calculate daily score
  const scorePct = useMemo(() => {
    const proteinRatio = Math.min(1, (todayLog?.proteinG || 0) / Math.max(1, settings.proteinTarget));
    const stepsRatio = Math.min(1, (todayLog?.steps || 0) / Math.max(1, settings.stepGoal));
    const workoutRatio = Math.min(
      1,
      (todayLog?.completedExerciseIdx?.length || 0) / Math.max(1, selectedPlan.exercises.length)
    );
    const weightDone = typeof todayLog?.weightKg === 'number' ? 1 : 0;
    const score = (proteinRatio + stepsRatio + workoutRatio + weightDone) / 4;
    return Math.round(score * 100);
  }, [todayLog, settings, selectedPlan]);

  // Get logs for a date range
  const getLogsForRange = useCallback((rangeType: Range): DayLog[] => {
    const today = new Date();
    const todayStr = todayKey();
    
    if (rangeType === 'today') {
      return logs.filter(l => l.date === todayStr);
    }
    
    const daysBack = rangeType === 'week' ? 7 : 30;
    const cutoff = new Date(today);
    cutoff.setDate(cutoff.getDate() - daysBack);
    
    return logs.filter(l => new Date(l.date) >= cutoff);
  }, [logs]);

  // Calculate aggregated stats for a range
  const rangeStats = useMemo(() => {
    const rangeLogs = getLogsForRange(range);
    const count = Math.max(1, rangeLogs.length);
    
    const totalProtein = rangeLogs.reduce((sum, l) => sum + (l.proteinG || 0), 0);
    const totalSteps = rangeLogs.reduce((sum, l) => sum + (l.steps || 0), 0);
    const totalCalories = rangeLogs.reduce((sum, l) => sum + (l.calories || 0), 0);
    const totalWorkouts = rangeLogs.filter(l => l.workoutDone).length;
    const weightLogs = rangeLogs.filter(l => typeof l.weightKg === 'number');
    
    return {
      protein: Math.round(totalProtein / count),
      proteinTarget: settings.proteinTarget,
      steps: Math.round(totalSteps / count),
      stepGoal: settings.stepGoal,
      calories: Math.round(totalCalories / count),
      calorieTarget: settings.calorieTarget,
      workouts: totalWorkouts,
      totalDays: count,
      weightCount: weightLogs.length,
      avgWeight: weightLogs.length > 0 
        ? (weightLogs.reduce((sum, l) => sum + (l.weightKg || 0), 0) / weightLogs.length).toFixed(1)
        : undefined,
    };
  }, [getLogsForRange, range, settings]);

  // Weight chart data
  const weightData = useMemo(() => {
    const w = logs.filter((l) => typeof l.weightKg === 'number');
    return {
      labels: w.map((l) => format(new Date(l.date), 'MMM d')),
      datasets: [
        {
          label: 'Weight (kg)',
          data: w.map((l) => l.weightKg as number),
          borderColor: '#3b82f6',
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          tension: 0.3,
          fill: true,
          pointRadius: 4,
          pointBackgroundColor: '#3b82f6',
          pointBorderColor: '#1e293b',
          pointBorderWidth: 2,
        },
      ],
    };
  }, [logs]);

  // Recent logs
  const recentLogs = useMemo(() => {
    return logs.slice().reverse().slice(0, 4);
  }, [logs]);

  // Daily checklist items
  const dailyChecklist = useMemo(() => [
    {
      key: 'weightKg' as Metric,
      title: 'Weigh-in',
      value: todayLog?.weightKg,
      display: typeof todayLog?.weightKg === 'number' ? `${todayLog.weightKg} kg` : 'Not logged',
      sub: 'Morning is best (after bathroom)',
      target: undefined,
    },
    {
      key: 'proteinG' as Metric,
      title: 'Protein',
      value: todayLog?.proteinG,
      display: typeof todayLog?.proteinG === 'number' ? `${todayLog.proteinG}/${settings.proteinTarget} g` : `0/${settings.proteinTarget} g`,
      sub: 'Hit this first — makes the diet easier',
      target: settings.proteinTarget,
    },
    {
      key: 'calories' as Metric,
      title: 'Calories',
      value: todayLog?.calories,
      display: typeof todayLog?.calories === 'number' ? `${todayLog.calories}/${settings.calorieTarget} kcal` : `0/${settings.calorieTarget} kcal`,
      sub: 'Stay near target (weekly average matters)',
      target: settings.calorieTarget,
    },
    {
      key: 'steps' as Metric,
      title: 'Steps',
      value: todayLog?.steps,
      display: typeof todayLog?.steps === 'number' ? `${todayLog.steps}/${settings.stepGoal}` : `0/${settings.stepGoal}`,
      sub: 'Low-stress fat loss lever',
      target: settings.stepGoal,
    },
  ], [todayLog, settings]);

  // Navigation items
  const navItems: { id: Tab; label: string; icon: React.ElementType }[] = [
    { id: 'today', label: 'Today', icon: Activity },
    { id: 'stats', label: 'Stats', icon: BarChart3 },
    { id: 'log', label: 'Log', icon: Calendar },
    { id: 'plan', label: 'Plan', icon: Dumbbell },
    { id: 'progress', label: 'Progress', icon: TrendingUp },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-slate-950/80 backdrop-blur-xl border-b border-slate-800/50 safe-area-top">
        <div className="max-w-lg mx-auto px-4 py-3 flex items-center justify-between">
          <div>
            <h1 className="font-bold text-lg">Fitness Tracker</h1>
            <p className="text-xs text-slate-400">{format(new Date(), 'EEEE, MMMM d')}</p>
          </div>
          <Badge variant="secondary" className="bg-slate-800 text-slate-400">
            v{APP_VERSION}
          </Badge>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <div className="max-w-lg mx-auto px-4 py-4 pb-32">
          {/* TODAY TAB */}
          {tab === 'today' && (
            <div className="space-y-4">
              {/* Hero Card - Simplified */}
              <Card className="bg-gradient-to-br from-slate-900 to-slate-800 border-slate-700/50">
                <CardContent className="p-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="font-bold text-xl">Today</h2>
                      <p className="text-sm text-slate-400">Score reflects consistency</p>
                    </div>
                    <div className="text-right">
                      <div className="text-4xl font-bold text-blue-400">{scorePct}%</div>
                      <div className="text-xs text-slate-400">Daily Score</div>
                    </div>
                  </div>

                  {/* Quick Actions */}
                  <div className="flex flex-wrap gap-2 mt-5">
                    <Button variant="outline" size="sm" onClick={() => openMetric('weightKg')} className="border-slate-700 flex-1">
                      <Scale className="w-4 h-4 mr-1" />
                      Weight
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => openMetric('steps')} className="border-slate-700 flex-1">
                      <Footprints className="w-4 h-4 mr-1" />
                      Steps
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => openMetric('calories')} className="border-slate-700 flex-1">
                      <Flame className="w-4 h-4 mr-1" />
                      Cals
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => openMetric('proteinG')} className="border-slate-700 flex-1">
                      <Beef className="w-4 h-4 mr-1" />
                      Protein
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Daily Checklist */}
              <Card className="bg-slate-900 border-slate-800">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">Daily Checklist</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {dailyChecklist.map((item) => (
                    <button
                      key={item.key}
                      onClick={() => openMetric(item.key)}
                      className="w-full flex items-center justify-between p-3 rounded-lg bg-slate-800/50 hover:bg-slate-800 transition-colors text-left"
                    >
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          'w-10 h-10 rounded-lg flex items-center justify-center',
                          typeof item.value === 'number' ? 'bg-blue-500/20 text-blue-400' : 'bg-slate-700 text-slate-400'
                        )}>
                          <MetricIcon metric={item.key} className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="font-medium">{item.title}</div>
                          <div className="text-xs text-slate-400">{item.sub}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={cn(
                          'text-sm font-medium',
                          typeof item.value === 'number' ? 'text-slate-200' : 'text-slate-500'
                        )}>
                          {item.display}
                        </span>
                        <ChevronRight className="w-4 h-4 text-slate-500" />
                      </div>
                    </button>
                  ))}
                </CardContent>
              </Card>

              {/* Recent Activity */}
              <Card className="bg-slate-900 border-slate-800">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">Recent Activity</CardTitle>
                </CardHeader>
                <CardContent>
                  {recentLogs.length === 0 ? (
                    <p className="text-slate-400 text-sm">No logs yet. Start tracking today!</p>
                  ) : (
                    <div className="space-y-2">
                      {recentLogs.map((log) => (
                        <div key={log.date} className="flex items-center justify-between p-3 rounded-lg bg-slate-800/50">
                          <span className="text-sm">{format(new Date(log.date), 'MMM d')}</span>
                          <div className="flex gap-4 text-sm text-slate-400">
                            <span>{log.weightKg ? `${log.weightKg}kg` : '—'}</span>
                            <span>{log.steps || '—'}</span>
                            <span>{log.workoutDone ? '✓' : '—'}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Today's Workout */}
              <Card className="bg-slate-900 border-slate-800">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">Today's Workout</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <select
                      value={todayLog?.planDayId || selectedPlan.id}
                      onChange={(e) => setPlanDay(e.target.value)}
                      className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm"
                    >
                      {planCycle.days.map((d) => (
                        <option key={d.id} value={d.id}>{d.title}</option>
                      ))}
                    </select>
                    <Button variant="ghost" size="sm" onClick={resetChecklist}>
                      <RotateCcw className="w-4 h-4 mr-1" />
                      Reset
                    </Button>
                  </div>

                  <div className="bg-slate-800/50 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <div className="font-semibold">{selectedPlan.title}</div>
                        <div className="text-sm text-slate-400">{selectedPlan.focus}</div>
                      </div>
                    </div>
                    <div className="text-sm text-slate-400 mb-3">
                      {todayLog?.completedExerciseIdx?.length || 0}/{selectedPlan.exercises.length} completed
                    </div>

                    <div className="space-y-2">
                      {selectedPlan.exercises.map((ex, i) => {
                        const checked = (todayLog?.completedExerciseIdx || []).includes(i);
                        return (
                          <label
                            key={i}
                            className={cn(
                              'flex items-start gap-3 p-3 rounded-lg cursor-pointer transition-colors',
                              checked ? 'bg-emerald-500/10 border border-emerald-500/30' : 'bg-slate-700/30 border border-transparent'
                            )}
                          >
                            <input
                              type="checkbox"
                              checked={checked}
                              onChange={() => toggleExercise(i)}
                              className="mt-1 w-5 h-5 rounded border-slate-600 text-blue-600 focus:ring-blue-500"
                            />
                            <div className="flex-1">
                              <div className={cn('font-medium', checked && 'line-through text-slate-400')}>
                                {ex.name}
                              </div>
                              <div className="flex gap-2 mt-1">
                                {ex.sets && (
                                  <Badge variant="secondary" className="bg-slate-700 text-slate-300 text-xs">
                                    {ex.sets}
                                  </Badge>
                                )}
                                {ex.notes && (
                                  <span className="text-xs text-slate-400">{ex.notes}</span>
                                )}
                              </div>
                            </div>
                          </label>
                        );
                      })}
                    </div>

                    <Button
                      onClick={() => {
                        const total = selectedPlan.exercises.length;
                        const done = todayLog?.completedExerciseIdx?.length || 0;
                        if (!todayLog?.workoutDone && total > 0 && done !== total) {
                          save({ 
                            workoutDone: true, 
                            completedExerciseIdx: selectedPlan.exercises.map((_, i) => i) 
                          });
                        } else {
                          save({ workoutDone: !todayLog?.workoutDone });
                        }
                      }}
                      className={cn(
                        'w-full mt-4',
                        todayLog?.workoutDone 
                          ? 'bg-emerald-600 hover:bg-emerald-700' 
                          : 'bg-blue-600 hover:bg-blue-700'
                      )}
                    >
                      {todayLog?.workoutDone ? (
                        <><Check className="w-4 h-4 mr-2" /> Workout Complete</>
                      ) : (
                        'Mark Workout Done'
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* STATS TAB */}
          {tab === 'stats' && (
            <div className="space-y-4">
              {/* Range Selector Card */}
              <Card className="bg-slate-900 border-slate-800">
                <CardContent className="p-4">
                  <div className="flex gap-1 bg-slate-800/50 p-1 rounded-lg">
                    {(['today', 'week', 'month'] as Range[]).map((r) => (
                      <button
                        key={r}
                        onClick={() => setRange(r)}
                        className={cn(
                          'flex-1 py-2 px-2 text-sm font-medium rounded-md transition-colors',
                          range === r 
                            ? 'bg-blue-600 text-white' 
                            : 'text-slate-400 hover:text-slate-200'
                        )}
                      >
                        {r.charAt(0).toUpperCase() + r.slice(1)}
                      </button>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Stats Overview */}
              <div className="grid grid-cols-2 gap-3">
                <Card className="bg-slate-900 border-slate-800">
                  <CardContent className="p-4">
                    <div className="text-sm text-slate-400">Avg Protein</div>
                    <div className="text-xl font-bold mt-1">
                      {rangeStats.protein}<span className="text-sm text-slate-500">/{rangeStats.proteinTarget}g</span>
                    </div>
                    <div className="mt-2 h-1.5 bg-slate-700/50 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-emerald-500 rounded-full"
                        style={{ width: `${Math.min(100, (rangeStats.protein / Math.max(1, rangeStats.proteinTarget)) * 100)}%` }}
                      />
                    </div>
                  </CardContent>
                </Card>
                <Card className="bg-slate-900 border-slate-800">
                  <CardContent className="p-4">
                    <div className="text-sm text-slate-400">Avg Steps</div>
                    <div className="text-xl font-bold mt-1">
                      {rangeStats.steps.toLocaleString()}<span className="text-sm text-slate-500">/{rangeStats.stepGoal.toLocaleString()}</span>
                    </div>
                    <div className="mt-2 h-1.5 bg-slate-700/50 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-orange-500 rounded-full"
                        style={{ width: `${Math.min(100, (rangeStats.steps / Math.max(1, rangeStats.stepGoal)) * 100)}%` }}
                      />
                    </div>
                  </CardContent>
                </Card>
                <Card className="bg-slate-900 border-slate-800">
                  <CardContent className="p-4">
                    <div className="text-sm text-slate-400">Avg Calories</div>
                    <div className="text-xl font-bold mt-1">
                      {rangeStats.calories}<span className="text-sm text-slate-500">/{rangeStats.calorieTarget}</span>
                    </div>
                    <div className="mt-2 h-1.5 bg-slate-700/50 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-red-500 rounded-full"
                        style={{ width: `${Math.min(100, (rangeStats.calories / Math.max(1, rangeStats.calorieTarget)) * 100)}%` }}
                      />
                    </div>
                  </CardContent>
                </Card>
                <Card className="bg-slate-900 border-slate-800">
                  <CardContent className="p-4">
                    <div className="text-sm text-slate-400">Workouts</div>
                    <div className="text-xl font-bold mt-1">
                      {rangeStats.workouts}<span className="text-sm text-slate-500">/{rangeStats.totalDays} days</span>
                    </div>
                    <div className="mt-2 h-1.5 bg-slate-700/50 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-purple-500 rounded-full"
                        style={{ width: `${Math.min(100, (rangeStats.workouts / Math.max(1, rangeStats.totalDays)) * 100)}%` }}
                      />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Weight Stats */}
              {rangeStats.avgWeight && (
                <Card className="bg-slate-900 border-slate-800">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-sm text-slate-400">Average Weight</div>
                        <div className="text-2xl font-bold mt-1">{rangeStats.avgWeight} <span className="text-sm text-slate-500">kg</span></div>
                      </div>
                      <div className="w-12 h-12 rounded-xl bg-cyan-500/20 flex items-center justify-center">
                        <Scale className="w-6 h-6 text-cyan-400" />
                      </div>
                    </div>
                    <div className="text-sm text-slate-500 mt-2">
                      Based on {rangeStats.weightCount} weigh-ins
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Progress Bars */}
              <Card className="bg-slate-900 border-slate-800">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">
                    {range === 'today' ? "Today's Progress" : range === 'week' ? 'Weekly Averages' : 'Monthly Averages'}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <ProgressBar 
                    label="Protein" 
                    value={range === 'today' ? (todayLog?.proteinG || 0) : rangeStats.protein} 
                    max={settings.proteinTarget} 
                    suffix=" g"
                    color="bg-emerald-500"
                  />
                  <ProgressBar 
                    label="Steps" 
                    value={range === 'today' ? (todayLog?.steps || 0) : rangeStats.steps} 
                    max={settings.stepGoal}
                    color="bg-orange-500"
                  />
                  <ProgressBar 
                    label="Calories" 
                    value={range === 'today' ? (todayLog?.calories || 0) : rangeStats.calories} 
                    max={settings.calorieTarget}
                    suffix=" kcal"
                    color="bg-red-500"
                  />
                  <ProgressBar 
                    label="Workouts" 
                    value={range === 'today' ? (todayLog?.completedExerciseIdx?.length || 0) : rangeStats.workouts} 
                    max={range === 'today' ? Math.max(1, selectedPlan.exercises.length) : rangeStats.totalDays}
                    color="bg-purple-500"
                  />
                </CardContent>
              </Card>
            </div>
          )}

          {/* LOG TAB */}
          {tab === 'log' && (
            <div className="space-y-4">
              <Card className="bg-slate-900 border-slate-800">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">Quick Log</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-3">
                    {(['weightKg', 'steps', 'calories', 'proteinG'] as Metric[]).map((m) => {
                      const config = metricConfig[m];
                      const val = todayLog?.[m];
                      return (
                        <button
                          key={m}
                          onClick={() => openMetric(m)}
                          className="p-4 rounded-xl bg-slate-800/50 hover:bg-slate-800 transition-colors text-left"
                        >
                          <div className="flex items-center gap-2 text-slate-400 mb-2">
                            <MetricIcon metric={m} className="w-4 h-4" />
                            <span className="text-sm">{config.label}</span>
                          </div>
                          <div className="text-2xl font-bold">
                            {typeof val === 'number' ? val : '—'}
                          </div>
                          <div className="text-xs text-slate-500 mt-1">
                            {m === 'weightKg' ? 'kg' : m === 'proteinG' ? `/${settings.proteinTarget}g` : m === 'steps' ? `/${settings.stepGoal}` : `/${settings.calorieTarget}`}
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  <div className="mt-4">
                    <Label className="text-slate-400">Note</Label>
                    <Textarea
                      placeholder="Sleep, soreness, cravings, etc."
                      value={todayLog?.note || ''}
                      onChange={(e) => save({ note: e.target.value })}
                      className="mt-2 bg-slate-800 border-slate-700 text-slate-100"
                      rows={3}
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* PLAN TAB */}
          {tab === 'plan' && (
            <div className="space-y-4">
              <Card className="bg-slate-900 border-slate-800">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">Weekly Plan</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {planCycle.days.map((day) => (
                    <div key={day.id} className="p-4 rounded-xl bg-slate-800/50">
                      <div className="font-semibold mb-1">{day.title}</div>
                      <div className="text-sm text-slate-400 mb-3">{day.focus}</div>
                      <div className="space-y-2">
                        {day.exercises.map((ex, i) => (
                          <div key={i} className="flex items-center justify-between text-sm">
                            <span>{ex.name}</span>
                            {ex.sets && (
                              <Badge variant="secondary" className="bg-slate-700 text-slate-300">
                                {ex.sets}
                              </Badge>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          )}

          {/* PROGRESS TAB */}
          {tab === 'progress' && (
            <div className="space-y-4">
              {/* Stats Grid */}
              <div className="grid grid-cols-2 gap-3">
                <Card className="bg-slate-900 border-slate-800">
                  <CardContent className="p-4">
                    <div className="text-sm text-slate-400">Latest Weight</div>
                    <div className="text-2xl font-bold mt-1">
                      {summary.latestWeight ? `${summary.latestWeight} kg` : '—'}
                    </div>
                  </CardContent>
                </Card>
                <Card className="bg-slate-900 border-slate-800">
                  <CardContent className="p-4">
                    <div className="text-sm text-slate-400">Workouts (7d)</div>
                    <div className="text-2xl font-bold mt-1">{summary.workouts7}</div>
                  </CardContent>
                </Card>
                <Card className="bg-slate-900 border-slate-800">
                  <CardContent className="p-4">
                    <div className="text-sm text-slate-400">Avg Steps (7d)</div>
                    <div className="text-2xl font-bold mt-1">
                      {summary.avgSteps7 ? summary.avgSteps7.toLocaleString() : '—'}
                    </div>
                  </CardContent>
                </Card>
                <Card className="bg-slate-900 border-slate-800">
                  <CardContent className="p-4">
                    <div className="text-sm text-slate-400">Streak</div>
                    <div className="text-2xl font-bold mt-1">{summary.streak} days</div>
                  </CardContent>
                </Card>
              </div>

              {/* Weight Chart */}
              <Card className="bg-slate-900 border-slate-800">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">Weight Trend</CardTitle>
                </CardHeader>
                <CardContent>
                  {weightData.labels.length >= 2 ? (
                    <div className="h-64">
                      <Line
                        data={weightData}
                        options={{
                          responsive: true,
                          maintainAspectRatio: false,
                          plugins: {
                            legend: { display: false },
                          },
                          scales: {
                            x: {
                              grid: { color: 'rgba(255,255,255,0.05)' },
                              ticks: { color: '#64748b' },
                            },
                            y: {
                              grid: { color: 'rgba(255,255,255,0.05)' },
                              ticks: { color: '#64748b' },
                              title: { display: true, text: 'kg', color: '#64748b' },
                            },
                          },
                        }}
                      />
                    </div>
                  ) : (
                    <p className="text-slate-400 text-sm">Add at least 2 weight entries to see the chart.</p>
                  )}
                </CardContent>
              </Card>

              {/* Recent Logs Table */}
              <Card className="bg-slate-900 border-slate-800">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">Recent Logs</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {logs.slice().reverse().slice(0, 14).map((log) => (
                      <div key={log.date} className="grid grid-cols-4 gap-2 p-2 rounded-lg bg-slate-800/50 text-sm">
                        <span>{format(new Date(log.date), 'MMM d')}</span>
                        <span className="text-slate-400">{log.weightKg || '—'}</span>
                        <span className="text-slate-400">{log.steps || '—'}</span>
                        <span className="text-slate-400">{log.workoutDone ? '✓' : '—'}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* SETTINGS TAB */}
          {tab === 'settings' && (
            <div className="space-y-4">
              {/* Targets */}
              <Card className="bg-slate-900 border-slate-800">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">Daily Targets</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label className="text-slate-400">Step Goal</Label>
                    <Input
                      type="number"
                      value={settings.stepGoal}
                      onChange={(e) => {
                        updateSettings({ stepGoal: parseInt(e.target.value) || 0 });
                        setTick((t) => t + 1);
                      }}
                      className="mt-1 bg-slate-800 border-slate-700"
                    />
                  </div>
                  <div>
                    <Label className="text-slate-400">Calorie Target</Label>
                    <Input
                      type="number"
                      value={settings.calorieTarget}
                      onChange={(e) => {
                        updateSettings({ calorieTarget: parseInt(e.target.value) || 0 });
                        setTick((t) => t + 1);
                      }}
                      className="mt-1 bg-slate-800 border-slate-700"
                    />
                  </div>
                  <div>
                    <Label className="text-slate-400">Protein Target (g)</Label>
                    <Input
                      type="number"
                      value={settings.proteinTarget}
                      onChange={(e) => {
                        updateSettings({ proteinTarget: parseInt(e.target.value) || 0 });
                        setTick((t) => t + 1);
                      }}
                      className="mt-1 bg-slate-800 border-slate-700"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Custom Exercises */}
              <Card className="bg-slate-900 border-slate-800">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">Custom Workouts</CardTitle>
                </CardHeader>
                <CardContent>
                  <Textarea
                    rows={6}
                    value={customExercises.join('\n')}
                    onChange={(e) => {
                      const list = e.target.value
                        .split('\n')
                        .map((v) => v.trim())
                        .filter(Boolean);
                      updateCustomExercises(list);
                      setTick((t) => t + 1);
                    }}
                    placeholder="Enter workout names, one per line"
                    className="bg-slate-800 border-slate-700"
                  />
                  <p className="text-xs text-slate-400 mt-2">
                    Leave empty to use the default 4-day split plan.
                  </p>
                </CardContent>
              </Card>

              {/* Backup */}
              <Card className="bg-slate-900 border-slate-800">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">Backup & Restore</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button
                    variant="outline"
                    onClick={async () => {
                      const data = exportJson();
                      await navigator.clipboard.writeText(data);
                      alert('Backup copied to clipboard!');
                    }}
                    className="w-full border-slate-700"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Copy Backup JSON
                  </Button>

                  <div>
                    <Label className="text-slate-400">Restore from Backup</Label>
                    <Textarea
                      id="restore-json"
                      rows={4}
                      placeholder="Paste backup JSON here"
                      className="mt-1 bg-slate-800 border-slate-700"
                    />
                    <Button
                      variant="destructive"
                      onClick={() => {
                        const el = document.getElementById('restore-json') as HTMLTextAreaElement;
                        if (!el?.value) return;
                        try {
                          importJson(el.value);
                          setTick((t) => t + 1);
                          alert('Restored successfully!');
                          el.value = '';
                        } catch (e) {
                          alert('Invalid backup JSON');
                        }
                      }}
                      className="w-full mt-2"
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      Restore (Overwrites Data)
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <p className="text-center text-xs text-slate-500">
                Tip: Add this app to your Home Screen for a native feel.
              </p>
            </div>
          )}
        </div>
      </main>

      {/* FAB for non-today/stats tabs */}
      {tab !== 'today' && tab !== 'stats' && (
        <button
          onClick={() => openMetric('weightKg')}
          className="fixed right-4 bottom-24 w-14 h-14 bg-blue-600 hover:bg-blue-700 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-600/30 z-40 transition-colors"
        >
          <Plus className="w-6 h-6" />
        </button>
      )}

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-slate-950/90 backdrop-blur-xl border-t border-slate-800/50 safe-area-bottom z-50">
        <div className="max-w-lg mx-auto flex justify-around py-2 pb-6">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = tab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setTab(item.id)}
                className={cn(
                  'flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-colors',
                  isActive ? 'text-blue-400' : 'text-slate-400 hover:text-slate-200'
                )}
              >
                <Icon className={cn('w-5 h-5', isActive && 'fill-current')} />
                <span className="text-xs font-medium">{item.label}</span>
              </button>
            );
          })}
        </div>
      </nav>

      {/* Metric Sheet */}
      <MetricSheet
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        metric={sheetMetric}
        value={todayLog?.[sheetMetric]}
        onSave={(val) => save({ [sheetMetric]: val } as Partial<DayLog>)}
      />
    </div>
  );
}

export default App;
