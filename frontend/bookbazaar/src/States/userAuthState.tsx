import { create } from "zustand";

interface AuthState {
  isLoggedIn: boolean;
  token: string | null;
  userId: number | null;
  role: string | null;
  login: (token: string, userId: number, role: string) => void;
  logout: () => void;
  setToken: (token: string) => void;
  isAdmin: () => boolean;
}

function parseJWT(token: string) {
  try {
    return JSON.parse(atob(token.split(".")[1]));
  } catch {
    return null;
  }
}

export const useAuthStore = create<AuthState>((set, get) => ({
  isLoggedIn: false,
  token: null,
  userId: null,
  role: null,

  login: (token: string, userId: number, role: string) => {
    set({ isLoggedIn: true, token, userId, role });

    // optional: Ablauf-Timeout setzen (nur für UI convenience)
    const claims = parseJWT(token);
    if (claims?.exp) {
      const remainingTime = claims.exp * 1000 - Date.now();
      setTimeout(() => {
        set({ isLoggedIn: false, token: null, userId: null, role: null });
      }, remainingTime);
    }
  },

  logout: () => {
    set({ isLoggedIn: false, token: null, userId: null, role: null });
  },

  setToken: (token: string) => {
    const claims = parseJWT(token);
    set((state) => ({
      ...state,
      token,
      isLoggedIn: true,
      userId: claims?.userId ?? state.userId,
      role: claims?.role ?? state.role,
    }));
  },

  isAdmin: () => get().role === "admin",
}));
