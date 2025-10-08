import type { Book } from "../interface/Book";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "../States/userAuthState";
import { fetchWithAuth } from "@/lib/fetchWithAuth";
import { apiFetch } from "@/lib/api";

async function getBooks(token: string): Promise<Book[]> {
  const res = await apiFetch("/books", {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
  if (!res.ok) throw new Error("Fehler beim Laden der Bücher");
  return res.json();
}

async function addBook(book: Omit<Book, "id">, token: string): Promise<Book> {
  const res = await apiFetch(`/books`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(book),
  });

  const data = await res.json();

  if (!res.ok) throw new Error(data.message || "Fehler beim Hinzufügen");
  return data;
}

async function deleteBook(id: number, token: string): Promise<void> {
  const res = await apiFetch(`/books/${id}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
  if (!res.ok) throw new Error("Fehler beim Löschen des Buches");
}

async function buyBook(bookId: number, token: string) {
  const res = await fetchWithAuth(`/books/${bookId}/buyBook`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
  if (!res.ok) throw new Error("Fehler beim Kaufen des Buches");
  return res.json();
}

async function buyBooks(purchases: { bookId: number; quantity: number }[]) {
  const res = await fetchWithAuth(`/books/buyBooks`, {
    method: "POST",
    body: JSON.stringify({ purchases }),
  });

  if (!res.ok) throw new Error("Fehler beim Kaufen der Bücher");

  console.log(res.body)
  return res.json();
}

export default function useBooks() {
  const qc = useQueryClient();
  const { token } = useAuthStore();

  if (!token) {
    throw new Error("User ist nicht eingeloggt");
  }

  const query = useQuery<Book[], Error>({
    queryFn: () => getBooks(token!),
    queryKey: ["books"],
    enabled: !!token,
  });

  const addNewBook = useMutation({
    mutationFn: (book: Omit<Book, "id">) => addBook(book, token),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["books"] });
    },
  });

  const deleteBookFrontEnd = useMutation({
    mutationFn: (id: number) => deleteBook(id, token!),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["books"] });
    },
  });

  const buyBookMutation = useMutation({
    mutationFn: ({ bookId }: { bookId: number }) => buyBook(bookId, token),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["books"] });
      qc.invalidateQueries({ queryKey: ["users"] });
    },
  });

  const buyBooksMutation = useMutation({
    mutationFn: ({
      purchases,
    }: {
      purchases: { bookId: number; quantity: number }[];
    }) => buyBooks(purchases),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["books"] });
      qc.invalidateQueries({ queryKey: ["users"] });
    },
  });

  return {
    ...query,
    addNewBook,
    deleteBookFrontEnd,
    buyBookMutation,
    buyBooksMutation,
  };
}
