import type { JSX } from "react";
import { useAuthStore } from "./userAuth";
import { Navigate } from "react-router-dom";

type Props = {
  children: JSX.Element;
}

export default function ProtectedRoute({children}: Props){
  const {isLoggedIn} = useAuthStore()

  if(!isLoggedIn){
    return <Navigate to="/users" replace />
  }
  return children
}
