const BASE = import.meta.env.VITE_API_URL || "http://localhost:8080/api";

export function apiFetch(path: string, init?: RequestInit) {
  return fetch(`${BASE}${path}`, {
    // Don't force Content-Type; callers set it when sending JSON bodies.
    headers: { ...(init?.headers || {}) },
    credentials: "include",
    ...init,
  });
}
