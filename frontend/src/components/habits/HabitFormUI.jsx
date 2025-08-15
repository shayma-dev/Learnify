// ==============================
// src/components/habits/HabitFormUI.jsx
// Modal form for add/edit with backend-aligned validation
// ==============================
import React, { useEffect, useState } from "react";

/*
Props:
- open: boolean
- mode: "add" | "edit"
- initialValues: { name: string, description: string, goal: number }
- errorText: string
- onClose: () => void
- onSubmit: (payload, { setSaving }) => Promise<void>
*/

export default function HabitFormUI({
  open = false,
  mode = "add",
  initialValues = { name: "", description: "", goal: 7 },
  errorText = "",
  onClose = () => {},
  onSubmit = async () => {},
}) {
  const [saving, setSaving] = useState(false);
  const [localError, setLocalError] = useState("");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [goal, setGoal] = useState(7);

  useEffect(() => {
    if (open) {
      setName(initialValues.name || "");
      setDescription(initialValues.description || "");
      setGoal(Number(initialValues.goal || 7));
      setLocalError("");
    }
  }, [open, initialValues]);

  if (!open) return null;

  const validateAndSubmit = async (e) => {
    e.preventDefault();
    setLocalError("");

    const nm = (name ?? "").trim();
    const desc = (description ?? "").trim();
    const gl = Number(goal);

    if (nm.length < 2 || nm.length > 60) {
      setLocalError("Name must be between 2 and 60 characters");
      return;
    }
    if (desc.length > 300) {
      setLocalError("Description must be at most 300 characters");
      return;
    }
    if (!Number.isInteger(gl) || gl < 1 || gl > 365) {
      setLocalError("Goal must be an integer between 1 and 365");
      return;
    }

    await onSubmit(
      { name: nm, description: desc, goal: gl },
      { setSaving }
    );
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.4)",
        display: "grid",
        placeItems: "center",
        zIndex: 1000,
        padding: 16,
      }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "100%",
          maxWidth: 520,
          background: "white",
          borderRadius: 12,
          border: "1px solid #e5e7eb",
          boxShadow: "0 20px 25px -5px rgba(0,0,0,0.1)",
          maxHeight: "90vh",
          display: "grid",
          gridTemplateRows: "auto 1fr auto",
        }}
      >
        {/* Header */}
        <div style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "16px 20px",
          borderBottom: "1px solid #e5e7eb",
        }}>
          <h2 style={{ margin: 0, fontSize: 18 }}>
            {mode === "add" ? "Create Habit" : "Edit Habit"}
          </h2>
          <button
            onClick={onClose}
            aria-label="Close"
            style={{
              background: "transparent",
              border: "none",
              fontSize: 24,
              cursor: "pointer",
              color: "#6b7280",
              lineHeight: 1,
            }}
          >
            ×
          </button>
        </div>

        {/* Form */}
        <form
          onSubmit={validateAndSubmit}
          style={{ padding: 20, display: "grid", gap: 16, overflow: "auto" }}
        >
          {(localError || errorText) && (
            <div
              role="alert"
              style={{
                color: "#dc2626",
                background: "#fef2f2",
                border: "1px solid #fecaca",
                borderRadius: 6,
                padding: 12,
                fontSize: 14,
              }}
            >
              {localError || errorText}
            </div>
          )}

          <label style={{ display: "grid", gap: 6 }}>
            <span style={{ fontSize: 14, fontWeight: 500, color: "#374151" }}>
              Name *
            </span>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Daily Reading"
              maxLength={60}
              style={{
                padding: "10px 12px",
                border: "1px solid #d1d5db",
                borderRadius: 6,
                fontSize: 14,
                outline: "none",
              }}
              onFocus={(e) => e.target.style.borderColor = "#3b82f6"}
              onBlur={(e) => e.target.style.borderColor = "#d1d5db"}
            />
            <div style={{ fontSize: 12, color: "#6b7280", textAlign: "right" }}>
              {name.length}/60
            </div>
          </label>

          <label style={{ display: "grid", gap: 6 }}>
            <span style={{ fontSize: 14, fontWeight: 500, color: "#374151" }}>
              Description (optional)
            </span>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Short description or notes..."
              maxLength={300}
              rows={5}
              style={{
                padding: "10px 12px",
                border: "1px solid #d1d5db",
                borderRadius: 6,
                fontSize: 14,
                resize: "vertical",
                outline: "none",
              }}
              onFocus={(e) => e.target.style.borderColor = "#3b82f6"}
              onBlur={(e) => e.target.style.borderColor = "#d1d5db"}
            />
            <div style={{ fontSize: 12, color: "#6b7280", textAlign: "right" }}>
              {description.length}/300
            </div>
          </label>

          <label style={{ display: "grid", gap: 6 }}>
            <span style={{ fontSize: 14, fontWeight: 500, color: "#374151" }}>
              Goal (days) *
            </span>
            <input
              type="number"
              value={goal}
              onChange={(e) => setGoal(parseInt(e.target.value || "0", 10))}
              min={1}
              max={365}
              step={1}
              placeholder="e.g., 21"
              style={{
                padding: "10px 12px",
                border: "1px solid #d1d5db",
                borderRadius: 6,
                fontSize: 14,
                outline: "none",
                width: 160,
              }}
              onFocus={(e) => e.target.style.borderColor = "#3b82f6"}
              onBlur={(e) => e.target.style.borderColor = "#d1d5db"}
            />
          </label>
        </form>

        {/* Footer */}
        <div style={{
          display: "flex",
          justifyContent: "flex-end",
          gap: 12,
          padding: "16px 20px",
          borderTop: "1px solid #e5e7eb",
        }}>
          <button
            type="button"
            onClick={onClose}
            style={{
              padding: "8px 16px",
              border: "1px solid #d1d5db",
              borderRadius: 6,
              background: "white",
              color: "#374151",
              cursor: "pointer",
            }}
          >
            Cancel
          </button>
          <button
            type="submit"
            onClick={validateAndSubmit}
            disabled={saving}
            style={{
              padding: "8px 16px",
              border: "none",
              borderRadius: 6,
              background: saving ? "#9ca3af" : "#111827",
              color: "white",
              cursor: saving ? "not-allowed" : "pointer",
              fontWeight: 500,
            }}
          >
            {saving ? "Saving..." : mode === "add" ? "Create Habit" : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
}