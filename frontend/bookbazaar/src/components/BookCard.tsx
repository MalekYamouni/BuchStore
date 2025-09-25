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
import { useCartStore } from "@/hooks/useCart";
import { HeartMinus, HeartPlus, ShoppingBasket, Trash2 } from "lucide-react";
import { useFavoritesStore } from "@/hooks/useFavorite";
import { Rating, RatingButton } from "./ui/shadcn-io/rating";
import { useState } from "react";
import useBorrow from "@/hooks/useBorrow";

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
  const { addToCart } = useCartStore();
  const { addToFavorite } = useFavoritesStore();
  const [rating, setRating] = useState(3);
  const { borrowBookMutation, giveBookBack } = useBorrow();

  const handleBorrow = async (bookId: number) => {
    try {
      await borrowBookMutation.mutateAsync(bookId);
    } catch (err) {}
  };
  
  function isOverdue(dueAt?: string) {
    if (!dueAt || dueAt === "0001-01-01T00:00:00Z") return false;
    const dueDate = new Date(dueAt);
    const now = new Date();
    console.log("dueDate:", dueDate.getTime(), "now:", now.getTime());
    return dueDate.getTime() < now.getTime();
  }


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
          {isFavorite ? <HeartMinus></HeartMinus> : <HeartPlus></HeartPlus>}
        </Button>
        {showCartButton && (
          <Button
            onClick={(e) => {
              e.stopPropagation(), addToCart(book);
            }}
            className="bg-gray-200 hover:bg-green-600 text-black rounded-full px-3 py-2 text-lg  transition-transform duration-200 hover:scale-110 "
          >
            <ShoppingBasket></ShoppingBasket>
          </Button>
        )}
        {showDeleteButton && deleteBookFrontEnd && (
          <Button
            onClick={(e) => {
              e.stopPropagation(),
                console.log("Book, das gelöscht werden soll:", book);
              deleteBookFrontEnd.mutate(book.id);
            }}
            className="bg-gray-200 hover:bg-red-600 text-black rounded-full px-3 py-2 text-lg  transition-transform duration-200 hover:scale-110 "
            variant={"destructive"}
          >
            <Trash2></Trash2>
          </Button>
        )}
        {showBorrowButton && (!book.dueAt || book.dueAt === "0001-01-01T00:00:00Z") && (
          <Button
            className="bg-gray-200 hover:bg-green-600 text-black rounded-full px-3 py-2 text-lg  transition-transform duration-200 hover:scale-110 "
            onClick={() => handleBorrow(book.id)}
          >
            ausleihen
          </Button>
        )}
        {showBorrowButton && book.dueAt && book.dueAt !== "0001-01-01T00:00:00Z" && (
          <Button
            className="bg-gray-200 hover:bg-red-600 text-black rounded-full px-3 py-2 text-lg  transition-transform duration-200 hover:scale-110 "
            onClick={() => handleGiveBack(book.id)}
          >
            zurückgeben
          </Button>
        )}
        {book.dueAt && book.dueAt !== "0001-01-01T00:00:00Z" && (
          <span>
            Fällig am:{" "}
            {new Date(book.dueAt).toLocaleDateString("de-DE", {
              year: "numeric",
              month: "2-digit",
              day: "2-digit",
            })}
          </span>
        )}
        {isBorrowpage && book.dueAt && isOverdue(book.dueAt) && (
          <span className="text-red-600 font-bold">Überfällig!</span>
        )}
      </CardFooter>
      <div className="pl-6">
        <Rating value={rating} onValueChange={setRating}>
          {Array.from({ length: 5 }).map((_, index) => (
            <RatingButton
              className="text-xs text-muted-foreground text-green-600"
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
