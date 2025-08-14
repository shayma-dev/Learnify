// ==============================
// src/components/notes/NoteFormUI.jsx
// Modal form for add/edit note with validation
// ==============================
import React, { useEffect, useState } from "react";

export default function NoteFormUI({
  open = false,
  mode = "add", // "add" | "edit"
  subjects = [],
  initialValues = { title: "", content: "", subject_id: "" },
  errorText = "",
  onClose = () => {},
  onSubmit = () => {},
}) {
  const [saving, setSaving] = useState(false);
  const [localError, setLocalError] = useState("");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [subjectId, setSubjectId] = useState("");

  // Reset form when modal opens/closes or initial values change
  useEffect(() => {
    if (open) {
      setTitle(initialValues.title || "");
      setContent(initialValues.content || "");
      setSubjectId(initialValues.subject_id || subjects[0]?.id || "");
      setLocalError("");
    }
  }, [open, initialValues, subjects]);

  if (!open) return null;

  const validateAndSubmit = async (e) => {
    e.preventDefault();
    setLocalError("");

    // Client-side validation
    if (title.length < 3) {
      setLocalError("Title must be at least 3 characters long");
      return;
    }
    if (title.length > 120) {
      setLocalError("Title must be less than 120 characters");
      return;
    }
    if (!content.trim()) {
      setLocalError("Content is required");
      return;
    }
    if (content.length > 12000) {
      setLocalError("Content is too long (maximum 12,000 characters)");
      return;
    }
    if (!subjectId) {
      setLocalError("Please select a subject");
      return;
    }

    const payload = {
      title: title.trim(),
      content: content.trim(),
      subject_id: Number(subjectId),
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
          maxWidth: 1000,
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
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "16px 20px",
            borderBottom: "1px solid #e5e7eb",
          }}
        >
          <h2 style={{ margin: 0, fontSize: 18 }}>
            {mode === "add" ? "Create New Note" : "Edit Note"}
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
          style={{
            padding: 20,
            display: "grid",
            gap: 16,
            overflow: "auto",
          }}
        >
          {/* Error display */}
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

          {/* Title and Subject row */}
          <div
            style={{
              display: "col",
              gridTemplateColumns: "2fr 1fr",
              gap: 16,
            }}
          >
            <label style={{ display: "grid", gap: 6 }}>
              <span style={{ fontSize: 14, fontWeight: 500, color: "#374151" }}>
                Title *
              </span>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter note title"
                maxLength={120}
                style={{
                  padding: "10px 12px",
                  border: "1px solid #d1d5db",
                  borderRadius: 6,
                  fontSize: 14,
                  outline: "none",
                }}
                onFocus={(e) => (e.target.style.borderColor = "#3b82f6")}
                onBlur={(e) => (e.target.style.borderColor = "#d1d5db")}
              />
              <div
                style={{ fontSize: 12, color: "#6b7280", textAlign: "right" }}
              >
                {title.length}/120
              </div>
            </label>

            <label style={{ display: "grid", gap: 6 }}>
              <span style={{ fontSize: 14, fontWeight: 500, color: "#374151" }}>
                Subject *
              </span>
              <select
                value={subjectId}
                onChange={(e) => setSubjectId(e.target.value)}
                maxLength={20}
                style={{
                  padding: "10px 12px",
                  border: "1px solid #d1d5db",
                  borderRadius: 6,
                  fontSize: 14,
                  outline: "none",
                  background: "white",
                }}
                onFocus={(e) => (e.target.style.borderColor = "#3b82f6")}
                onBlur={(e) => (e.target.style.borderColor = "#d1d5db")}
              >
                {subjects.map((subject) => (
                  <option key={subject.id} value={subject.id}>
                    {subject.name}
                  </option>
                ))}
              </select>
            </label>
          </div>

          {/* Content */}
          <label style={{ display: "grid", gap: 6 }}>
            <span style={{ fontSize: 14, fontWeight: 500, color: "#374151" }}>
              Content * (Markdown supported)
            </span>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Write your note content here. You can use Markdown formatting..."
              rows={12}
              maxLength={12000}
              style={{
                padding: "12px",
                border: "1px solid #d1d5db",
                borderRadius: 6,
                fontSize: 14,
                fontFamily: "ui-monospace, SFMono-Regular, Consolas, monospace",
                lineHeight: 1.5,
                resize: "vertical",
                outline: "none",
              }}
              onFocus={(e) => (e.target.style.borderColor = "#3b82f6")}
              onBlur={(e) => (e.target.style.borderColor = "#d1d5db")}
            />
            <div style={{ fontSize: 12, color: "#6b7280", textAlign: "right" }}>
              {content.length}/12,000 characters
            </div>
          </label>
        </form>

        {/* Footer */}
        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            gap: 12,
            padding: "16px 20px",
            borderTop: "1px solid #e5e7eb",
          }}
        >
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
            {saving
              ? "Saving..."
              : mode === "add"
              ? "Create Note"
              : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
}
