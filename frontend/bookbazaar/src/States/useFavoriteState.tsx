import type { Book } from "@/interface/Book";
import { create } from "zustand/react";

interface FavoriteState {
  addToFavorite: (book: Book) => void;
  favorites: Book[];
}

export const useFavoritesStore = create<FavoriteState>((set, get) => ({
  favorites: [],

  addToFavorite: (book: Book) => {
    const { favorites } = get(); // aktueller Zustand
    const exists = favorites.some((f) => f.id === book.id);

    if (exists) {
      // entfernen
      set({ favorites: favorites.filter((f) => f.id !== book.id) });
    } else {
      // hinzufügen
      set({ favorites: [...favorites, book] }); 
    }
  },
}));
