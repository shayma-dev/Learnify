import api from "./axiosInstance";

/*
Habits API
Base path mounted on server: /api/habits
axiosInstance baseURL is "/api", so endpoints use "/habits".

Data shapes
- Habit row: {
    id, user_id, name, description, goal, current_streak,
    last_completed (YYYY-MM-DD string or null), created_at (ISO string)
  }

Endpoints
- GET /habits?tz=Area/City -> Habit[]
- POST /habits -> create habit. Body: { name, description, goal }. Returns Habit
- PUT /habits/:id -> update habit. Body: { name, description, goal }. Returns Habit
- PATCH /habits/:id/done?tz=Area/City -> Returns:
    { message } OR
    { message, current_streak, last_completed, goal }
- DELETE /habits/:id -> { message }
*/

function clientTimezone() {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone;
  } catch {
    return undefined;
  }
}

export async function getHabits() {
  const tz = clientTimezone();
  const res = await api.get("/habits", { params: tz ? { tz } : {} });
  return res.data;
}

export async function createHabit(payload) {
  // payload: { name, description, goal }
  const res = await api.post("/habits", payload);
  return res.data;
}

export async function updateHabit(id, payload) {
  // payload: { name, description, goal }
  const res = await api.put(`/habits/${id}`, payload);
  return res.data;
}

export async function markHabitDone(id) {
  const tz = clientTimezone();
  const res = await api.patch(`/habits/${id}/done`, null, {
    params: tz ? { tz } : {},
  });
  return res.data;
}

export async function deleteHabit(id) {
  const res = await api.delete(`/habits/${id}`);
  return res.data;
}

// Normalize axios errors for UI display
export function getHabitsApiError(err) {
  return (
    err?.response?.data?.error ||
    err?.response?.data?.message ||
    err?.message ||
    "Something went wrong"
  );
}