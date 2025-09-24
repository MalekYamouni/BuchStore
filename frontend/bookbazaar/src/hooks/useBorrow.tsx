import type { Book } from "@/interface/Book";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "./userAuth";

export default function useBorrow() {
  const qc = useQueryClient();
  const API_URL = "http://localhost:8080/api";
  const token = useAuthStore((s) => s.token);

  async function borrowBook(bookId: number): Promise<any> {
    if (!token) throw new Error("User ist nicht eingeloggt");
    const res = await fetch(`${API_URL}/books/${bookId}/borrowBook`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ days: 7 }),
    });

    if (!res.ok) throw new Error("Fehler beim Leihen des Büches.");
    return res.json();
  }
  async function giveBorrowedBookback(bookId: number): Promise<any> {
    if (!token) throw new Error("User ist nicht eingeloggt");
    const res = await fetch(`${API_URL}/books/${bookId}/giveBookBack`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (!res.ok) throw new Error("Fehler beim zurückgeben des Buches");
    return res.json();
  }

  async function getBorrowedBooks(): Promise<Book[]> {
    const res = await fetch(`${API_URL}/books/borrowedBooks`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (res.status === 401) {
      throw new Error("Nicht autorisiert. Bitte einloggen.");
    }
    if (!res.ok) {
      const text = await res.text();
      throw new Error("Geliehene Bücher konnten nicht geladen werden." + text);
    }
    return res.json();
  }

  const borrowedBooksQuery = useQuery<Book[], Error>({
    queryKey: ["borrowedBooks", token],
    queryFn: getBorrowedBooks,
    enabled: !!token,
  });

  const borrowBookMutation = useMutation<void, Error, number>({
    mutationFn: (bookId: number) => borrowBook(bookId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["borrowedBooks"] });
      qc.invalidateQueries({ queryKey: ["books"] });
      qc.invalidateQueries({ queryKey: ["users"] });
    },
  });

  const giveBookBack = useMutation<void, Error, number>({
    mutationFn: (bookId: number) => giveBorrowedBookback(bookId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["borrowedBooks"] });
      qc.invalidateQueries({ queryKey: ["books"] });
      qc.invalidateQueries({ queryKey: ["users"] });
    },
  });

  return { borrowedBooksQuery, borrowBookMutation, giveBookBack };
}
