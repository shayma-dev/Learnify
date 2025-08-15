// ==============================
// src/components/notes/NoteKeeperUI.jsx
// Presentational UI with props contract
// ==============================
import React from "react";

/*
Props contract:
- loading: boolean
- error: string
- notes: Array<{
    id: number|string,
    title: string,
    content: string,
    subject_id: number|string,
    subject_name: string|null,
    created_at: string (ISO),
    user_id: number
  }>
- subjects: Array<{ id: number|string, name: string, user_id: number }>
- selectedSubject: string ("All" | subject_id as string)
- searchQuery: string
- onSubjectSelect: (subjectId: string) => void
- onSearchChange: (query: string) => void
- onAddClick: () => void
- onViewClick: (note) => void
- onEditClick: (note) => void
- onDeleteClick: (id: number|string) => void
*/

// Utility functions
function relativeTime(isoString) {
  if (!isoString) return "";
  const now = new Date();
  const date = new Date(isoString);
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMins < 1) return "now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
  });
}

function stripMarkdownForPreview(markdown, maxLength = 180) {
  if (!markdown) return "";
  // Simple markdown stripping - remove common syntax
  const stripped = markdown
    .replace(/#{1,6}\s+/g, "") // headers
    .replace(/\*\*(.*?)\*\*/g, "$1") // bold
    .replace(/\*(.*?)\*/g, "$1") // italic
    .replace(/`(.*?)`/g, "$1") // inline code
    .replace(/```[\s\S]*?```/g, "[code block]") // code blocks
    .replace(/^\s*[-*+]\s+/gm, "• ") // lists
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1") // links
    .replace(/\n+/g, " ") // newlines to spaces
    .trim();

  if (stripped.length <= maxLength) return stripped;
  return stripped.slice(0, maxLength).trim() + "...";
}

function subjectInitials(name) {
  if (!name) return "??";
  const words = name.trim().split(/\s+/);
  if (words.length === 1) {
    return words[0].slice(0, 2).toUpperCase();
  }
  return words
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
}

function subjectColor(subjectId) {
  const colors = [
    { bg: "#E5F0FF", border: "#B3D4FF", text: "#1E40AF" }, // blue
    { bg: "#EAF7EE", border: "#B3E5C1", text: "#166534" }, // green
    { bg: "#FFF4E5", border: "#FFD6B3", text: "#C2410C" }, // orange
    { bg: "#F3E8FF", border: "#D8B4FE", text: "#7C3AED" }, // purple
    { bg: "#FFE5EC", border: "#FFADC2", text: "#BE185D" }, // pink
    { bg: "#E6FFFA", border: "#99F6E4", text: "#0F766E" }, // teal
  ];

  const index = parseInt(subjectId, 10) % colors.length;
  return colors[index];
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
      <div style={{ fontSize: 48, marginBottom: 16 }}>📝</div>
      <h3 style={{ margin: "0 0 8px 0", color: "#374151" }}>{title}</h3>
      <p style={{ margin: 0, fontSize: 14 }}>{description}</p>
    </div>
  );
}

function NoteCard({ note, onView, onEdit, onDelete }) {
  const colorScheme = subjectColor(note.subject_id);
  const initials = subjectInitials(note.subject_name);
  const preview = stripMarkdownForPreview(note.content);
  const timeAgo = relativeTime(note.created_at);

  return (
    <div
      onClick={() => onView(note)}
      style={{
        display: "grid",
        gridTemplateColumns: "auto 1fr auto",
        gap: 12,
        padding: 16,
        background: "white",
        border: "1px solid #e5e7eb",
        borderRadius: 12,
        borderLeft: `4px solid ${colorScheme.border}`,
        cursor: "pointer",
        transition: "all 0.2s ease",
      }}
      onMouseEnter={(e) => {
        e.target.style.background = "#f9fafb";
        e.target.style.boxShadow = "0 2px 8px rgba(0,0,0,0.1)";
      }}
      onMouseLeave={(e) => {
        e.target.style.background = "white";
        e.target.style.boxShadow = "none";
      }}
    >
      {/* Subject initials block */}
      <div
        style={{
          width: 44,
          height: 44,
          borderRadius: 8,
          background: colorScheme.bg,
          border: `1px solid ${colorScheme.border}`,
          display: "grid",
          placeItems: "center",
          fontSize: 12,
          fontWeight: 600,
          color: colorScheme.text,
          flexShrink: 0,
        }}
      >
        {initials}
      </div>

      {/* Content */}
      <div style={{ minWidth: 0 }}>
        {/* Subject + Time */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            marginBottom: 4,
          }}
        >
          <span
            style={{
              fontSize: 11,
              fontWeight: 500,
              color: colorScheme.text,
              background: colorScheme.bg,
              padding: "2px 6px",
              borderRadius: 12,
              border: `1px solid ${colorScheme.border}`,
            }}
          >
            {note.subject_name || "Unknown"}
          </span>
          <span style={{ fontSize: 11, color: "#9ca3af" }}>{timeAgo}</span>
        </div>

        {/* Title */}
        <h3
          style={{
            margin: "0 0 4px 0",
            fontSize: 15,
            fontWeight: 500,
            color: "#111827",
            lineHeight: 1.4,
          }}
        >
          {note.title}
        </h3>

        {/* Preview */}
        <p
          style={{
            margin: 0,
            fontSize: 13,
            color: "#6b7280",
            lineHeight: 1.4,
            overflow: "hidden",
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
          }}
        >
          {preview}
        </p>
      </div>

      {/* Actions */}
      <div
        style={{ display: "flex", gap: 4, alignItems: "flex-start" }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={() => onEdit(note)}
          title="Edit note"
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
          onClick={() => onDelete(note.id)}
          title="Delete note"
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
  );
}

