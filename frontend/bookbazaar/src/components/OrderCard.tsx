import "../styles/Book.css";
import { MinusIcon, PlusIcon, X } from "lucide-react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "./ui/card";

import type { Book } from "@/interface/Book";

interface ShoppingCartCardProps {
  book: Book;
  onAdd?: (book: Book) => void;
  onRemove?: (bookId: number) => void;
  onQtyChange?: (bookId: number, delta: number) => void;
}

function OrderCard({ book }: ShoppingCartCardProps) {
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
      </Card>
    </div>
  );
}

export default OrderCard;
