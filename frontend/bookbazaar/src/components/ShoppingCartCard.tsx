import { useCartStore } from "@/States/useCartState";
import "../styles/Book.css";
import { MinusIcon, PlusIcon, X } from "lucide-react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Button } from "./ui/button";
import { Label } from "@radix-ui/react-label";
import type { Book } from "@/interface/Book";
import { useEffect, useState } from "react";

interface ShoppingCartCardProps {
  book: Book;
  onAdd?: (book: Book) => void
  onRemove?: (bookId: number) => void
  onQtyChange?:(bookId: number, delta :number) => void;
}

function ShoppingCartCard({ book, onRemove, onQtyChange }: ShoppingCartCardProps) {
  const { updateQuantity, removeFromCart: removeLocal } = useCartStore();
  const [remainingMs, setRemainingMs] = useState<number | null>(null);

  // live countdown based on reservationExpiresAt
  useEffect(() => {
    if (!book.reservationExpiresAt) {
      setRemainingMs(null);
      return;
    }
    const parsed = Date.parse(book.reservationExpiresAt as string);
    if (isNaN(parsed)) {
      setRemainingMs(null);
      return;
    }

    const update = () => {
      const diff = parsed - Date.now();
      setRemainingMs(diff);
      if (diff <= 0) {
        // expired: prefer parent handler, otherwise remove locally
        if (onRemove) {
          try {
            onRemove(book.id);
          } catch (e) {
            // best-effort fallback
            removeLocal(book.id);
          }
        } else {
          removeLocal(book.id);
        }
      }
    };

    update();
    const id = window.setInterval(update, 1000);
    return () => clearInterval(id);
  }, [book.reservationExpiresAt, onRemove, removeLocal, book.id]);

  function formatRemaining(ms: number) {
    if (ms <= 0) return "00:00:00";
    const total = Math.floor(ms / 1000);
    const h = Math.floor(total / 3600);
    const m = Math.floor((total % 3600) / 60);
    const s = total % 60;
    return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  }


  return (
    <div>
      <Card
        className="w-120 h-60 ml-5 display-flex justify-start
     shadow-lg rounded-2xl hover:scale-105 transition-transform duration-300 gap-5 p-4"
      >
        <CardHeader>
          <CardTitle className="text-lg fron-semibold leading-none tracking-tight">
            {book.name}
          </CardTitle>
        </CardHeader>
        <CardContent>{book.author}</CardContent>
        <CardContent>{book.price?.toFixed(2)} €</CardContent>
        <CardFooter className="flex justify-start gap-3">
          <Button
            className="bg-gray-500 px-3 py-2 text-lg transition-transform duration-200 hover:scale-110 hover:bg-red-500 "
            onClick={() => {
              if (onRemove) return onRemove(book.id);
              removeLocal(book.id);
            }}
          >
            <X />
          </Button>
          <Button
            className="bg-gray-500 px-3 py-2 text-lg transition-transform duration-200 hover:scale-110 hover:bg-green-700 "
            onClick={() => {
              if (onQtyChange) return onQtyChange(book.id, +1);
              updateQuantity(book.id, +1);
            }}
          >
            <PlusIcon />
          </Button>
          <Button
            className="bg-gray-500 px-3 py-2 text-lg transition-transform duration-200 hover:scale-110 hover:bg-green-700"
            onClick={() => {
              if (onQtyChange) return onQtyChange(book.id, -1);
              updateQuantity(book.id, -1);
            }}
          >
            <MinusIcon />
          </Button>
        </CardFooter>
        <CardFooter className="flex justify-start gap-3 flex-wrap">
          <p>Lager:{book.quantity}</p>
          {typeof book.quantityCart === "number" && book.quantityCart > 1 && (
            <Label>Menge: {book.quantityCart}</Label>
          )}
          {remainingMs !== null ? (
            <Label>
              {remainingMs > 0
                ? `Reserviert: ${formatRemaining(remainingMs)}`
                : "Reservierung abgelaufen"}
            </Label>
          ) : null}
        </CardFooter>
      </Card>
    </div>
  );
}

export default ShoppingCartCard;
