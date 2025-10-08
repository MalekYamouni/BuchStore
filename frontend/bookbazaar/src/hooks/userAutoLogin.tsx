import { tryAutoLogin } from "@/lib/auth";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export function useAutoLogin(redirect = "/home") {
  const navigate = useNavigate();
  useEffect(() => {
    let mounted = true;
    tryAutoLogin().then((ok) => {
      if (ok && mounted) navigate(redirect);
    });
    return () => {
      mounted = false;
    };
  }, [navigate, redirect]);
}
