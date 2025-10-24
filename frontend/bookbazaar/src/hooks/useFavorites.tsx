import type { Book } from "@/interface/Book";
import { fetchWithAuth } from "@/lib/fetchWithAuth";
import { useFavoritesStore } from "@/States/useFavoriteState";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

async function GetallFavorites() {
  const res = await fetchWithAuth("/books/Favorites", {
    method: "GET",
  });

  if (!res) throw new Error("Getten der Favoriten fehlgeschlagen");

  return res.json();
}

async function AddToFavorites(bookId: number) {
  const res = await fetchWithAuth(`/books/addToFavorites/${bookId}`, {
    method: "POST",
  });

  if (!res) throw new Error("Buch hinzufügen fehlgeschlagen");
  console.log(res.status);
  console.log(res.text);

  return res.json();
}

async function RemoveFavorite(bookId: number) {
  const res = await fetchWithAuth(`/books/deleteFavorite/${bookId}`, {
    method: "DELETE",
  });

  if (!res) throw new Error("Buch löschen fehlgeschlagen");

  return res.json();
}

export default function useFavorites() {
  const qc = useQueryClient();
  const { favorites, addToFavorite: addLocal } = useFavoritesStore();

  const query = useQuery<Book[], Error>({
    queryFn: () => GetallFavorites(),
    queryKey: ["favorites"],
  });

  const addtofavorites = useMutation<void, Error, number>({
    mutationFn: AddToFavorites,
    onMutate: async (bookId) => {
      addLocal({ id: bookId } as Book);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["favorites"] });
      qc.invalidateQueries({ queryKey: ["books"] });
    },
  });

  const deleteFavorite = useMutation<void, Error, number>({
    mutationFn: RemoveFavorite,
    onMutate: async (bookId) => {
      addLocal({ id: bookId } as Book);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["favorites"] });
      qc.invalidateQueries({ queryKey: ["books"] });
    },
  });

  return { ...query, addtofavorites, deleteFavorite, addLocal, favorites };
}
