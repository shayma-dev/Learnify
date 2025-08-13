// ==============================
// src/components/planner/StudyPlannerUI.jsx
// Presentational UI only
// ==============================
import React, { useMemo } from "react";

/**
 * Props contract (keep stable):
 * - loading: boolean
 * - error: string
 * - days: Array<"Mon"|"Tue"|"Wed"|"Thu"|"Fri"|"Sat"|"Sun">
 * - selectedDay: "Mon"|"Tue"|"Wed"|"Thu"|"Fri"|"Sat"|"Sun"
 * - sessions: Array<{
 *     id: number|string,
 *     day: "Mon"|"Tue"|"Wed"|"Thu"|"Fri"|"Sat"|"Sun",
 *     start_time: string,     // "HH:mm" or "HH:mm:ss"
 *     end_time: string,       // "HH:mm" or "HH:mm:ss"
 *     subject_id: number|string,
 *     subject?: string        // subject name (optional; UI will derive from subjects if absent)
 *   }>
 * - subjects: Array<{ id: number|string, name: string }>
 * - onSelectDay(day: "Mon"|"Tue"|"Wed"|"Thu"|"Fri"|"Sat"|"Sun"): void
 * - onAddClick(): void
 * - onEditClick(session): void
 * - onDeleteClick(id: number|string): void
 */

function toHHMM(t) {
  if (!t) return "";
  const [hh = "00", mm = "00"] = String(t).split(":");
  return `${hh.padStart(2, "0")}:${mm.padStart(2, "0")}`;
}

function format12h(t) {
  const [hhStr = "0", mmStr = "00"] = toHHMM(t).split(":");
  let h = Number(hhStr);
  const suffix = h >= 12 ? "PM" : "AM";
  h = h % 12;
  if (h === 0) h = 12;
  return `${h}:${mmStr} ${suffix}`;
}

export default function StudyPlannerUI({
  loading = false,
  error = "",
  days = [],
  selectedDay = "Mon",
  sessions = [],
  subjects = [],
  onSelectDay = () => {},
  onAddClick = () => {},
  onEditClick = () => {},
  onDeleteClick = () => {},
}) {
  const subjectsMap = useMemo(() => {
    const m = new Map();
    (subjects || []).forEach((s) => m.set(Number(s.id), s.name));
    return m;
  }, [subjects]);

  return (
    <div style={{ padding: 24, maxWidth: 980, margin: "0 auto" }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <h1 style={{ margin: 0 }}>Study Planner</h1>
      </div>

      {/* Day tabs */}
      <div
        style={{
          display: "flex",
          gap: 8,
          marginTop: 12,
          borderBottom: "1px solid #e5e7eb",
          paddingBottom: 8,
        }}
      >
        {days.map((d) => {
          const active = d === selectedDay;
          return (
            <button
              key={d}
              onClick={() => onSelectDay(d)}
              style={{
                padding: "6px 10px",
                borderRadius: 16,
                border: "1px solid #e5e7eb",
                background: active ? "#111827" : "white",
                color: active ? "white" : "#111827",
                cursor: "pointer",
              }}
            >
              {d}
            </button>
          );
        })}
      </div>

      <div style={{ marginTop: 12 }}>
        <button
          onClick={onAddClick}
          style={{
            padding: "8px 12px",
            border: "1px solid #e5e7eb",
            borderRadius: 20,
            background: "#111827",
            color: "white",
            cursor: "pointer",
          }}
        >
          Add Session
        </button>
      </div>

      {/* Error */}
      {error ? (
        <div
          role="status"
          aria-live="polite"
          style={{ color: "crimson", marginTop: 12 }}
        >
          {error}
        </div>
      ) : null}

      {/* Loading */}
      {loading ? <p style={{ marginTop: 12 }}>Loading…</p> : null}

      {/* Session list */}
      {!loading && (
        <section style={{ marginTop: 24 }}>
          <h3 style={{ margin: 0, marginBottom: 8 }}>Study Session List</h3>

          {sessions.length === 0 ? (
            <div
              style={{
                background: "#f3f4f6",
                borderRadius: 8,
                padding: 16,
                color: "#6b7280",
              }}
            >
              No sessions for {selectedDay}. Click “Add Session” to plan your
              study time.
            </div>
          ) : (
            <div style={{ display: "grid", gap: 8 }}>
              {sessions.map((s) => {
                const subjectName =
                  s.subject || subjectsMap.get(Number(s.subject_id)) || "—";
                return (
                  <div
                    key={s.id}
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr auto",
                      alignItems: "center",
                      gap: 8,
                      padding: "12px 6px",
                      borderBottom: "1px solid #e5e7eb",
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 500 }}>
                        {format12h(s.start_time)} - {format12h(s.end_time)}
                      </div>
                      <div
                        style={{ color: "#6b7280", fontSize: 12, marginTop: 2 }}
                      >
                        {subjectName}
                      </div>
                    </div>

                    <div style={{ display: "flex", gap: 8 }}>
                      <button
                        onClick={() => onEditClick(s)}
                        title="Edit session"
                        aria-label="Edit session"
                        style={{
                          background: "transparent",
                          border: "1px solid #e5e7eb",
                          borderRadius: 6,
                          padding: "6px 8px",
                          cursor: "pointer",
                        }}
                      >
                        ✏️
                      </button>
                      <button
                        onClick={() => onDeleteClick(s.id)}
                        title="Delete session"
                        aria-label="Delete session"
                        style={{
                          background: "transparent",
                          border: "1px solid #e5e7eb",
                          borderRadius: 6,
                          padding: "6px 8px",
                          cursor: "pointer",
                        }}
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      )}
    </div>
  );
}
