import { create } from "zustand";
import type { Book } from "../interface/Book";

interface CartState {
  shoppingCart: Book[];
  addToCart: (book: Book) => void;
  removeFromCart: (id: number) => void;
  updateQuantity: (bookId: number, amount: number) => void;
  setShoppingCart: (books: Book[]) => void;
}


export const useCartStore = create<CartState>((set) => ({
  shoppingCart: [],
  addToCart: (book: Book) =>
    set((state: CartState) => {
      const exists = state.shoppingCart.some((b) => b.id === book.id);

      if (exists) {
        return {
          shoppingCart: state.shoppingCart.map((b) =>
            b.id === book.id ? {...b, quantityCart: (b.quantityCart ?? 1) + 1 } : b
          ),
        };
      }
      return {
        shoppingCart: [...state.shoppingCart, { ...book, quantityCart: 1 }],
      };
    }),
  removeFromCart: (id) =>
    set((state: CartState) => ({
      shoppingCart: state.shoppingCart.filter((b) => b.id !== id),
    })),
  updateQuantity: (bookId: number, amount: number) =>
    set((state: CartState) => ({
      shoppingCart: state.shoppingCart.map((b) =>
        b.id === bookId
          ? { ...b, quantityCart: Math.max(1, (b.quantityCart ?? 1) + amount) }
          : b
      ),
    })),
  setShoppingCart: (books: Book[]) => set({ shoppingCart: books }),
}));
