import type { User } from "@/interface/User";
import type { UserRegistration } from "@/pages/UserLogin";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "./userAuth";

const API_URL = "http://localhost:8080/api";

async function getUsers(token: string): Promise<User[]> {
  const res = await fetch(`${API_URL}/users`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
  if (!res.ok) throw new Error("Fehler beim Laden der Bücher");
  return res.json();
}

async function GetUserById(token: string): Promise<User> {
  const res = await fetch(`${API_URL}/user/:id`, {
    method: "GET",
    headers: { "Content-Type": "application/json" , Authorization: `Bearer ${token}`},
  });
  return res.json();
}

async function addUser(user: Omit<UserRegistration, "id">, token: string): Promise<User> {
  const res = await fetch(`${API_URL}/addUser`, {
    method: "POST",
    headers: { "Content-Type": "application/json" , Authorization: `Bearer ${token}`},
    body: JSON.stringify(user),
  });
  if (!res.ok) throw new Error("Fehler beim Registrieren");
  return res.json();
}

export default function useUsers() {
  const qc = useQueryClient();
  const {token} = useAuthStore()
  const userquery = useQuery<User[], Error>({
    queryFn: () => getUsers(token!),
    queryKey: ["users"],
  });

  const addNewUser = useMutation({
    mutationFn:(user: Omit<UserRegistration, "id">) => addUser(user, token!),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["users"] });
    },
  });

  const getuserById = useQuery<User, Error>({
    queryFn: () => GetUserById(token!),
    queryKey: ["users"],
  });

  return { ...userquery, addNewUser, ...getuserById };
}
