// ==============================
// src/pages/NoteKeeperPage.jsx
// Container: data fetching, filtering, search, CRUD operations
// ==============================
import React, { useCallback, useEffect, useMemo, useState } from "react";
import AppNav from "../components/common/AppNav";
import FocusAlarmWatcher from "../components/focus/FocusAlarmWatcher.jsx";
import NoteKeeperUI from "../components/notes/NoteKeeperUI";
import NoteFormUI from "../components/notes/NoteFormUI";
import NoteViewModal from "../components/notes/NoteViewModal";
import {
  getNotes as apiGetNotes,
  createNote as apiCreateNote,
  updateNote as apiUpdateNote,
  deleteNote as apiDeleteNote,
  getNotesApiError,
} from "../api/noteKeeperApi";

export default function NoteKeeperPage() {
  // Data state
  const [notes, setNotes] = useState([]);
  const [subjects, setSubjects] = useState([]);

  // UI state
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Filter & search state
  const [selectedSubject, setSelectedSubject] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  // Modal states
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [formMode, setFormMode] = useState("add"); // "add" | "edit"
  const [formError, setFormError] = useState("");
  const [editingNote, setEditingNote] = useState(null);
  const [viewingNote, setViewingNote] = useState(null);

  // Load notes and subjects
  const load = useCallback(async () => {
    setError("");
    setLoading(true);
    try {
      const data = await apiGetNotes();
      setNotes(data.notes || []);
      setSubjects(data.subjects || []);
    } catch (e) {
      setError(getNotesApiError(e));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  // Create subject map for deriving subject_name
  const subjectsMap = useMemo(() => {
    const map = new Map();
    subjects.forEach((s) => map.set(Number(s.id), s.name));
    return map;
  }, [subjects]);

  // Helper to ensure note has subject_name
  const enrichNote = (note) => {
    if (!note.subject_name && note.subject_id) {
      return {
        ...note,
        subject_name: subjectsMap.get(Number(note.subject_id)) || null,
      };
    }
    return note;
  };

  // Filtered and searched notes
  const filteredNotes = useMemo(() => {
    let filtered = [...notes];

    // Filter by subject
    if (selectedSubject !== "All") {
      const subjectId = Number(selectedSubject);
      filtered = filtered.filter(
        (note) => Number(note.subject_id) === subjectId
      );
    }

    // Search by title and content
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (note) =>
          note.title.toLowerCase().includes(query) ||
          note.content.toLowerCase().includes(query)
      );
    }

    return filtered;
  }, [notes, selectedSubject, searchQuery]);

  // Modal handlers
  const openAddModal = () => {
    setFormMode("add");
    setEditingNote(null);
    setFormError("");
    setFormModalOpen(true);
  };

  const openEditModal = (note) => {
    setFormMode("edit");
    setEditingNote(note);
    setFormError("");
    setFormModalOpen(true);
  };

  const closeFormModal = () => {
    setFormModalOpen(false);
    setEditingNote(null);
    setFormError("");
  };

  const openViewModal = (note) => {
    setViewingNote(enrichNote(note));
    setViewModalOpen(true);
  };

  const closeViewModal = () => {
    setViewModalOpen(false);
    setViewingNote(null);
  };

  // CRUD operations
  const handleCreate = async (values, { setSaving }) => {
    setFormError("");
    setSaving(true);
    try {
      const createdNote = await apiCreateNote(values);
      const enrichedNote = enrichNote(createdNote);
      setNotes((prev) => [enrichedNote, ...prev]);
      closeFormModal();
    } catch (e) {
      setFormError(getNotesApiError(e));
    } finally {
      setSaving(false);
    }
  };

  const handleUpdate = async (values, { setSaving }) => {
    if (!editingNote) return;
    setFormError("");
    setSaving(true);
    try {
      const updatedNote = await apiUpdateNote(editingNote.id, values);
      const enrichedNote = enrichNote(updatedNote);
      setNotes((prev) =>
        prev.map((note) => (note.id === editingNote.id ? enrichedNote : note))
      );
      closeFormModal();
      // Update viewing note if it's the same one being edited
      if (viewingNote && viewingNote.id === editingNote.id) {
        setViewingNote(enrichedNote);
      }
    } catch (e) {
      setFormError(getNotesApiError(e));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      "Delete this note? This action cannot be undone."
    );
    if (!confirmed) return;

    setError("");
    try {
      await apiDeleteNote(id);
      setNotes((prev) => prev.filter((note) => note.id !== id));
      // Close view modal if viewing the deleted note
      if (viewingNote && viewingNote.id === id) {
        closeViewModal();
      }
    } catch (e) {
      setError(getNotesApiError(e));
    }
  };

  // Form initial values
  const formInitialValues = useMemo(() => {
    if (!editingNote) {
      return {
        title: "",
        content: "",
        subject_id: subjects[0]?.id || "",
      };
    }
    return {
      title: editingNote.title,
      content: editingNote.content,
      subject_id: editingNote.subject_id,
    };
  }, [editingNote, subjects]);

  // Form submit handler
  const handleFormSubmit = async (values, helpers) => {
    if (formMode === "add") {
      await handleCreate(values, helpers);
    } else {
      await handleUpdate(values, helpers);
    }
  };

  return (
    <>
      <AppNav />
      <FocusAlarmWatcher />
      <NoteKeeperUI
        loading={loading}
        error={error}
        notes={filteredNotes}
        subjects={subjects}
        selectedSubject={selectedSubject}
        searchQuery={searchQuery}
        onSubjectSelect={setSelectedSubject}
        onSearchChange={setSearchQuery}
        onAddClick={openAddModal}
        onViewClick={openViewModal}
        onEditClick={openEditModal}
        onDeleteClick={handleDelete}
      />

      <NoteFormUI
        open={formModalOpen}
        mode={formMode}
        subjects={subjects}
        initialValues={formInitialValues}
        errorText={formError}
        onClose={closeFormModal}
        onSubmit={handleFormSubmit}
      />

      <NoteViewModal
        open={viewModalOpen}
        note={viewingNote}
        onClose={closeViewModal}
        onEdit={() => {
          closeViewModal();
          openEditModal(viewingNote);
        }}
        onDelete={() => handleDelete(viewingNote?.id)}
      />
    </>
  );
}
