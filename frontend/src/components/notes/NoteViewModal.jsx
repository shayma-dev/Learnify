// ==============================
// src/components/notes/NoteViewModal.jsx
// Modal for viewing notes with markdown rendering
// ==============================
import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import "highlight.js/styles/github.css"; // You'll need to import this CSS

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

export default function NoteViewModal({
  open = false,
  note = null,
  onClose = () => {},
  onEdit = () => {},
  onDelete = () => {},
}) {
  if (!open || !note) return null;

  const timeAgo = relativeTime(note.created_at);

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
          maxHeight: "90vh",
          background: "white",
          borderRadius: 12,
          border: "1px solid #e5e7eb",
          boxShadow: "0 20px 25px -5px rgba(0,0,0,0.1)",
          display: "grid",
          gridTemplateRows: "auto 1fr auto",
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: "20px 24px",
            borderBottom: "1px solid #e5e7eb",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              gap: 16,
            }}
          >
            <div style={{ flex: 1 }}>
              <h1
                style={{
                  margin: "0 0 8px 0",
                  fontSize: 24,
                  fontWeight: 600,
                  color: "#111827",
                  lineHeight: 1.3,
                }}
              >
                {note.title}
              </h1>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  color: "#6b7280",
                  fontSize: 14,
                }}
              >
                <span
                  style={{
                    background: "#f3f4f6",
                    padding: "4px 8px",
                    borderRadius: 12,
                    fontSize: 12,
                    fontWeight: 500,
                  }}
                >
                  {note.subject_name || "Unknown Subject"}
                </span>
                <span>{timeAgo}</span>
              </div>
            </div>

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
                padding: 4,
              }}
            >
              ×
            </button>
          </div>
        </div>

        {/* Content */}
        <div
          style={{
            padding: "24px",
            overflow: "auto",
            lineHeight: 1.7,
          }}
        >
          <div
            style={{
              maxWidth: "none",
              color: "#374151",
            }}
          >
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              rehypePlugins={[rehypeHighlight]}
              components={{
                h1: ({ children }) => (
                  <h1
                    style={{
                      fontSize: 28,
                      fontWeight: 700,
                      marginBottom: 16,
                      color: "#111827",
                      borderBottom: "2px solid #e5e7eb",
                      paddingBottom: 8,
                    }}
                  >
                    {children}
                  </h1>
                ),
                h2: ({ children }) => (
                  <h2
                    style={{
                      fontSize: 24,
                      fontWeight: 600,
                      margin: "32px 0 16px 0",
                      color: "#111827",
                    }}
                  >
                    {children}
                  </h2>
                ),
                h3: ({ children }) => (
                  <h3
                    style={{
                      fontSize: 20,
                      fontWeight: 600,
                      margin: "24px 0 12px 0",
                      color: "#111827",
                    }}
                  >
                    {children}
                  </h3>
                ),
                p: ({ children }) => (
                  <p style={{ marginBottom: 16 }}>{children}</p>
                ),
                code: ({ inline, children }) => (
                  <code
                    style={{
                      background: inline ? "#f1f5f9" : "transparent",
                      padding: inline ? "2px 4px" : 0,
                      borderRadius: inline ? 3 : 0,
                      fontSize: "0.9em",
                      fontFamily:
                        "ui-monospace, SFMono-Regular, Consolas, monospace",
                    }}
                  >
                    {children}
                  </code>
                ),
                pre: ({ children }) => (
                  <pre
                    style={{
                      background: "#f8fafc",
                      border: "1px solid #e2e8f0",
                      borderRadius: 8,
                      padding: 16,
                      overflow: "auto",
                      marginBottom: 16,
                      fontSize: "0.9em",
                    }}
                  >
                    {children}
                  </pre>
                ),
                blockquote: ({ children }) => (
                  <blockquote
                    style={{
                      borderLeft: "4px solid #e5e7eb",
                      paddingLeft: 16,
                      margin: "16px 0",
                      color: "#6b7280",
                      fontStyle: "italic",
                    }}
                  >
                    {children}
                  </blockquote>
                ),
                ul: ({ children }) => (
                  <ul style={{ paddingLeft: 20, marginBottom: 16 }}>
                    {children}
                  </ul>
                ),
                ol: ({ children }) => (
                  <ol style={{ paddingLeft: 20, marginBottom: 16 }}>
                    {children}
                  </ol>
                ),
                li: ({ children }) => (
                  <li style={{ marginBottom: 4 }}>{children}</li>
                ),
              }}
            >
              {note.content}
            </ReactMarkdown>
          </div>
        </div>

        {/* Footer */}
        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            gap: 12,
            padding: "16px 24px",
            borderTop: "1px solid #e5e7eb",
          }}
        >
          <button
            onClick={onEdit}
            style={{
              padding: "8px 16px",
              border: "1px solid #d1d5db",
              borderRadius: 6,
              background: "white",
              color: "#374151",
              cursor: "pointer",
              fontWeight: 500,
            }}
          >
            Edit
          </button>
          <button
            onClick={onDelete}
            style={{
              padding: "8px 16px",
              border: "1px solid #dc2626",
              borderRadius: 6,
              background: "#dc2626",
              color: "white",
              cursor: "pointer",
              fontWeight: 500,
            }}
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
