import api from "./axiosInstance";

function autoTimezone() {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
  } catch {
    return "UTC";
  }
}

/**
 * GET /api/sessions/summary?tz=Area/City
 * Returns data as sent by the backend:
 * {
 *   subjects: [{ id, name, user_id }],
 *   todaySessions: [{ name, duration: string|number }],
 *   totalFocus: [{ subject_name: string, total_focus: string|number }],
 *   todayTotal: number,
 *   todaySessionsCount: number
 * }
 */
export async function getFocusSummary({ tz } = {}) {
  const params = { tz: tz || autoTimezone() };
  const { data } = await api.get("/sessions/summary", { params });
  return data;
}

/**
 * POST /api/sessions
 * Body: { subject_id, duration } // duration in minutes
 * Relies on server-side validation (1..720).
 * Returns the inserted row from the backend.
 */
export async function createFocusSession({ subject_id, duration }) {
  const { data } = await api.post("/sessions", { subject_id, duration });
  return data;
}

/**
 * Prefer backend-provided messages when available.
 */
export function getFocusApiError(err) {
  return (
    err?.response?.data?.error ||
    err?.response?.data?.message ||
    err?.message ||
    "Something went wrong"
  );
}

/**
 * Optional: normalize numeric fields for UI math without changing API contract.
 * Usage: const s = normalizeFocusSummary(rawSummary);
 */
export function normalizeFocusSummary(raw) {
  if (!raw || typeof raw !== "object") {
    return {
      subjects: [],
      todaySessions: [],
      totalFocus: [],
      todayTotal: 0,
      todaySessionsCount: 0,
    };
  }

  const subjects = Array.isArray(raw.subjects) ? raw.subjects : [];

  const todaySessions = Array.isArray(raw.todaySessions)
    ? raw.todaySessions.map((r) => ({
        name: r.name,
        duration: Number(r.duration) || 0,
      }))
    : [];

  const totalFocus = Array.isArray(raw.totalFocus)
    ? raw.totalFocus.map((r) => ({
        subject_name: r.subject_name,
        total_focus: Number(r.total_focus) || 0,
      }))
    : [];

  return {
    subjects,
    todaySessions,
    totalFocus,
    todayTotal: Number(raw.todayTotal) || 0,
    todaySessionsCount: Number(raw.todaySessionsCount) || 0,
  };
}
