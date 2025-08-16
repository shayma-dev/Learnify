// ==============================
// src/pages/StudyPlannerPage.jsx
// Container: data fetching, day selection, CRUD, optimistic updates
// ==============================
import React, { useCallback, useEffect, useMemo, useState } from "react";
import AppNav from "../components/common/AppNav";
import StudyPlannerUI from "../components/planner/StudyPlannerUI";
import SessionFormUI from "../components/planner/SessionFormUI";
import FocusAlarmWatcher from "../components/focus/FocusAlarmWatcher.jsx";
import {
  getPlanner as apiGetPlanner,
  createSession as apiCreateSession,
  updateSession as apiUpdateSession,
  deleteSession as apiDeleteSession,
  PLANNER_DAYS,
} from "../api/plannerApi";

function normalizeError(e) {
  return e?.response?.data?.error || e?.message || "Something went wrong";
}

function getTodayToken() {
  // JS: 0=Sun..6=Sat -> tokens: Mon..Sun
  const map = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const todayToken = map[new Date().getDay()];
  // Ensure token exists in PLANNER_DAYS
  return PLANNER_DAYS.includes(todayToken) ? todayToken : "Mon";
}

function toHHMM(t) {
  // Accepts "HH:mm" or "HH:mm:ss" -> returns "HH:mm"
  if (!t) return "";
  const [hh = "00", mm = "00"] = String(t).split(":");
  return `${hh.padStart(2, "0")}:${mm.padStart(2, "0")}`;
}

function minutesFromTime(t) {
  // Supports "HH:mm" and "HH:mm:ss"
  if (!t) return 0;
  const [hh = "0", mm = "0"] = String(t).split(":");
  return Number(hh) * 60 + Number(mm);
}

function sortSessions(list) {
  // earliest start first; if tie, earlier end first
  const arr = [...(list || [])];
  arr.sort((a, b) => {
    const sa = minutesFromTime(a.start_time);
    const sb = minutesFromTime(b.start_time);
    if (sa !== sb) return sa - sb;
    return minutesFromTime(a.end_time) - minutesFromTime(b.end_time);
  });
  return arr;
}

function ensureAllDays(obj) {
  const base = {};
  PLANNER_DAYS.forEach((d) => (base[d] = []));
  return { ...base, ...(obj || {}) };
}

export default function StudyPlannerPage() {
  // Data
  const [sessionsByDay, setSessionsByDay] = useState(ensureAllDays({}));
  const [subjects, setSubjects] = useState([]);

  // UI state
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState("add"); // "add" | "edit"
  const [formError, setFormError] = useState("");
  const [editingSession, setEditingSession] = useState(null);

  // Selection
  const [selectedDay, setSelectedDay] = useState(getTodayToken());

  const load = useCallback(async () => {
    setError("");
    setLoading(true);
    try {
      const data = await apiGetPlanner();
      setSessionsByDay(ensureAllDays(data.sessionsByDay));
      setSubjects(data.subjects || []);
    } catch (e) {
      setError(normalizeError(e));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const sessionsForDay = useMemo(() => {
    const list = sessionsByDay[selectedDay] || [];
    return sortSessions(list);
  }, [sessionsByDay, selectedDay]);

  // Modal controls
  const openAddModal = () => {
    setModalMode("add");
    setEditingSession(null);
    setFormError("");
    setModalOpen(true);
  };

  const openEditModal = (session) => {
    setModalMode("edit");
    setEditingSession(session);
    setFormError("");
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingSession(null);
    setFormError("");
  };

  // Create session
  const handleCreate = async (values, { setSaving }) => {
    // values: { day, subject_id, start_time, end_time }
    setFormError("");
    setSaving(true);
    try {
      const created = await apiCreateSession(values);
      const day = created.day;
      setSessionsByDay((prev) => {
        const next = ensureAllDays(prev);
        const updated = [...(next[day] || []), created];
        next[day] = sortSessions(updated);
        return { ...next };
      });
      // If created for another day, optionally switch? We'll keep current day.
      closeModal();
    } catch (e) {
      setFormError(normalizeError(e));
    } finally {
      setSaving(false);
    }
  };

  // Update session
  const handleUpdate = async (values, { setSaving }) => {
    if (!editingSession) return;
    setFormError("");
    setSaving(true);
    try {
      const updated = await apiUpdateSession(editingSession.id, values);
      const oldDay = editingSession.day;
      const newDay = updated.day;

      setSessionsByDay((prev) => {
        const next = ensureAllDays(prev);

        // Remove from old day
        next[oldDay] = (next[oldDay] || []).filter(
          (s) => s.id !== editingSession.id
        );

        // Add to new day
        next[newDay] = sortSessions([...(next[newDay] || []), updated]);

        return { ...next };
      });

      closeModal();
    } catch (e) {
      setFormError(normalizeError(e));
    } finally {
      setSaving(false);
    }
  };

  // Delete session
  const handleDelete = async (id) => {
    const ok = window.confirm("Delete this session?");
    if (!ok) return;
    setError("");
    try {
      await apiDeleteSession(id);
      setSessionsByDay((prev) => {
        const next = ensureAllDays(prev);
        PLANNER_DAYS.forEach((d) => {
          next[d] = (next[d] || []).filter((s) => s.id !== id);
        });
        return { ...next };
      });
    } catch (e) {
      setError(normalizeError(e));
    }
  };

  // Modal initial values
  const modalInitial = useMemo(() => {
    if (!editingSession) {
      return {
        day: selectedDay,
        subject_id: subjects[0]?.id || "",
        start_time: "",
        end_time: "",
      };
    }
    return {
      day: editingSession.day,
      subject_id: editingSession.subject_id,
      start_time: toHHMM(editingSession.start_time),
      end_time: toHHMM(editingSession.end_time),
    };
  }, [editingSession, selectedDay, subjects]);

  // Submit handler passed to modal
  const handleSubmitForm = async (values, helpers) => {
    if (modalMode === "add") {
      await handleCreate(values, helpers);
    } else {
      await handleUpdate(values, helpers);
    }
  };

  return (
    <>
      <AppNav />
      <FocusAlarmWatcher />

      {/* Main UI component */}
      <StudyPlannerUI
        loading={loading}
        error={error}
        days={PLANNER_DAYS}
        selectedDay={selectedDay}
        onSelectDay={setSelectedDay}
        sessions={sessionsForDay}
        subjects={subjects}
        onAddClick={openAddModal}
        onEditClick={openEditModal}
        onDeleteClick={handleDelete}
      />

      <SessionFormUI
        open={modalOpen}
        mode={modalMode}
        days={PLANNER_DAYS}
        subjects={subjects}
        initialValues={modalInitial}
        errorText={formError}
        onClose={closeModal}
        onSubmit={handleSubmitForm}
      />
    </>
  );
}
