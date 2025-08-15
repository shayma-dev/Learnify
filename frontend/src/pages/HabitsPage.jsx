// ==============================
// src/pages/HabitsPage.jsx
// Container: data fetching, filters, CRUD, mark-done, and modals
// ==============================
import React, { useCallback, useEffect, useMemo, useState } from "react";
import AppNav from "../components/common/AppNav";
import HabitsUI from "../components/habits/HabitsUI";
import HabitFormUI from "../components/habits/HabitFormUI";
import {
  getHabits as apiGetHabits,
  createHabit as apiCreateHabit,
  updateHabit as apiUpdateHabit,
  deleteHabit as apiDeleteHabit,
  markHabitDone as apiMarkHabitDone,
  getHabitsApiError,
} from "../api/habitsApi";

export default function HabitsPage() {
  // Data state
  const [habits, setHabits] = useState([]);

  // UI state
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Filter state: "All" | "Active" | "Completed"
  const [filter, setFilter] = useState("All");

  // Modal state
  const [formOpen, setFormOpen] = useState(false);
  const [formMode, setFormMode] = useState("add"); // "add" | "edit"
  const [formError, setFormError] = useState("");
  const [message, setMessage] = useState("");
  const [editingHabit, setEditingHabit] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await apiGetHabits();
      setHabits(data || []);
    } catch (e) {
      setError(getHabitsApiError(e));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  // Derived list: filter + "completed go down" while preserving server order
  const filteredHabits = useMemo(() => {
    const isCompleted = (h) => Number(h.current_streak) >= Number(h.goal);
    let list = habits.slice();

    if (filter === "Active") {
      list = list.filter((h) => !isCompleted(h));
    } else if (filter === "Completed") {
      list = list.filter((h) => isCompleted(h));
    }

    // For "All": Keep server order, but move completed to the bottom in their original order
    if (filter === "All") {
      const active = list.filter((h) => !isCompleted(h));
      const completed = list.filter((h) => isCompleted(h));
      return [...active, ...completed];
    }

    // For filtered sets, just return the server order of that subset
    return list;
  }, [habits, filter]);

  // Modal handlers
  const openAddModal = () => {
    setFormMode("add");
    setEditingHabit(null);
    setFormError("");
    setFormOpen(true);
  };

  const openEditModal = (habit) => {
    setFormMode("edit");
    setEditingHabit(habit);
    setFormError("");
    setFormOpen(true);
  };

  const closeFormModal = () => {
    setFormOpen(false);
    setEditingHabit(null);
    setFormError("");
  };

  // CRUD handlers
  const handleCreate = async (values, { setSaving }) => {
    setFormError("");
    setSaving(true);
    try {
      await apiCreateHabit(values);
      await load(); // refetch to reflect reset logic and ordering
      closeFormModal();
    } catch (e) {
      setFormError(getHabitsApiError(e));
    } finally {
      setSaving(false);
    }
  };

  const handleUpdate = async (values, { setSaving }) => {
    if (!editingHabit) return;
    setFormError("");
    setSaving(true);
    try {
      await apiUpdateHabit(editingHabit.id, values);
      await load();
      closeFormModal();
    } catch (e) {
      setFormError(getHabitsApiError(e));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      "Delete this habit? This action cannot be undone."
    );
    if (!confirmed) return;
    setError("");
    try {
      await apiDeleteHabit(id);
      await load();
    } catch (e) {
      setError(getHabitsApiError(e));
    }
  };

  const handleDone = async (id) => {
    setError("");
    setMessage(""); // Clear any existing message
    try {
      const res = await apiMarkHabitDone(id);
      // Show backend message in the UI
      if (res?.message) {
        setMessage(res.message);
        // Auto-clear message after 4 seconds
        setTimeout(() => setMessage(""), 4000);
      }
      // Refetch to reflect updated streaks and re-ordering
      await load();
    } catch (e) {
      const msg = getHabitsApiError(e);
      setError(msg); // Show errors in the error banner
    }
  };

  // Form initial values
  const formInitialValues = useMemo(() => {
    if (!editingHabit) {
      return { name: "", description: "", goal: 7 };
    }
    return {
      name: editingHabit.name || "",
      description: editingHabit.description || "",
      goal: Number(editingHabit.goal) || 7,
    };
  }, [editingHabit]);

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
      <HabitsUI
        loading={loading}
        error={error}
        message={message}
        habits={filteredHabits}
        filter={filter}
        onFilterChange={setFilter}
        onAddClick={openAddModal}
        onEditClick={openEditModal}
        onDeleteClick={handleDelete}
        onDoneClick={handleDone}
      />

      <HabitFormUI
        open={formOpen}
        mode={formMode}
        initialValues={formInitialValues}
        errorText={formError}
        onClose={closeFormModal}
        onSubmit={handleFormSubmit}
      />
    </>
  );
}
