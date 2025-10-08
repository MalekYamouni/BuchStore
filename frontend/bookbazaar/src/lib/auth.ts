import { useAuthStore } from "@/States/userAuthState";
import { apiFetch } from "./api";
const API_URL = "http://localhost:8080/api";

export async function login(username: string, password: string) {
  const res = await apiFetch("/login", {
    method: "POST",
    headers: { "Content-Typer": "application/json" },
    credentials: "include",
    body: JSON.stringify({ username, password }),
  });

  if (!res.ok) throw new Error("Login fehlgeschlagen");
  const data = await res.json();
  const access = data.access_token ?? data.access_token ?? data.access_token;
  if (!access) throw new Error("Kein Access Token erhalten");

  useAuthStore.getState().setToken(access);
  return data;
}

export async function logout() {
  const store = useAuthStore.getState();
  try {
    await fetch(`${API_URL}/logout`, {
      method: "POST",
      credentials: "include", // Cookie wird gesendet
    });
  } catch (err) {
    console.error("Logout Fehler", err);
  } finally {
    store.logout(); // Zustand leeren
  }
}

export async function tryAutoLogin() {
  const store = useAuthStore.getState();
  try {
    const res = await fetch("http://localhost:8080/api/refresh", {
      method: "POST",
      credentials: "include", // Cookie wird automatisch gesendet
    });
    if (!res.ok) return false;
    const data = await res.json();
    store.setToken(data.access_token);
    return true;
  } catch {
    return false;
  }
}

