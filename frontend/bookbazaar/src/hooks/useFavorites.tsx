import { fetchWithAuth } from "@/lib/fetchWithAuth";
import { useMutation, useQueryClient } from "@tanstack/react-query";


async function AddToFavorites(bookId: number) {
  const res = await fetchWithAuth(`/addToFavorites/${bookId}`, {
    method: "POST",
    headers: { ContentType: "application/json" },
  });

  if (!res) throw new Error("Buch hinzufügen Fehlgeschlagen");

  return res.json();
}

export default function useFavorites() {
  const qc = useQueryClient();

  const addtofavorites = useMutation({
    mutationFn: AddToFavorites,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["favorites"] });
    },
  });

  return addtofavorites
}
