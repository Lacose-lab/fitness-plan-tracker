import "./App.css";
import { useEffect, useMemo, useState } from "react";
import { WEEK_PLAN } from "./lib/plan";
import {
  exportJson,
  importJson,
  listLogs,
  todayKey,
  upsertLog,
  type DayLog,
} from "./lib/storage";
import { getSummary } from "./lib/stats";
import { Line } from "react-chartjs-2";
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

type Tab = "today" | "plan" | "progress" | "settings";

function numberOrUndef(v: string): number | undefined {
  const n = Number(v);
  return Number.isFinite(n) ? n : undefined;
}

export default function App() {
  const [tab, setTab] = useState<Tab>("today");
  const [tick, setTick] = useState(0);

  const today = useMemo(() => todayKey(), []);
  const logs = useMemo(() => {
    // tick forces reload from localStorage after save
    tick;
    return listLogs();
  }, [tick]);

  const todayLog: DayLog | undefined = useMemo(() => logs.find((l) => l.date === today), [logs, today]);

  const summary = useMemo(() => {
    tick;
    return getSummary();
  }, [tick]);

  useEffect(() => {
    // Seed today with a suggested plan day (simple: rotate by weekday, starting Monday as Day 1)
    if (!todayLog?.planDayId) {
      const weekday = new Date().getDay();
      // JS: 0=Sun..6=Sat; map to our 1..7
      const dayIndex = weekday === 0 ? 6 : weekday - 1; // Mon=0..Sun=6
      const suggested = WEEK_PLAN[dayIndex]?.id;
      if (suggested) {
        upsertLog(today, { planDayId: suggested });
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

  return (
    <div className="container">
      <header className="header">
        <div>
          <div className="title">Fitness Plan Tracker</div>
          <div className="subtitle">Manu • cut phase • simple + consistent</div>
        </div>
        <div className="chip">{today}</div>
      </header>

      <nav className="tabs">
        <button className={tab === "today" ? "active" : ""} onClick={() => setTab("today")}>
          Today
        </button>
        <button className={tab === "plan" ? "active" : ""} onClick={() => setTab("plan")}>
          Plan
        </button>
        <button className={tab === "progress" ? "active" : ""} onClick={() => setTab("progress")}>
          Progress
        </button>
        <button className={tab === "settings" ? "active" : ""} onClick={() => setTab("settings")}>
          Settings
        </button>
      </nav>

      {tab === "today" && (
        <section className="card">
          <div className="row">
            <div>
              <h2>Today’s focus</h2>
              <div className="muted">Pick the planned session and log your numbers.</div>
            </div>
          </div>

          <label className="field">
            <span>Planned session</span>
            <select
              value={todayLog?.planDayId ?? selectedPlan.id}
              onChange={(e) => save({ planDayId: e.target.value })}
            >
              {WEEK_PLAN.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.title}
                </option>
              ))}
            </select>
          </label>

          <div className="planBox">
            <div className="planTitle">{selectedPlan.title}</div>
            <div className="muted">{selectedPlan.focus}</div>
            <ul className="list">
              {selectedPlan.exercises.map((ex, i) => (
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

          <div className="grid2">
            <label className="field">
              <span>Weight (kg)</span>
              <input
                inputMode="decimal"
                placeholder="e.g. 86"
                value={todayLog?.weightKg ?? ""}
                onChange={(e) => save({ weightKg: numberOrUndef(e.target.value) })}
              />
            </label>
            <label className="field">
              <span>Steps</span>
              <input
                inputMode="numeric"
                placeholder="e.g. 9000"
                value={todayLog?.steps ?? ""}
                onChange={(e) => save({ steps: numberOrUndef(e.target.value) })}
              />
            </label>
            <label className="field">
              <span>Calories</span>
              <input
                inputMode="numeric"
                placeholder="e.g. 2100"
                value={todayLog?.calories ?? ""}
                onChange={(e) => save({ calories: numberOrUndef(e.target.value) })}
              />
            </label>
            <label className="field">
              <span>Protein (g)</span>
              <input
                inputMode="numeric"
                placeholder="e.g. 160"
                value={todayLog?.proteinG ?? ""}
                onChange={(e) => save({ proteinG: numberOrUndef(e.target.value) })}
              />
            </label>
          </div>

          <label className="field">
            <span>Note</span>
            <textarea
              placeholder="sleep, soreness, cravings, etc."
              value={todayLog?.note ?? ""}
              onChange={(e) => save({ note: e.target.value })}
            />
          </label>

          <div className="row">
            <button
              className={todayLog?.workoutDone ? "btn good" : "btn"}
              onClick={() => save({ workoutDone: !todayLog?.workoutDone })}
            >
              {todayLog?.workoutDone ? "Workout marked done" : "Mark workout done"}
            </button>
          </div>

          <div className="hint">
            Targets: 8–10k steps/day • 2000–2200 kcal • 150–170g protein
          </div>
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
          <h2>Settings / Backup</h2>
          <div className="muted">Your data is stored on your phone/computer (localStorage).</div>

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

          <div className="hint">
            Tip: on your phone, open the app in the browser and use “Add to Home Screen”.
          </div>
        </section>
      )}

      <footer className="footer">Built for Manu • Lacose</footer>
    </div>
  );
}
