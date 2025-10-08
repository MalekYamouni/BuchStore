import { useAuthStore } from "../States/userAuthState";
const API_URL = "http://localhost:8080/api";
const BASE = import.meta.env.VITE_API_URL || "http://localhost:8080/api";


let refreshingPromise: Promise<string | null> | null = null;

export async function fetchWithAuth(path: string, init?: RequestInit): Promise<Response> {
  const store = useAuthStore.getState();
  const token = store.token;

  const headers = new Headers(init?.headers ?? {});
  if (token) headers.set("Authorization", `Bearer ${token}`);
  if (!headers.get("Content-Type")) headers.set("Content-Type", "application/json");

  const resp = await fetch(`${BASE}${path}`, { ...init, headers, credentials: "include" });
  if (resp.status !== 401) return resp;

  // 401 -> refresh
  const newToken = await doRefresh();
  if (!newToken) {
    store.logout();
    throw new Error("Nicht authentifiziert");
  }

  // retry original request
  const headers2 = new Headers(init?.headers ?? {});
  headers2.set("Authorization", `Bearer ${newToken}`);
  if (!headers2.get("Content-Type")) headers2.set("Content-Type", "application/json");

  return fetch(`${BASE}${path}`, { ...init, headers: headers2, credentials: "include" });
}

async function doRefresh(): Promise<string | null> {
  const store = useAuthStore.getState();

  if (refreshingPromise) return refreshingPromise;

  refreshingPromise = (async () => {
    try {
      // Cookie-basiert: kein Body, Browser sendet das HttpOnly-Cookie automatisch
      const res = await fetch(`${BASE}/refresh`, {
        method: "POST",
        credentials: "include",
      });
      if (!res.ok) return null;
      const data = await res.json();
      const access = data.access_token ?? data.accessToken;
      if (!access) return null;
      store.setToken(access);
      return access;
    } catch {
      return null;
    } finally {
      refreshingPromise = null;
    }
  })();

  return refreshingPromise;
}
