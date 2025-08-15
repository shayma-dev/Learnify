// ==============================
// src/components/focus/FocusUI.jsx
// Presentational Focus UI (countdown) with minimalist inline styles
// ==============================
import React, { useMemo, useState } from "react";

/*  
Props contract:  

- subjects: Array<{ id: number|string, name: string }>  
- selectedSubjectId: number|string|null  

- mode: "work" | "break"  
- cycleConfig: {  
    workMinutes: number,   // default 25, editable in "Edit defaults"  
    breakMinutes: number,  // default 5,  editable in "Edit defaults"  
  }  
- targetMinutes: number    // current target for the active mode; editable when paused or idle  

- time: {  
    display: string,          // "HH:MM:SS" remaining  
    elapsedSeconds: number,  
    remainingSeconds: number,  
  }  
- isRunning: boolean  
- isPaused: boolean  

- soundEnabled: boolean      // chime toggle (both Work and Break)  

- summary: {  
    todayTotalMinutes: number,  
    todaySessionsCount: number,  
    todayBySubject: Array<{ name: string, duration: number }>, // minutes  
    allTimePerSubject: Array<{ subject_name: string, total_focus: number }>, // minutes  
    allTimeTotalMinutes: number, // sum of all subjects (minutes)  
  }  

- canStart: boolean          // computed by container; Start disabled until conditions met  
- ui: {  
    loadingSummary: boolean,  
    saving: boolean,  
    errorMessage?: string|null,  
  }  

Callbacks:  
- onSelectSubject: (id: number|string) => void  
- onChangeMode: (mode: "work"|"break") => void                // allowed only when idle  
- onChangeTargetMinutes: (minutes: number) => void            // allowed when paused or idle  
- onChangeCycleConfig: (cfg: { workMinutes: number, breakMinutes: number }) => void  

- onStart: () => void  
- onPause: () => void  
- onResume: () => void  
- onStopSave: () => void     // saves current Work session (enabled once >= 1 minute elapsed)  
- onReset: () => void        // discards without saving  
- onToggleSound: () => void  

Additional derived/helpers (UI only):  
- canStopSave: boolean       // container provides: Work mode, running, not paused, >= 60s elapsed  
- formatMinutes: (minutes: number) => string // e.g., 0m, 45m, 2h 5m  
- hasSubjects: boolean       // convenience flag  
*/

