import "./App.css";
import { useEffect, useMemo, useState } from "react";
import { WEEK_PLAN } from "./lib/plan";
import { exportJson, importJson, listLogs, todayKey, upsertLog, type DayLog } from "./lib/storage";
import { getSettings, updateSettings } from "./lib/settings";
import { getSummary } from "./lib/stats";
import { Line } from "react-chartjs-2";
import { Icon, IFlame, ILog, IPlan, IProgress, IProtein, ISettings, ISteps, IToday, IWeight } from "./ui/icons";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend);

type Tab = "today" | "log" | "plan" | "progress" | "settings";

type Metric = "weightKg" | "steps" | "calories" | "proteinG";

const APP_VERSION = "0.0.8";

function numberOrUndef(v: string): number | undefined {
  const n = Number(v);
  return Number.isFinite(n) ? n : undefined;
}

function MetricSheet({
  open,
  title,
  unit,
  initialValue,
  onClose,
  onSave,
}: {
  open: boolean;
  title: string;
  unit: string;
  initialValue?: number;
  onClose: () => void;
  onSave: (n?: number) => void;
}) {
  const [val, setVal] = useState<string>(initialValue?.toString() ?? "");

  useEffect(() => {
    if (open) setVal(initialValue?.toString() ?? "");
  }, [open, initialValue]);

  if (!open) return null;

  return (
    <div className="sheetOverlay" onClick={onClose}>
      <div className="sheet" onClick={(e) => e.stopPropagation()}>
        <div className="sheetHeader">
          <div>
            <div className="sheetTitle">{title}</div>
            <div className="muted">Enter a number ({unit})</div>
          </div>
          <button className="iconBtn" onClick={onClose} aria-label="Close">
            ✕
          </button>
        </div>

        <div className="sheetBody">
          <div className="sheetInputRow">
            <input
              className="sheetInput"
              inputMode="decimal"
              placeholder="0"
              value={val}
              onChange={(e) => setVal(e.target.value)}
              autoFocus
            />
            <div className="sheetUnit">{unit}</div>
          </div>

          <div className="chips">
            {[5, 10, 25].map((inc) => (
              <button
                key={inc}
                className="chipBtn"
                onClick={() => {
                  const current = Number(val);
                  const next = Number.isFinite(current) ? current + inc : inc;
                  setVal(String(next));
                }}
              >
                +{inc}
              </button>
            ))}
            <button className="chipBtn" onClick={() => setVal("")}
              >Clear</button>
          </div>

          <button
            className="btn primary"
            onClick={() => {
              onSave(numberOrUndef(val));
              onClose();
            }}
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const [tab, setTab] = useState<Tab>("today");
  const [tick, setTick] = useState(0);

  const [sheetOpen, setSheetOpen] = useState(false);
  const [sheetMetric, setSheetMetric] = useState<Metric>("weightKg");

  const today = useMemo(() => todayKey(), []);

  const logs = useMemo(() => {
    tick;
    return listLogs();
  }, [tick]);

  const todayLog: DayLog | undefined = useMemo(() => logs.find((l) => l.date === today), [logs, today]);

  const settings = useMemo(() => {
    tick;
    return getSettings();
  }, [tick]);

  const summary = useMemo(() => {
    tick;
    return getSummary();
  }, [tick]);

  useEffect(() => {
    // Seed today with a suggested plan day (simple: rotate by weekday, starting Monday as Day 1)
    if (!todayLog?.planDayId) {
      const weekday = new Date().getDay();
      const dayIndex = weekday === 0 ? 6 : weekday - 1; // Mon=0..Sun=6
      const suggested = WEEK_PLAN[dayIndex]?.id;
      if (suggested) {
        upsertLog(today, { planDayId: suggested, completedExerciseIdx: [] });
        setTick((t) => t + 1);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const selectedPlan = WEEK_PLAN.find((d) => d.id === todayLog?.planDayId) ?? WEEK_PLAN[0];

  const weightData = useMemo(() => {
    const w = logs.filter((l) => typeof l.weightKg === "number");
    return {
      labels: w.map((l) => l.date),
      datasets: [
        {
          label: "Weight (kg)",
          data: w.map((l) => l.weightKg as number),
          borderColor: "#4f8cff",
          backgroundColor: "rgba(79, 140, 255, 0.2)",
          tension: 0.25,
        },
      ],
    };
  }, [logs]);

  function save(patch: Partial<DayLog>) {
    upsertLog(today, patch);
    setTick((t) => t + 1);
  }

  function setPlanDay(planDayId: string) {
    save({ planDayId, completedExerciseIdx: [], workoutDone: false });
  }

  function toggleExercise(i: number) {
    const current = new Set(todayLog?.completedExerciseIdx ?? []);
    if (current.has(i)) current.delete(i);
    else current.add(i);

    const next = Array.from(current).sort((a, b) => a - b);
    const total = selectedPlan.exercises.length;
    const allDone = total > 0 && next.length === total;

    save({ completedExerciseIdx: next, workoutDone: allDone ? true : todayLog?.workoutDone });
  }

  function resetChecklist() {
    save({ completedExerciseIdx: [], workoutDone: false });
  }

  function openMetric(m: Metric) {
    setSheetMetric(m);
    setSheetOpen(true);
  }

  const sheetConfig = useMemo(() => {
    const map: Record<Metric, { title: string; unit: string; value?: number }>= {
      weightKg: { title: "Log weight", unit: "kg", value: todayLog?.weightKg },
      steps: { title: "Log steps", unit: "steps", value: todayLog?.steps },
      calories: { title: "Log calories", unit: "kcal", value: todayLog?.calories },
      proteinG: { title: "Log protein", unit: "g", value: todayLog?.proteinG },
    };
    return map[sheetMetric];
  }, [sheetMetric, todayLog]);

  const dailyChecklist = useMemo(() => {
    const items = [
      {
        key: "weightKg" as const,
        title: "Weigh-in",
        right: typeof todayLog?.weightKg === "number" ? `${todayLog?.weightKg} kg` : "Not logged",
        sub: "Morning is best (after bathroom)",
      },
      {
        key: "proteinG" as const,
        title: "Protein",
        right:
          typeof todayLog?.proteinG === "number"
            ? `${todayLog?.proteinG}/${settings.proteinTarget} g`
            : `0/${settings.proteinTarget} g`,
        sub: "Hit this first — makes the diet easier",
      },
      {
        key: "calories" as const,
        title: "Calories",
        right:
          typeof todayLog?.calories === "number"
            ? `${todayLog?.calories}/${settings.calorieTarget} kcal`
            : `0/${settings.calorieTarget} kcal`,
        sub: "Stay near target (weekly average matters)",
      },
      {
        key: "steps" as const,
        title: "Steps",
        right:
          typeof todayLog?.steps === "number" ? `${todayLog?.steps}/${settings.stepGoal}` : `0/${settings.stepGoal}`,
        sub: "Low-stress fat loss lever",
      },
    ];
    return items;
  }, [todayLog, settings]);

  const metricIcon = (m: Metric) => {
    switch (m) {
      case "weightKg":
        return (
          <Icon>
            <IWeight />
          </Icon>
        );
      case "steps":
        return (
          <Icon>
            <ISteps />
          </Icon>
        );
      case "calories":
        return (
          <Icon>
            <IFlame />
          </Icon>
        );
      case "proteinG":
        return (
          <Icon>
            <IProtein />
          </Icon>
        );
      default:
        return null;
    }
  };

  return (
    <div className="appShell">
      <header className="appBar">
        <div className="appBarInner">
          <div>
            <div className="appTitle">
              {tab === "today"
                ? "Today"
                : tab === "log"
                  ? "Log"
                  : tab === "plan"
                    ? "Plan"
                    : tab === "progress"
                      ? "Progress"
                      : "Settings"}
            </div>
            <div className="appSub">{today}</div>
          </div>
          <div className="appBadge">v{APP_VERSION}</div>
        </div>
      </header>

      <main className="main">
        {tab === "today" && (
          <>
            {(() => {
              const proteinRatio = Math.min(1, (todayLog?.proteinG ?? 0) / Math.max(1, settings.proteinTarget));
              const stepsRatio = Math.min(1, (todayLog?.steps ?? 0) / Math.max(1, settings.stepGoal));
              const workoutRatio = Math.min(
                1,
                (todayLog?.completedExerciseIdx?.length ?? 0) / Math.max(1, selectedPlan.exercises.length)
              );
              const weightDone = typeof todayLog?.weightKg === "number" ? 1 : 0;
              const score = (proteinRatio + stepsRatio + workoutRatio + weightDone) / 4;
              const pct = Math.round(score * 100);

              return (
                <section className="hero glass">
                  <div className="ringWrap">
                    <div className="ring" style={{ ["--p" as never]: `${pct}%` } as never} />
                    <div className="ringText">{pct}%</div>
                  </div>
                  <div style={{ flex: 1 }}>
                    <div className="heroTitle">Today</div>
                    <div className="heroSub">One screen. Stay consistent.</div>

                    <div className="heroStats">
                      <div className="heroStat">
                        <div className="heroStatLabel">Protein</div>
                        <div className="heroStatValue">
                          {(todayLog?.proteinG ?? 0)}/{settings.proteinTarget} g
                        </div>
                      </div>
                      <div className="heroStat">
                        <div className="heroStatLabel">Steps</div>
                        <div className="heroStatValue">
                          {(todayLog?.steps ?? 0)}/{settings.stepGoal}
                        </div>
                      </div>
                      <div className="heroStat">
                        <div className="heroStatLabel">Workout</div>
                        <div className="heroStatValue">
                          {(todayLog?.completedExerciseIdx?.length ?? 0)}/{selectedPlan.exercises.length} done
                        </div>
                      </div>
                      <div className="heroStat">
                        <div className="heroStatLabel">Weight</div>
                        <div className="heroStatValue">{typeof todayLog?.weightKg === "number" ? `${todayLog.weightKg} kg` : "—"}</div>
                      </div>
                    </div>
                  </div>
                </section>
              );
            })()}

            <section className="card">
              <div className="row" style={{ justifyContent: "space-between" }}>
                <div>
                  <h2>Daily checklist</h2>
                  <div className="muted">Tap any row to log — 1–2 taps.</div>
                </div>
              </div>

              <ul className="metricList">
                {dailyChecklist.map((it) => (
                  <li key={it.key}>
                    <button className="metricRow glass" onClick={() => openMetric(it.key)}>
                      <div className="metricLeft">
                        {metricIcon(it.key)}
                        <div>
                          <div className="metricTitle">{it.title}</div>
                          <div className="muted">{it.sub}</div>
                        </div>
                      </div>
                      <div className="metricRight">{it.right}</div>
                    </button>
                  </li>
                ))}
              </ul>

              <div className="quickActions">
                <button className="pillBtn" onClick={() => openMetric("weightKg")}>Log weight</button>
                <button className="pillBtn" onClick={() => openMetric("steps")}>Add steps</button>
                <button className="pillBtn" onClick={() => openMetric("calories")}>Add calories</button>
                <button className="pillBtn" onClick={() => openMetric("proteinG")}>Add protein</button>
              </div>

              <div className="hint">Targets are editable in Settings.</div>
            </section>

            <section className="card">
              <div className="row" style={{ justifyContent: "space-between" }}>
                <div>
                  <h2>Today’s workout</h2>
                  <div className="muted">Checkbox each exercise when it’s done.</div>
                </div>
              </div>

              <label className="field">
                <span>Planned session</span>
                <select value={todayLog?.planDayId ?? selectedPlan.id} onChange={(e) => setPlanDay(e.target.value)}>
                  {WEEK_PLAN.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.title}
                    </option>
                  ))}
                </select>
              </label>

              <div className="planBox">
                <div className="row" style={{ justifyContent: "space-between" }}>
                  <div>
                    <div className="planTitle">{selectedPlan.title}</div>
                    <div className="muted">{selectedPlan.focus}</div>
                  </div>
                  <button className="btn" onClick={resetChecklist}>
                    Reset
                  </button>
                </div>

                <div className="muted" style={{ marginTop: 10 }}>
                  {(() => {
                    const done = (todayLog?.completedExerciseIdx ?? []).length;
                    const total = selectedPlan.exercises.length;
                    return `${done}/${total} completed`;
                  })()}
                </div>

                <ul className="checklist">
                  {selectedPlan.exercises.map((ex, i) => {
                    const checked = (todayLog?.completedExerciseIdx ?? []).includes(i);
                    return (
                      <li key={i} className={checked ? "checked" : ""}>
                        <label className="checkRow">
                          <input type="checkbox" checked={checked} onChange={() => toggleExercise(i)} />
                          <div className="checkBody">
                            <div className="exName">{ex.name}</div>
                            <div className="exMeta">
                              {ex.sets ? <span className="pill">{ex.sets}</span> : null}
                              {ex.notes ? <span className="muted">{ex.notes}</span> : null}
                            </div>
                          </div>
                        </label>
                      </li>
                    );
                  })}
                </ul>

                <div className="row">
                  <button
                    className={todayLog?.workoutDone ? "btn good" : "btn"}
                    onClick={() => {
                      const total = selectedPlan.exercises.length;
                      const done = (todayLog?.completedExerciseIdx ?? []).length;
                      if (!todayLog?.workoutDone && total > 0 && done !== total) {
                        save({ workoutDone: true, completedExerciseIdx: selectedPlan.exercises.map((_, i) => i) });
                      } else {
                        save({ workoutDone: !todayLog?.workoutDone });
                      }
                    }}
                  >
                    {todayLog?.workoutDone ? "Workout marked done" : "Mark workout done"}
                  </button>
                </div>
              </div>
            </section>
          </>
        )}

        {tab === "log" && (
          <section className="card">
            <h2>Quick log</h2>
            <div className="muted">Fast entry — everything auto-saves.</div>

            <div className="grid2">
              <button className="metricCard" onClick={() => openMetric("weightKg")}>
                <div className="metricTitle">Weight</div>
                <div className="metricBig">{typeof todayLog?.weightKg === "number" ? `${todayLog?.weightKg} kg` : "—"}</div>
                <div className="muted">Tap to log</div>
              </button>
              <button className="metricCard" onClick={() => openMetric("steps")}>
                <div className="metricTitle">Steps</div>
                <div className="metricBig">{typeof todayLog?.steps === "number" ? todayLog?.steps : "—"}</div>
                <div className="muted">Goal {settings.stepGoal}</div>
              </button>
              <button className="metricCard" onClick={() => openMetric("calories")}>
                <div className="metricTitle">Calories</div>
                <div className="metricBig">{typeof todayLog?.calories === "number" ? todayLog?.calories : "—"}</div>
                <div className="muted">Target {settings.calorieTarget}</div>
              </button>
              <button className="metricCard" onClick={() => openMetric("proteinG")}>
                <div className="metricTitle">Protein</div>
                <div className="metricBig">{typeof todayLog?.proteinG === "number" ? `${todayLog?.proteinG} g` : "—"}</div>
                <div className="muted">Target {settings.proteinTarget} g</div>
              </button>
            </div>

            <label className="field">
              <span>Note</span>
              <textarea
                placeholder="sleep, soreness, cravings, etc."
                value={todayLog?.note ?? ""}
                onChange={(e) => save({ note: e.target.value })}
              />
            </label>
          </section>
        )}

        {tab === "plan" && (
          <section className="card">
            <h2>Weekly plan</h2>
            <div className="muted">Run this 8–12 weeks. Add weight when you hit the top reps.</div>
            <div className="stack">
              {WEEK_PLAN.map((d) => (
                <div key={d.id} className="planDay">
                  <div className="planDayHeader">
                    <div>
                      <div className="planTitle">{d.title}</div>
                      <div className="muted">{d.focus}</div>
                    </div>
                  </div>
                  <ul className="list">
                    {d.exercises.map((ex, i) => (
                      <li key={i}>
                        <div className="exName">{ex.name}</div>
                        <div className="exMeta">
                          {ex.sets ? <span className="pill">{ex.sets}</span> : null}
                          {ex.notes ? <span className="muted">{ex.notes}</span> : null}
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </section>
        )}

        {tab === "progress" && (
          <section className="card">
            <h2>Progress</h2>

            <div className="kpis">
              <div className="kpi">
                <div className="kpiLabel">Latest weight</div>
                <div className="kpiValue">{summary.latestWeight ?? "—"}</div>
              </div>
              <div className="kpi">
                <div className="kpiLabel">Workouts (last 7d)</div>
                <div className="kpiValue">{summary.workouts7}</div>
              </div>
              <div className="kpi">
                <div className="kpiLabel">Avg steps (last 7d)</div>
                <div className="kpiValue">{summary.avgSteps7 ?? "—"}</div>
              </div>
              <div className="kpi">
                <div className="kpiLabel">Workout streak</div>
                <div className="kpiValue">{summary.streak}</div>
              </div>
            </div>

            <div className="chart">
              {weightData.labels.length >= 2 ? (
                <Line
                  data={weightData}
                  options={{
                    responsive: true,
                    plugins: { legend: { display: false } },
                    scales: { y: { title: { display: true, text: "kg" } } },
                  }}
                />
              ) : (
                <div className="muted">Add at least 2 weight entries to see the chart.</div>
              )}
            </div>

            <h3>Recent logs</h3>
            <div className="table">
              <div className="tHead">
                <div>Date</div>
                <div>Weight</div>
                <div>Steps</div>
                <div>Workout</div>
              </div>
              {logs
                .slice()
                .reverse()
                .slice(0, 14)
                .map((l) => (
                  <div key={l.date} className="tRow">
                    <div>{l.date}</div>
                    <div>{l.weightKg ?? "—"}</div>
                    <div>{l.steps ?? "—"}</div>
                    <div>{l.workoutDone ? "✓" : "—"}</div>
                  </div>
                ))}
            </div>
          </section>
        )}

        {tab === "settings" && (
          <section className="card">
            <h2>Settings</h2>
            <div className="muted">Targets affect the Today checklist + Progress views.</div>

            <div className="grid2">
              <label className="field">
                <span>Step goal</span>
                <input
                  inputMode="numeric"
                  value={settings.stepGoal}
                  onChange={(e) => {
                    updateSettings({ stepGoal: Number(e.target.value) || 0 });
                    setTick((t) => t + 1);
                  }}
                />
              </label>
              <label className="field">
                <span>Calorie target (kcal)</span>
                <input
                  inputMode="numeric"
                  value={settings.calorieTarget}
                  onChange={(e) => {
                    updateSettings({ calorieTarget: Number(e.target.value) || 0 });
                    setTick((t) => t + 1);
                  }}
                />
              </label>
              <label className="field">
                <span>Protein target (g)</span>
                <input
                  inputMode="numeric"
                  value={settings.proteinTarget}
                  onChange={(e) => {
                    updateSettings({ proteinTarget: Number(e.target.value) || 0 });
                    setTick((t) => t + 1);
                  }}
                />
              </label>
            </div>

            <h3>Backup</h3>
            <div className="row">
              <button
                className="btn"
                onClick={async () => {
                  const data = exportJson();
                  await navigator.clipboard.writeText(data);
                  alert("Backup JSON copied to clipboard.");
                }}
              >
                Copy backup JSON
              </button>
            </div>

            <label className="field">
              <span>Restore from backup JSON</span>
              <textarea placeholder="Paste backup JSON here" rows={6} id="restore" />
            </label>
            <div className="row">
              <button
                className="btn danger"
                onClick={() => {
                  const el = document.getElementById("restore") as HTMLTextAreaElement | null;
                  if (!el) return;
                  try {
                    importJson(el.value);
                    setTick((t) => t + 1);
                    alert("Restored.");
                  } catch (e) {
                    alert(e instanceof Error ? e.message : "Restore failed");
                  }
                }}
              >
                Restore (overwrites current data)
              </button>
            </div>

            <div className="hint">Tip: add this app to your Home Screen for a native feel.</div>
          </section>
        )}
      </main>

      {tab !== "today" && (
        <button className="fab" onClick={() => openMetric("weightKg")} aria-label="Quick log">
          +
        </button>
      )}

      <nav className="bottomNav">
        <div className="bottomNavInner">
          <button className={tab === "today" ? "active" : ""} onClick={() => setTab("today")}>
            <Icon><IToday /></Icon>
            <span>Today</span>
          </button>
          <button className={tab === "log" ? "active" : ""} onClick={() => setTab("log")}>
            <Icon><ILog /></Icon>
            <span>Log</span>
          </button>
          <button className={tab === "plan" ? "active" : ""} onClick={() => setTab("plan")}>
            <Icon><IPlan /></Icon>
            <span>Plan</span>
          </button>
          <button className={tab === "progress" ? "active" : ""} onClick={() => setTab("progress")}>
            <Icon><IProgress /></Icon>
            <span>Progress</span>
          </button>
          <button className={tab === "settings" ? "active" : ""} onClick={() => setTab("settings")}>
            <Icon><ISettings /></Icon>
            <span>Settings</span>
          </button>
        </div>
      </nav>

      <MetricSheet
        open={sheetOpen}
        title={sheetConfig.title}
        unit={sheetConfig.unit}
        initialValue={sheetConfig.value}
        onClose={() => setSheetOpen(false)}
        onSave={(n) => {
          const patch: Partial<DayLog> = { [sheetMetric]: n } as Partial<DayLog>;
          save(patch);
        }}
      />
    </div>
  );
}
