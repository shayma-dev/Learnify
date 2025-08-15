// ==============================
// src/components/habits/HabitsUI.jsx
// Presentational UI with progress bars and simple actions
// ==============================
import React from "react";

/*
Props contract:
- loading: boolean
- error: string
- message: string
- habits: Array<{
    id: number|string,
    user_id: number|string,
    name: string,
    description: string|null,
    goal: number,
    current_streak: number,
    last_completed: string|null, // "YYYY-MM-DD" or null
    created_at?: string
  }>
- filter: "All" | "Active" | "Completed"
- onFilterChange: (value) => void
- onAddClick: () => void
- onEditClick: (habit) => void
- onDeleteClick: (id) => void
- onDoneClick: (id) => void
*/

function toLocalYMD(value) {
  if (!value) return null;
  // If already "YYYY-MM-DD"
  if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return value;
  }
  // Parse ISO/timestamp and format to local "YYYY-MM-DD"
  const d = new Date(value);
  if (isNaN(d)) return null;
  return d.toLocaleDateString("en-CA"); // YYYY-MM-DD in local timezone
}

function isDoneToday(value) {
  const ymd = toLocalYMD(value); // uses the helper we added earlier
  if (!ymd) return false;
  const todayYMD = new Date().toLocaleDateString("en-CA");
  return ymd === todayYMD;
}

function relativeLastDone(value) {
  const inputYMD = toLocalYMD(value);
  if (!inputYMD) return "Never";

  const today = new Date();
  const todayYMD = today.toLocaleDateString("en-CA");

  if (inputYMD === todayYMD) return "Today";

  const y = new Date();
  y.setDate(today.getDate() - 1);
  const yesterdayYMD = y.toLocaleDateString("en-CA");
  if (inputYMD === yesterdayYMD) return "Yesterday";

  // Compute whole-day difference using noon local time to avoid DST edges
  const d1 = new Date(inputYMD + "T12:00:00");
  const d2 = new Date(todayYMD + "T12:00:00");
  const diffDays = Math.round((d2 - d1) / (1000 * 60 * 60 * 24));
  return `${diffDays}d ago`;
}

function progressPercent(current, goal) {
  const c = Number(current) || 0;
  const g = Math.max(1, Number(goal) || 1);
  return Math.min(100, Math.round((c / g) * 100));
}

function progressColor(percent) {
  if (percent >= 100) {
    return { fill: "#22c55e", track: "#e5e7eb" }; // green
  }
  if (percent >= 67) {
    return { fill: "#86efac", track: "#f1f5f9" }; // green-300
  }
  if (percent >= 34) {
    return { fill: "#fde68a", track: "#f1f5f9" }; // amber-300
  }
  return { fill: "#fecaca", track: "#f1f5f9" }; // red-300
}

function EmptyState({ title, description }) {
  return (
    <div
      style={{
        background: "#f9fafb",
        borderRadius: 12,
        padding: 48,
        textAlign: "center",
        color: "#6b7280",
      }}
    >
      <div style={{ fontSize: 48, marginBottom: 16 }}>🗓️</div>
      <h3 style={{ margin: "0 0 8px 0", color: "#374151" }}>{title}</h3>
      <p style={{ margin: 0, fontSize: 14 }}>{description}</p>
    </div>
  );
}

