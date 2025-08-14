import api from "./axiosInstance";

/*
Note Keeper API
Base path mounted on server: /api/notes
axiosInstance is assumed to have baseURL "/api", so endpoints here use "/notes".

Error handling:
- On failure, axios throws. In consumers, read:
  err.response?.data?.error || err.message

Shapes:
- GET /notes -> { subjects: Array<{ id, name, user_id }>, notes: Array<{
    id, title, content, subject_id, user_id, created_at (ISO string), subject_name (string|null)
  }> }

- POST /notes
  Payload: { title: string, content: string, subject_id: number }
  Response: { message: "Note created" }

- PUT /notes/:id
  Payload: { title: string, content: string, subject_id: number }
  Response: { message: "Note updated" }

- DELETE /notes/:id
  Response: { message: "Note deleted" }
*/

export async function getNotes() {
  const res = await api.get("/notes");
  return res.data;
}

export async function createNote(payload) {
  const res = await api.post("/notes", payload);
  return res.data;
}

export async function updateNote(id, payload) {
  const res = await api.put(`/notes/${id}`, payload);
  return res.data;
}

export async function deleteNote(id) {
  const res = await api.delete(`/notes/${id}`);
  return res.data;
}

// Helper to normalize axios errors for UI display
export function getNotesApiError(err) {
  return err?.response?.data?.error || err?.message || "Something went wrong";
}
