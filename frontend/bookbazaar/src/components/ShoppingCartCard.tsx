import { useCartStore } from "@/hooks/useCart";
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

interface ShoppingCartCardProps {
  book: Book;
}

function ShoppingCartCard({ book }: ShoppingCartCardProps) {
  const { updateQuantity, removeFromCart } = useCartStore();

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
              removeFromCart(book.id);
            }}
          >
            <X />
          </Button>
          <Button
            className="bg-gray-500 px-3 py-2 text-lg transition-transform duration-200 hover:scale-110 hover:bg-green-700 "
            onClick={() => {
              updateQuantity(book.id, +1);
            }}
          >
            <PlusIcon />
          </Button>
          <Button
            className="bg-gray-500 px-3 py-2 text-lg transition-transform duration-200 hover:scale-110 hover:bg-green-700"
            onClick={() => {
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
        </CardFooter>
      </Card>
    </div>
  );
}

export default ShoppingCartCard;