function HabitCard({ habit, onDone, onEdit, onDelete }) {
  const doneToday = isDoneToday(habit.last_completed);
  const completed = Number(habit.current_streak) >= Number(habit.goal);
  const cta = completed
    ? {
        label: "Goal Met",
        title: "You've reached your goal. Tap to acknowledge.",
        bg: "#ecfeff",
        border: "#a5f3fc",
        color: "#0e7490",
        hoverBg: "#cffafe",
        hoverBorder: "#67e8f9",
      }
    : doneToday
    ? {
        label: "Done for Today",
        title: "Already logged for today",
        bg: "#ecfdf5",
        border: "#bbf7d0",
        color: "#065f46",
        hoverBg: "#dcfce7",
        hoverBorder: "#86efac",
      }
    : {
        label: "Mark Today",
        title: "Mark as done for today",
        bg: "#111827",
        border: "#111827",
        color: "#ffffff",
        hoverBg: "#374151",
        hoverBorder: "#374151",
      };
  const pct = progressPercent(habit.current_streak, habit.goal);
  const colors = progressColor(pct);
  const last = relativeLastDone(habit.last_completed);
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "1fr auto",
        gap: 12,
        padding: 16,
        background: "white",
        border: "1px solid #e5e7eb",
        borderRadius: 12,
        transition: "all 0.2s ease",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = "#f9fafb";
        e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.08)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = "white";
        e.currentTarget.style.boxShadow = "none";
      }}
    >
      {/* Content */}
      <div style={{ minWidth: 0 }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            marginBottom: 4,
          }}
        >
          <h3
            style={{
              margin: 0,
              fontSize: 16,
              fontWeight: 600,
              color: "#111827",
              lineHeight: 1.4,
            }}
          >
            {habit.name}
          </h3>
          {completed && (
            <span
              style={{
                fontSize: 11,
                background: "#ecfeff",
                color: "#0e7490",
                border: "1px solid #a5f3fc",
                padding: "2px 6px",
                borderRadius: 9999,
                fontWeight: 500,
              }}
            >
              Completed
            </span>
          )}
        </div>

        {habit.description && (
          <p
            style={{
              margin: "2px 0 8px 0",
              fontSize: 13,
              color: "#6b7280",
              lineHeight: 1.4,
              overflow: "hidden",
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
            }}
          >
            {habit.description}
          </p>
        )}

        {/* Progress meta */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 6,
            gap: 8,
          }}
        >
          <span style={{ fontSize: 12, color: "#374151", fontWeight: 500 }}>
            {habit.current_streak}/{habit.goal} days
          </span>
          <span style={{ fontSize: 12, color: "#9ca3af" }}>
            Last done: {last}
          </span>
        </div>

        {/* Progress bar */}
        <div
          title={`${pct}%`}
          style={{
            width: "100%",
            height: 10,
            background: colors.track,
            borderRadius: 9999,
            overflow: "hidden",
            border: "1px solid #e5e7eb",
          }}
        >
          <div
            style={{
              width: `${pct}%`,
              height: "100%",
              background: colors.fill,
              transition: "width 0.25s ease",
            }}
          />
        </div>
      </div>

      {/* Actions */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 6,
          alignItems: "flex-end",
        }}
      >
        <button
          onClick={() => onDone(habit.id)}
          title={cta.title}
          style={{
            padding: "6px 10px",
            background: cta.bg,
            color: cta.color,
            border: `1px solid ${cta.border}`,
            borderRadius: 8,
            cursor: "pointer",
            fontSize: 13,
            fontWeight: 500,
            whiteSpace: "nowrap",
            transition: "all .15s ease",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = cta.hoverBg;
            e.currentTarget.style.borderColor = cta.hoverBorder;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = cta.bg;
            e.currentTarget.style.borderColor = cta.border;
          }}
        >
          {cta.label}
        </button>

        <div style={{ display: "flex", gap: 6 }}>
          <button
            onClick={() => onEdit(habit)}
            title="Edit habit"
            style={{
              background: "transparent",
              border: "1px solid #e5e7eb",
              borderRadius: 6,
              padding: "6px 8px",
              cursor: "pointer",
              fontSize: 12,
            }}
          >
            ✏️
          </button>
          <button
            onClick={() => onDelete(habit.id)}
            title="Delete habit"
            style={{
              background: "transparent",
              border: "1px solid #e5e7eb",
              borderRadius: 6,
              padding: "6px 8px",
              cursor: "pointer",
              fontSize: 12,
            }}
          >
            🗑️
          </button>
        </div>
      </div>
    </div>
  );
}

export default function HabitsUI({
  loading = false,
  error = "",
  message = "",
  habits = [],
  filter = "All",
  onFilterChange = () => {},
  onAddClick = () => {},
  onEditClick = () => {},
  onDeleteClick = () => {},
  onDoneClick = () => {},
}) {
  return (
    <div style={{ padding: 24, maxWidth: 1200, margin: "0 auto" }}>
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 24,
        }}
      >
        <h1 style={{ margin: 0 }}>Habits</h1>
        <button
          onClick={onAddClick}
          style={{
            padding: "8px 16px",
            background: "#111827",
            color: "white",
            border: "none",
            borderRadius: 20,
            cursor: "pointer",
            fontWeight: 500,
          }}
        >
          Add Habit
        </button>
      </div>

      {/* Filters */}
      <div
        style={{
          display: "flex",
          gap: 8,
          marginBottom: 16,
          borderBottom: "1px solid #e5e7eb",
          paddingBottom: 12,
          overflowX: "auto",
        }}
      >
        {["All", "Active", "Completed"].map((tab) => {
          const active = filter === tab;
          return (
            <button
              key={tab}
              onClick={() => onFilterChange(tab)}
              style={{
                padding: "6px 12px",
                borderRadius: 16,
                border: "1px solid #e5e7eb",
                background: active ? "#111827" : "white",
                color: active ? "white" : "#111827",
                cursor: "pointer",
                whiteSpace: "nowrap",
              }}
            >
              {tab}
            </button>
          );
        })}
      </div>

      {/* Error */}
      {error && (
        <div
          role="alert"
          style={{
            color: "#dc2626",
            background: "#fef2f2",
            border: "1px solid #fecaca",
            borderRadius: 8,
            padding: 12,
            marginBottom: 16,
          }}
        >
          {error}
        </div>
      )}

      {/* Success Message */}
      {message && (
        <div
          role="status"
          style={{
            color: "#059669",
            background: "#ecfdf5",
            border: "1px solid #a7f3d0",
            borderRadius: 8,
            padding: 12,
            marginBottom: 16,
          }}
        >
          {message}
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div style={{ textAlign: "center", padding: 48, color: "#6b7280" }}>
          Loading habits...
        </div>
      )}

      {/* List */}
      {!loading && (
        <>
          {habits.length === 0 ? (
            <EmptyState
              title="No habits yet"
              description="Create your first habit to start your streaks."
            />
          ) : (
            <div
              style={{
                display: "grid",
                gap: 12,
                gridTemplateColumns: "repeat(auto-fill, minmax(360px, 1fr))",
              }}
            >
              {habits.map((habit) => (
                <HabitCard
                  key={habit.id}
                  habit={habit}
                  onDone={onDoneClick}
                  onEdit={onEditClick}
                  onDelete={onDeleteClick}
                />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