export default function FocusUI({
  // Data
  subjects = [],
  selectedSubjectId = null,

  // Mode and cycle
  mode = "work", // "work" | "break"
  cycleConfig = { workMinutes: 25, breakMinutes: 5 },
  targetMinutes = 25,

  // Timer state
  time = { display: "00:00:00", elapsedSeconds: 0, remainingSeconds: 0 },
  isRunning = false,
  isPaused = false,

  // Sound
  soundEnabled = true,

  // Summary
  summary = {
    todayTotalMinutes: 0,
    todaySessionsCount: 0,
    todayBySubject: [],
    allTimePerSubject: [],
    allTimeTotalMinutes: 0,
  },

  // Derived states
  canStart = false,
  ui = { loadingSummary: false, saving: false, errorMessage: null },

  // Callbacks
  onSelectSubject = () => {},
  onChangeMode = () => {},
  onChangeTargetMinutes = () => {},
  onChangeCycleConfig = () => {},
  onStart = () => {},
  onPause = () => {},
  onResume = () => {},
  onStopSave = () => {},
  onReset = () => {},
  onToggleSound = () => {},

  // Extras
  canStopSave = false,
  formatMinutes = (m) => `${m}m`,
  hasSubjects = false,
}) {
  const [showSettings, setShowSettings] = useState(false);

  // Palette and shared styles (matching Habits)
  const colors = {
    primary: "#111827",
    text: "#111827",
    textMuted: "#6b7280",
    border: "#e5e7eb",
    bgCard: "#ffffff",
    bgHover: "#f9fafb",
    infoBg: "#ecfeff",
    infoBorder: "#a5f3fc",
    infoText: "#0e7490",
    warnBg: "#fffbeb",
    warnBorder: "#fef3c7",
    warnText: "#92400e",
    dangerBg: "#fef2f2",
    dangerBorder: "#fecaca",
    dangerText: "#dc2626",
  };

  const styles = {
    page: {
      padding: 24,
      maxWidth: 800,
      margin: "0 auto",
    },
    card: {
      background: colors.bgCard,
      border: `1px solid ${colors.border}`,
      borderRadius: 12,
      padding: 20,
      boxShadow: "0 1px 2px rgba(0,0,0,0.03)",
    },
    headerRow: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: 16,
      gap: 12,
      flexWrap: "wrap",
    },
    labelMuted: {
      fontSize: 12,
      color: "#6b7280",
      textTransform: "uppercase",
      letterSpacing: 0.4,
    },
    group: { display: "flex", alignItems: "center", gap: 8 },
    segmentWrap: {
      display: "inline-flex",
      border: `1px solid ${colors.border}`,
      borderRadius: 8,
      overflow: "hidden",
    },
    segBtn: (active) => ({
      padding: "6px 12px",
      fontSize: 13,
      border: "none",
      outline: "none",
      cursor: "pointer",
      background: active ? colors.primary : "white",
      color: active ? "white" : colors.text,
    }),
    segBtnDivider: { borderLeft: `1px solid ${colors.border}` },
    checkboxLabel: {
      display: "flex",
      alignItems: "center",
      gap: 8,
      fontSize: 13,
      color: "#374151",
    },
    linkBtn: {
      border: "none",
      background: "transparent",
      color: "#4b5563",
      textDecoration: "underline",
      cursor: "pointer",
      fontSize: 13,
      padding: 0,
    },
    infoBox: {
      background: "#fff7ed",
      border: `1px solid #fed7aa`,
      color: "#7c2d12",
      borderRadius: 8,
      padding: 12,
      fontSize: 14,
      marginBottom: 12,
    },
    chipsWrap: { display: "flex", flexWrap: "wrap", gap: 8 },
    chip: (active, disabled) => ({
      padding: "6px 10px",
      borderRadius: 9999,
      border: `1px solid ${active ? colors.primary : colors.border}`,
      background: active ? colors.primary : "white",
      color: active ? "white" : colors.text,
      cursor: disabled ? "not-allowed" : "pointer",
      opacity: disabled ? 0.6 : 1,
      fontSize: 13,
      transition: "all .15s ease",
    }),
    timerArea: {
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      padding: "24px 0",
      gap: 4,
    },
    timerSub: { color: colors.textMuted, fontSize: 13 },
    timerDigits: {
      fontFamily:
        "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
      fontSize: 48,
      fontWeight: 600,
      color: colors.text,
      letterSpacing: 1,
    },
    rowCenter: {
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
      marginBottom: 16,
    },
    input: {
      width: 112,
      border: `1px solid ${colors.border}`,
      borderRadius: 8,
      padding: "6px 8px",
      fontSize: 14,
      color: colors.text,
    },
    hint: { fontSize: 12, color: colors.textMuted },
    controls: {
      display: "flex",
      flexWrap: "wrap",
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
    },
    btnPrimary: (enabled = true) => ({
      padding: "8px 14px",
      borderRadius: 8,
      border: `1px solid ${colors.primary}`,
      background: enabled ? colors.primary : "#e5e7eb",
      color: enabled ? "white" : "#6b7280",
      cursor: enabled ? "pointer" : "not-allowed",
      fontSize: 13,
      fontWeight: 500,
    }),
    btnNeutral: (enabled = true) => ({
      padding: "8px 14px",
      borderRadius: 8,
      border: `1px solid ${colors.border}`,
      background: enabled ? "white" : "#e5e7eb",
      color: enabled ? colors.text : "#6b7280",
      cursor: enabled ? "pointer" : "not-allowed",
      fontSize: 13,
      fontWeight: 500,
    }),
    dividerTop: {
      borderTop: `1px solid ${colors.border}`,
      paddingTop: 16,
      marginTop: 16,
    },
    grid2: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 },
    error: {
      marginTop: 12,
      color: colors.dangerText,
      background: colors.dangerBg,
      border: `1px solid ${colors.dangerBorder}`,
      borderRadius: 8,
      padding: 12,
      fontSize: 14,
    },
    section: { marginTop: 32 },
    sectionTitle: {
      fontSize: 16,
      fontWeight: 600,
      color: colors.text,
      margin: "0 0 12px 0",
    },
  };

  const sessionLocked = (isRunning || isPaused) && mode === "work";

  const subjectChips = useMemo(() => {
    if (!subjects?.length) return null;
    return (
      <div style={styles.chipsWrap}>
        {subjects.map((s) => {
          const active = String(selectedSubjectId) === String(s.id);
          return (
            <button
              key={s.id}
              type="button"
              disabled={sessionLocked}
              onClick={() => onSelectSubject(s.id)}
              style={styles.chip(active, sessionLocked)}
              title={
                sessionLocked ? "Subject locked during a Work session" : s.name
              }
              onMouseEnter={(e) => {
                if (sessionLocked || active) return;
                e.currentTarget.style.background = colors.bgHover;
              }}
              onMouseLeave={(e) => {
                if (sessionLocked || active) return;
                e.currentTarget.style.background = "white";
              }}
            >
              {s.name}
            </button>
          );
        })}
      </div>
    );
  }, [subjects, selectedSubjectId, onSelectSubject, sessionLocked]);

  return (
    <div style={styles.page}>
      {/* Timer Card */}
      <section style={styles.card}>
        {/* Header row: Mode + Sound + Edit defaults */}
        <div style={styles.headerRow}>
          <div style={styles.group}>
            <span style={styles.labelMuted}>Mode</span>
            <div style={styles.segmentWrap}>
              <button
                type="button"
                style={styles.segBtn(mode === "work")}
                onClick={() => onChangeMode("work")}
                disabled={isRunning || isPaused}
                title={
                  isPaused
                    ? "Cannot change mode while paused"
                    : "Switch to Work"
                }
              >
                Work
              </button>
              <div style={styles.segBtnDivider} />
              <button
                type="button"
                style={styles.segBtn(mode === "break")}
                onClick={() => onChangeMode("break")}
                disabled={isRunning || isPaused}
                title={
                  isPaused
                    ? "Cannot change mode while paused"
                    : "Switch to Break"
                }
              >
                Break
              </button>
            </div>
          </div>

          <div style={styles.group}>
            <label style={styles.checkboxLabel}>
              <input
                type="checkbox"
                checked={soundEnabled}
                onChange={onToggleSound}
              />
              Sound
            </label>
            <button
              type="button"
              style={styles.linkBtn}
              onClick={() => setShowSettings((s) => !s)}
            >
              {showSettings ? "Hide settings" : "Edit defaults"}
            </button>
          </div>
        </div>

        {/* Subjects (Work only) */}
        {mode === "work" ? (
          hasSubjects ? (
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 12, color: "#6b7280", marginBottom: 8 }}>
                Subject
              </div>
              {subjectChips}
            </div>
          ) : (
            <div style={styles.infoBox}>
              No subjects found. Create a subject first to start a Work session.
            </div>
          )
        ) : null}

        {/* Timer display */}
        <div style={styles.timerArea}>
          <div style={styles.timerSub}>
            {mode === "work" ? "Work" : "Break"} time remaining
          </div>
          <div style={styles.timerDigits}>{time.display}</div>
        </div>

        {/* Target control */}
        <div style={styles.rowCenter}>
          <label style={{ fontSize: 13, color: "#4b5563" }}>
            Target (minutes)
          </label>
          <input
            type="number"
            min={1}
            value={targetMinutes}
            onChange={(e) => onChangeTargetMinutes(Number(e.target.value))}
            style={styles.input}
            disabled={isRunning && !isPaused}
          />
          {isRunning && isPaused ? (
            <span style={styles.hint}>You can edit target while paused</span>
          ) : null}
        </div>

        {/* Controls */}
        <div style={styles.controls}>
          <button
            type="button"
            onClick={onStart}
            disabled={!canStart}
            style={styles.btnPrimary(!!canStart)}
            title={
              !canStart
                ? "Select a subject (Work) or switch to Break to enable"
                : "Start the timer"
            }
          >
            Start
          </button>

          <button
            type="button"
            onClick={onPause}
            disabled={!(isRunning && !isPaused)}
            style={styles.btnNeutral(isRunning && !isPaused)}
            title="Pause the timer"
          >
            Pause
          </button>

          <button
            type="button"
            onClick={onResume}
            disabled={!isPaused}
            style={styles.btnNeutral(isPaused)}
            title="Resume the timer"
          >
            Resume
          </button>

          {mode === "work" ? (
            <button
              type="button"
              onClick={onStopSave}
              disabled={!canStopSave}
              style={styles.btnNeutral(!!canStopSave)}
              title={
                !canStopSave
                  ? "Enabled after at least 1 minute elapsed"
                  : "Save current work session"
              }
            >
              Stop &amp; Save
            </button>
          ) : null}

          <button
            type="button"
            onClick={onReset}
            style={styles.btnNeutral(true)}
            title="Reset (discard without saving)"
          >
            Reset
          </button>
        </div>

        {/* Defaults editor */}
        {showSettings && (
          <div style={styles.dividerTop}>
            <div style={styles.grid2}>
              <div>
                <label
                  style={{
                    display: "block",
                    fontSize: 13,
                    color: "#4b5563",
                    marginBottom: 6,
                  }}
                >
                  Default Work (min)
                </label>
                <input
                  type="number"
                  min={1}
                  value={cycleConfig.workMinutes}
                  onChange={(e) =>
                    onChangeCycleConfig({
                      ...cycleConfig,
                      workMinutes: Math.max(
                        1,
                        Math.floor(Number(e.target.value) || 1)
                      ),
                    })
                  }
                  style={{ ...styles.input, width: "100%" }}
                />
                <p style={{ ...styles.hint, marginTop: 6 }}>
                  Used for next Work session when idle.
                </p>
              </div>

              <div>
                <label
                  style={{
                    display: "block",
                    fontSize: 13,
                    color: "#4b5563",
                    marginBottom: 6,
                  }}
                >
                  Default Break (min)
                </label>
                <input
                  type="number"
                  min={1}
                  value={cycleConfig.breakMinutes}
                  onChange={(e) =>
                    onChangeCycleConfig({
                      ...cycleConfig,
                      breakMinutes: Math.max(
                        1,
                        Math.floor(Number(e.target.value) || 1)
                      ),
                    })
                  }
                  style={{ ...styles.input, width: "100%" }}
                />
                <p style={{ ...styles.hint, marginTop: 6 }}>
                  Used for next Break session when idle.
                </p>
              </div>
            </div>
          </div>
        )}

        {ui.errorMessage ? (
          <div style={styles.error}>{ui.errorMessage}</div>
        ) : null}
      </section>

      {/* Summary: Today */}
      <section style={styles.section}>
        <div style={styles.card}>
          <h2 style={styles.sectionTitle}>Today</h2>

          {/* Top stats */}
          <div
            style={{
              display: "flex",
              gap: 12,
              flexWrap: "wrap",
              marginBottom: 12,
            }}
          >
            <StatCard
              label="Focus"
              value={formatMinutes(summary.todayTotalMinutes)}
            />
            <StatCard
              label="Sessions"
              value={String(summary.todaySessionsCount)}
            />
          </div>

          {/* By Subject Today */}
          <div>
            <div style={{ fontSize: 12, color: "#6b7280", marginBottom: 8 }}>
              By Subject (Today)
            </div>
            {summary.todayBySubject?.length ? (
              <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                {[...summary.todayBySubject]
                  .sort((a, b) => (b.duration || 0) - (a.duration || 0))
                  .map((r) => (
                    <li
                      key={r.name}
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        gap: 12,
                        padding: "6px 0",
                        fontSize: 14,
                        color: "#1f2937",
                        borderTop: "1px dashed #f3f4f6",
                      }}
                    >
                      <span
                        style={{
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {r.name}
                      </span>
                      <span style={{ color: "#6b7280", whiteSpace: "nowrap" }}>
                        {formatMinutes(r.duration)}
                      </span>
                    </li>
                  ))}
              </ul>
            ) : (
              <div style={{ fontSize: 14, color: "#6b7280" }}>
                No focus yet today.
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Summary: All-time */}
      <section style={styles.section}>
        <div style={styles.card}>
          <h2 style={styles.sectionTitle}>All-time</h2>

          {/* Total Focus */}
          <div
            style={{
              display: "flex",
              gap: 12,
              flexWrap: "wrap",
              marginBottom: 12,
            }}
          >
            <StatCard
              label="Total Focus"
              value={formatMinutes(summary.allTimeTotalMinutes)}
            />
          </div>

          {/* By Subject All-time */}
          <div>
            <div style={{ fontSize: 12, color: "#6b7280", marginBottom: 8 }}>
              By Subject (All-time)
            </div>
            {summary.allTimePerSubject?.length ? (
              <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                {[...summary.allTimePerSubject]
                  .sort((a, b) => (b.total_focus || 0) - (a.total_focus || 0))
                  .map((r) => (
                    <li
                      key={r.subject_name}
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        gap: 12,
                        padding: "6px 0",
                        fontSize: 14,
                        color: "#1f2937",
                        borderTop: "1px dashed #f3f4f6",
                      }}
                    >
                      <span
                        style={{
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {r.subject_name}
                      </span>
                      <span style={{ color: "#6b7280", whiteSpace: "nowrap" }}>
                        {formatMinutes(r.total_focus)}
                      </span>
                    </li>
                  ))}
              </ul>
            ) : (
              <div style={{ fontSize: 14, color: "#6b7280" }}>
                No focus recorded yet.
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Footer helpers */}
      <section
        style={{
          textAlign: "center",
          color: "#6b7280",
          fontSize: 12,
          marginTop: 8,
        }}
      >
        {ui.loadingSummary ? "Loading summary..." : null}
        {!hasSubjects && mode === "work" ? (
          <div style={{ marginTop: 8 }}>
            Tip: Add a subject to start tracking work sessions.
          </div>
        ) : null}
      </section>
    </div>
  );
}

function StatCard({ label, value }) {
  return (
    <div
      style={{
        border: "1px solid #e5e7eb",
        borderRadius: 8,
        padding: 12,
        background: "white",
        minWidth: 160,
        flex: "0 1 auto",
      }}
    >
      <div style={{ fontSize: 12, color: "#6b7280", marginBottom: 4 }}>
        {label}
      </div>
      <div style={{ fontSize: 18, fontWeight: 600, color: "#111827" }}>
        {value}
      </div>
    </div>
  );
}