export default function NoteKeeperUI({
  loading = false,
  error = "",
  notes = [],
  subjects = [],
  selectedSubject = "All",
  searchQuery = "",
  onSubjectSelect = () => {},
  onSearchChange = () => {},
  onAddClick = () => {},
  onViewClick = () => {},
  onEditClick = () => {},
  onDeleteClick = () => {},
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
        <h1 style={{ margin: 0 }}>Note Keeper</h1>
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
          Add Note
        </button>
      </div>

      {/* Subject filters */}
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
        <button
          onClick={() => onSubjectSelect("All")}
          style={{
            padding: "6px 12px",
            borderRadius: 16,
            border: "1px solid #e5e7eb",
            background: selectedSubject === "All" ? "#111827" : "white",
            color: selectedSubject === "All" ? "white" : "#111827",
            cursor: "pointer",
            whiteSpace: "nowrap",
          }}
        >
          All
        </button>
        {subjects
          .slice()
          .sort((a, b) => a.name.localeCompare(b.name))
          .map((subject) => {
            const isActive = selectedSubject === String(subject.id);
            return (
              <button
                key={subject.id}
                onClick={() => onSubjectSelect(String(subject.id))}
                style={{
                  padding: "6px 12px",
                  borderRadius: 16,
                  border: "1px solid #e5e7eb",
                  background: isActive ? "#111827" : "white",
                  color: isActive ? "white" : "#111827",
                  cursor: "pointer",
                  whiteSpace: "nowrap",
                }}
              >
                {subject.name}
              </button>
            );
          })}
      </div>

      {/* Search */}
      <div style={{ marginBottom: 24 }}>
        <input
          type="text"
          placeholder="Search notes by title or content..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          style={{
            width: "100%",
            maxWidth: 400,
            padding: "10px 14px",
            border: "1px solid #d1d5db",
            borderRadius: 20,
            fontSize: 14,
            outline: "none",
          }}
          onFocus={(e) => {
            e.target.style.borderColor = "#3b82f6";
            e.target.style.boxShadow = "0 0 0 3px rgba(59,130,246,0.1)";
          }}
          onBlur={(e) => {
            e.target.style.borderColor = "#d1d5db";
            e.target.style.boxShadow = "none";
          }}
        />
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

      {/* Loading */}
      {loading && (
        <div style={{ textAlign: "center", padding: 48, color: "#6b7280" }}>
          Loading notes...
        </div>
      )}

      {/* Notes list */}
      {!loading && (
        <>
          {notes.length === 0 ? (
            searchQuery.trim() ? (
              <EmptyState
                title="No notes found"
                description={`No notes match "${searchQuery}". Try adjusting your search or create a new note.`}
              />
            ) : selectedSubject !== "All" ? (
              <EmptyState
                title="No notes in this subject"
                description="Create your first note for this subject to get started."
              />
            ) : (
              <EmptyState
                title="No notes yet"
                description="Create your first note to start building your knowledge base."
              />
            )
          ) : (
            <div
              style={{
                display: "grid",
                gap: 12,
                gridTemplateColumns: "repeat(auto-fill, minmax(400px, 1fr))",
              }}
            >
              {notes.map((note) => (
                <NoteCard
                  key={note.id}
                  note={note}
                  onView={onViewClick}
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
