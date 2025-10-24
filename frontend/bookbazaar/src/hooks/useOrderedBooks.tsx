import type { Book } from "@/interface/Book";
import { apiFetch } from "@/lib/api";
import { useAuthStore } from "@/States/userAuthState";
import { useQuery } from "@tanstack/react-query";

async function getOrderedBooks(token: string): Promise<Book[]> {
  const res = await apiFetch("/books/ordered", {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  if (!res.ok) throw new Error("Fehler beim Laden der Bücher");
  return res.json();
}

export default function useOrderedBooks() {
  const { token } = useAuthStore();

  if (!token) {
    throw new Error("User nicht eingeloggt");
  }

  const query = useQuery<Book[], Error>({
    queryFn: () => getOrderedBooks(token!),
    queryKey: ["orderedBooks"],
    enabled: !!token,
  });

  return {...query}
}
