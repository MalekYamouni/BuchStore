import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchWithAuth } from "../lib/fetchWithAuth";
import type { User } from "@/interface/User";
import type { UserRegistration } from "@/pages/UserLogin";
import { apiFetch } from "@/lib/api";

async function getUserById(): Promise<User> {
  const res = await fetchWithAuth(`/user/me`);
  if (!res.ok) throw new Error("Fehler beim Laden des Users");
  return res.json();
}

async function addUser(user: Omit<UserRegistration, "id">): Promise<User> {
  const res = await apiFetch("/addUser", {
    method: "POST",
    body: JSON.stringify(user),
  });

  if (!res.ok){
    const text = await res.text();
    console.error("Fehlerantwort: ", text)
    throw new Error(`Fehler beim Registrieren: ${res.status}`)
  }
  return res.json();
}

export default function useUsers() {
  const qc = useQueryClient();

  const addNewUser = useMutation({
    mutationFn: addUser,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["users"] });
    },
  });

  const getuserById = useQuery<User, Error>({
    queryFn: getUserById,
    queryKey: ["users"],
  });



  return { addNewUser, getuserById};
}
