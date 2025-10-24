import type { Book } from "@/interface/Book";
import { fetchWithAuth } from "@/lib/fetchWithAuth";
import { useAuthStore } from "@/States/userAuthState";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { UseQueryResult, UseMutationResult } from "@tanstack/react-query";

type UseCartReturn = UseQueryResult<Book[], Error> & {
  addToCart: UseMutationResult<void, Error, number>;
  removeFromCart: UseMutationResult<void, Error, number>;
};

export default function useCart(): UseCartReturn {
  const qc = useQueryClient();
  const token = useAuthStore((s) => s.token);

  async function GetCartBooks(): Promise<Book[]> {
    const res = await fetchWithAuth(`/books/cart`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (!res.ok)
      throw new Error("Laden der Bücher aus dem Warenkorb fehlgeschlagen");

    return res.json();
  }

  async function AddBookToCart(bookId: number): Promise<void> {
    const res = await fetchWithAuth(`/books/cart/${bookId}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (!res.ok) throw new Error("Buch wurde nicht dem Warenkorb hinzugefügt.");
    return;
  }

  const cartBooksquery = useQuery<Book[], Error>({
    queryKey: ["cartBooks", token],
    queryFn: GetCartBooks,
    enabled: !!token,
  });

  const addToCart = useMutation<void, Error, number>({
    mutationFn: (bookId: number) => AddBookToCart(bookId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["cartBooks", token] });
    },
  });

  async function RemoveBookFromCart(bookId: number): Promise<void> {
    const res = await fetchWithAuth(`/books/cart/${bookId}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
    if (!res.ok) throw new Error("Buch konnte nicht aus dem Warenkorb entfernt werden.");
    return;
  }

  const removeFromCart = useMutation<void, Error, number>({
    mutationFn: (bookId: number) => RemoveBookFromCart(bookId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["cartBooks", token] });
    },
  });

  return { ...cartBooksquery, addToCart, removeFromCart };
}
