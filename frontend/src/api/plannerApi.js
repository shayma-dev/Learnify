import api from "./axiosInstance";

/**
 * Study Planner API
 * Base path: /api/planner
 *
 * Error handling:
 * - On failure, axios will throw. Callers can read:
 *   err.response?.data?.error || err.message
 */

/**
 * GET /api/planner
 * Response:
 * {
 *   sessionsByDay: {
 *     Mon: Array<SessionWithSubject>,
 *     Tue: Array<SessionWithSubject>,
 *     Wed: Array<SessionWithSubject>,
 *     Thu: Array<SessionWithSubject>,
 *     Fri: Array<SessionWithSubject>,
 *     Sat: Array<SessionWithSubject>,
 *     Sun: Array<SessionWithSubject>,
 *   },
 *   subjects: Array<{ id: number, name: string, user_id: number }>
 * }
 *
 * SessionWithSubject:
 * {
 *   id: number,
 *   day: "Mon"|"Tue"|"Wed"|"Thu"|"Fri"|"Sat"|"Sun",
 *   start_time: "HH:mm:ss",
 *   end_time: "HH:mm:ss",
 *   subject_id: number,
 *   subject: string // subject name
 * }
 */
export async function getPlanner() {
  const res = await api.get("/planner");
  return res.data;
}

/**
 * POST /api/planner
 * Payload:
 * {
 *   day: "Mon"|"Tue"|"Wed"|"Thu"|"Fri"|"Sat"|"Sun",
 *   subject_id: number,
 *   start_time: "HH:mm" | "HH:mm:ss",
 *   end_time: "HH:mm" | "HH:mm:ss"
 * }
 *
 * Response (inserted row from sessions_planner):
 * {
 *   id: number,
 *   user_id: number,
 *   subject_id: number,
 *   day: string,
 *   start_time: "HH:mm:ss",
 *   end_time: "HH:mm:ss"
 * }
 */
export async function createSession(payload) {
  const res = await api.post("/planner", payload);
  return res.data;
}

/**
 * PUT /api/planner/:id
 * Payload: same as createSession
 * Response: updated row (same shape as createSession response)
 */
export async function updateSession(id, payload) {
  const res = await api.put(`/planner/${id}`, payload);
  return res.data;
}

/**
 * DELETE /api/planner/:id
 * Response:
 * { message: "session deleted successfully" }
 */
export async function deleteSession(id) {
  const res = await api.delete(`/planner/${id}`);
  return res.data;
}

/**
 * helper: Days of week used by the API.
 */
export const PLANNER_DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];