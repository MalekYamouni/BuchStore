import { create } from "zustand";

interface AuthState {
  isLoggedIn: boolean;
  login: (token: string, userId: number, role: string) => void;
  logout: () => void;
  token: string | null;
  userId: number | null;
  role: string | null;
  isAdmin: () => boolean;
}

function parseJWT(token: string) {
  try {
    return JSON.parse(atob(token.split(".")[1]));
  } catch (e) {
    return null;
  }
}

function isTokenValid(token: string) {
  const claims = parseJWT(token);
  if (!claims?.exp) return false;
  return claims.exp * 1000 > Date.now();
}

const savedToken = localStorage.getItem("authToken");
const savedUserId = localStorage.getItem("userId");
const savedRole = localStorage.getItem("role");
const initalTokenValid = savedToken && isTokenValid(savedToken);


export const useAuthStore = create<AuthState>((set, get) => ({
  isLoggedIn: !!initalTokenValid && !!savedUserId,
  token: initalTokenValid ? savedToken : null,
  userId: initalTokenValid && savedUserId ? parseInt(savedUserId) : null,
  role: initalTokenValid && savedRole ? savedRole: "user",
  login: (token: string, userId: number, role: string) => {

    localStorage.setItem("authToken", token);
    localStorage.setItem("userId", String(userId));
    localStorage.setItem("role", role)
    set({ isLoggedIn: true, token, userId, role});

    const claims = parseJWT(token)
    if (claims?.exp){
      const remainingTime = claims.exp * 1000 - Date.now();
      setTimeout(() => set({isLoggedIn:false, token: null, userId: null, role: null}), remainingTime)
    }
  },
  logout: () => {
    localStorage.removeItem("authToken"),
      localStorage.removeItem("userId"),
      localStorage.removeItem("role")
      set({ isLoggedIn: false, token: null, userId: null, role:null });
  },
  isAdmin: () => get().role === "admin",
}));

