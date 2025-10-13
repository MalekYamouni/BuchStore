import type { Book } from "@/interface/Book";
import { fetchWithAuth } from "@/lib/fetchWithAuth";
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

  if (!res) throw new Error("Buch hinzufügen Fehlgeschlagen");
  console.log(res.status);
  console.log(res.text);

  return res.json();
}

export default function useFavorites() {
  const qc = useQueryClient();

  const query = useQuery<Book[], Error>({
    queryFn: () => GetallFavorites(),
    queryKey: ["favorites"],
  });

  const addtofavorites = useMutation<void, Error, number>({
    mutationFn: AddToFavorites,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["favorites"] });
      qc.invalidateQueries({ queryKey: ["books"] });
    },
  });

  return { ...query, addtofavorites };
}
