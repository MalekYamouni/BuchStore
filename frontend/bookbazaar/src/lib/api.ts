const BASE = import.meta.env.VITE_API_URL || "http://localhost:8080/api";

export function apiFetch(path: string, init?: RequestInit) {
  return fetch(`${BASE}${path}`, {
    headers: { "Content-Type": "application/json", ...(init?.headers || {}) },
    credentials: "include",
    ...init,
  });
}
