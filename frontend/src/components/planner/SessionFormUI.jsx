// ==============================
// src/components/planner/SessionFormUI.jsx
// Modal form for Add/Edit session
// ==============================
import React, { useEffect, useState } from "react";

function minutesFromTime(t) {
  if (!t) return 0;
  const [hh = "0", mm = "0"] = String(t).split(":");
  return Number(hh) * 60 + Number(mm);
}

export default function SessionFormUI({
  open = false,
  mode = "add", // "add" | "edit"
  days = [],
  subjects = [],
  initialValues = { day: "Mon", subject_id: "", start_time: "", end_time: "" }, // times "HH:mm"
  errorText = "",
  onClose = () => {},
  onSubmit = () => {},
}) {
  const [saving, setSaving] = useState(false);
  const [localError, setLocalError] = useState("");

  const [day, setDay] = useState(initialValues.day || "Mon");
  const [subjectId, setSubjectId] = useState(
    initialValues.subject_id || subjects[0]?.id || ""
  );
  const [startTime, setStartTime] = useState(initialValues.start_time || "");
  const [endTime, setEndTime] = useState(initialValues.end_time || "");

  useEffect(() => {
    if (open) {
      setDay(initialValues.day || "Mon");
      setSubjectId(initialValues.subject_id || subjects[0]?.id || "");
      setStartTime(initialValues.start_time || "");
      setEndTime(initialValues.end_time || "");
      setLocalError("");
    }
  }, [open, initialValues, subjects]);

  if (!open) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError("");
    if (!startTime || !endTime) {
      setLocalError("Start and end times are required.");
      return;
    }
    if (minutesFromTime(endTime) <= minutesFromTime(startTime)) {
      setLocalError("End time must be after start time.");
      return;
    }

    const payload = {
      day,
      subject_id: Number(subjectId),
      start_time: startTime, // backend accepts "HH:mm"
      end_time: endTime,
    };

    await onSubmit(payload, { setSaving });
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.35)",
        display: "grid",
        placeItems: "center",
        zIndex: 1000,
      }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "100%",
          maxWidth: 480,
          background: "white",
          borderRadius: 12,
          border: "1px solid #e5e7eb",
          padding: 16,
          boxShadow: "0 10px 30px rgba(0,0,0,0.15)",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <h2 style={{ margin: 0 }}>
            {mode === "add" ? "Add Session" : "Edit Session"}
          </h2>
          <button
            onClick={onClose}
            aria-label="Close"
            style={{
              background: "transparent",
              border: "none",
              fontSize: 20,
              cursor: "pointer",
              lineHeight: 1,
            }}
          >
            ×
          </button>
        </div>

        {(localError || errorText) && (
          <div
            role="status"
            aria-live="polite"
            style={{ color: "crimson", marginTop: 10 }}
          >
            {localError || errorText}
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          style={{ display: "grid", gap: 10, marginTop: 12 }}
        >
          <div
            style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}
          >
            <label style={{ display: "grid", gap: 6 }}>
              <span style={{ fontSize: 12, color: "#6b7280" }}>Day</span>
              <select
                required
                value={day}
                onChange={(e) => setDay(e.target.value)}
                style={{
                  padding: "8px 10px",
                  border: "1px solid #e5e7eb",
                  borderRadius: 6,
                }}
              >
                {days.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </label>

            <label style={{ display: "grid", gap: 6 }}>
              <span style={{ fontSize: 12, color: "#6b7280" }}>Subject</span>
              <select
                required
                value={subjectId}
                onChange={(e) => setSubjectId(e.target.value)}
                style={{
                  padding: "8px 10px",
                  border: "1px solid #e5e7eb",
                  borderRadius: 6,
                }}
              >
                {subjects.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div
            style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}
          >
            <label style={{ display: "grid", gap: 6 }}>
              <span style={{ fontSize: 12, color: "#6b7280" }}>Start time</span>
              <input
                required
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                style={{
                  padding: "8px 10px",
                  border: "1px solid #e5e7eb",
                  borderRadius: 6,
                }}
              />
            </label>

            <label style={{ display: "grid", gap: 6 }}>
              <span style={{ fontSize: 12, color: "#6b7280" }}>End time</span>
              <input
                required
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                style={{
                  padding: "8px 10px",
                  border: "1px solid #e5e7eb",
                  borderRadius: 6,
                }}
              />
            </label>
          </div>

          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              gap: 8,
              marginTop: 8,
            }}
          >
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: "8px 12px",
                border: "1px solid #e5e7eb",
                borderRadius: 6,
                background: "white",
                cursor: "pointer",
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              style={{
                padding: "8px 12px",
                border: "1px solid #111827",
                borderRadius: 6,
                background: "#111827",
                color: "white",
                cursor: "pointer",
                opacity: saving ? 0.8 : 1,
              }}
            >
              {saving
                ? "Saving…"
                : mode === "add"
                ? "Add Session"
                : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
