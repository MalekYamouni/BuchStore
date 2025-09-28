import useBooks from "@/hooks/useBooks";
import "../styles/Book.css";
import type { BookCardProps } from "../interface/BookCardProps";

import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Button } from "./ui/button";
import { useCartStore } from "@/States/useCartState";
import { HeartMinus, HeartPlus, ShoppingBasket, Trash2 } from "lucide-react";
import { useFavoritesStore } from "@/States/useFavoriteState";
import { Rating, RatingButton } from "./ui/shadcn-io/rating";
import { useEffect, useState } from "react";
import useBorrow from "@/hooks/useBorrow";
import useCart from "@/hooks/useCart";
import type { Book } from "@/interface/Book";

function BookCard({
  book,
  isFavorite,
  showDeleteButton,
  showCartButton,
  showBorrowButton,
  onClick,
  isBorrowpage,
}: BookCardProps) {
  const { deleteBookFrontEnd } = useBooks();
  const { addToFavorite } = useFavoritesStore();
  const [rating, setRating] = useState(3);
  const { borrowBookMutation, giveBookBack } = useBorrow();
  const [remainingMs, setRemainingMs] = useState<number | null>(null);
  const { addToCart } = useCart();

  const addLocal = useCartStore((s) => s.addToCart);
  const removeLocal = useCartStore((s) => s.removeFromCart);

  async function handleAdd(book: Book) {
    addLocal(book);
    try {
      await addToCart.mutateAsync(book.id);
    } catch (err) {
      removeLocal(book.id);
      console.error("Fehler beim Hinzufügen zum Warenkorb:", err);
    }
  }
  // Countdown Timer für verbleibende Zeit bis zur Rückgabe
  useEffect(() => {
    if (!book?.dueAt || book.dueAt === "0001-01-01T00:00:00Z") {
      setRemainingMs(null);
      return;
    }
    const target = new Date(book.dueAt).getTime();
    if (isNaN(target)) {
      setRemainingMs(null);
      return;
    }
    const update = () => setRemainingMs(target - Date.now());
    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, [book?.dueAt]);

  function formatRemainingTime(ms: number) {
    if (ms <= 0) return "Überfällig!";
    const totalSeconds = Math.floor(ms / 1000);
    const days = Math.floor(totalSeconds / 86400);
    const hours = Math.floor((totalSeconds % 86400) / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    const parts: string[] = [];
    if (days) parts.push(`${days}d`);
    if (hours || days) parts.push(`${String(hours).padStart(2, "0")}h`);
    parts.push(`${String(minutes).padStart(2, "0")}m`);
    parts.push(`${String(seconds).padStart(2, "0")}s`);
    return parts.join(" ");
  }

  const handleBorrow = async (bookId: number) => {
    try {
      await borrowBookMutation.mutateAsync(bookId);
    } catch (err) {}
  };

  const handleGiveBack = async (bookId: number) => {
    try {
      await giveBookBack.mutateAsync(bookId);
    } catch (err) {}
  };

  return (
    <Card
      onClick={() => onClick(book)}
      className="w-150 h-80 ml-5 display-flex justify-center
     shadow-lg rounded-2xl hover:scale-105 transition-transform duration-300 gap-5"
    >
      <CardHeader>
        <CardTitle className="text-lg fron-semibold leading-none tracking-tight">
          {book.name}
        </CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-2 gap-4">
        <div className="flex flex-col space-y-2">
          <p>Autor: {book.author}</p>

          {!isBorrowpage ? (
            <p>Preis: {book.price.toFixed(2)}€</p>
          ) : (
            <p>Leihpreis: {book.borrowPrice.toFixed(2)}</p>
          )}

          <p>Genre: {book.genre}</p>
        </div>
        <div>
          <p>Beschreibung...</p>
          <p className=" text-sm text-gray-600">{book.description}</p>
        </div>
      </CardContent>

      <CardFooter className="flex justify-start gap-3">
        <Button
          onClick={(e) => {
            e.stopPropagation(), addToFavorite(book);
          }}
          className="bg-gray-200 hover:bg-pink-600 rounded-full px-3 py-2 text-lg transition-transform duration-200 hover:scale-110 "
          variant={"secondary"}
        >
          {isFavorite ? <HeartMinus /> : <HeartPlus />}
        </Button>

        {showCartButton && (
          <Button
            onClick={(e) => {
              e.stopPropagation(), handleAdd(book);
            }}
            className="bg-gray-200 hover:bg-green-600 text-black rounded-full px-3 py-2 text-lg  transition-transform duration-200 hover:scale-110 "
          >
            <ShoppingBasket />
          </Button>
        )}

        {showDeleteButton && deleteBookFrontEnd && (
          <Button
            onClick={(e) => {
              e.stopPropagation();
              deleteBookFrontEnd.mutate(book.id);
            }}
            className="bg-gray-200 hover:bg-red-600 text-black rounded-full px-3 py-2 text-lg  transition-transform duration-200 hover:scale-110 "
            variant={"destructive"}
          >
            <Trash2 />
          </Button>
        )}

        {showBorrowButton &&
          (!book.dueAt || book.dueAt === "0001-01-01T00:00:00Z") && (
            <Button
              onClick={(e) => {
                e.stopPropagation();
                handleBorrow(book.id);
              }}
              className="bg-gray-200 hover:bg-green-600 text-black rounded-full px-3 py-2 text-lg  transition-transform duration-200 hover:scale-110 "
            >
              ausleihen
            </Button>
          )}

        {showBorrowButton &&
          book.dueAt &&
          book.dueAt !== "0001-01-01T00:00:00Z" && (
            <Button
              onClick={(e) => {
                e.stopPropagation();
                handleGiveBack(book.id);
              }}
              className="bg-gray-200 hover:bg-red-600 text-black rounded-full px-3 py-2 text-lg  transition-transform duration-200 hover:scale-110 "
            >
              zurückgeben
            </Button>
          )}

        {/* Countdown / Fälligkeitsanzeige: show live countdown wenn remainingMs gesetzt, sonst Fälligkeitsdatum */}
        {book.dueAt && book.dueAt !== "0001-01-01T00:00:00Z" && (
          <span
            className={
              remainingMs !== null && remainingMs <= 0
                ? "text-red-600 font-bold"
                : ""
            }
          >
            {remainingMs !== null
              ? formatRemainingTime(remainingMs)
              : "Fällig am: " + new Date(book.dueAt).toLocaleString("de-DE")}
          </span>
        )}
      </CardFooter>

      <div className="pl-6">
        <Rating value={rating} onValueChange={setRating}>
          {Array.from({ length: 5 }).map((_, index) => (
            <RatingButton
              className="text-xs text-muted-foreground"
              key={index}
            />
          ))}
        </Rating>
        <p>Lager:{book.quantity}</p>
      </div>
    </Card>
  );
}

export default BookCard;
