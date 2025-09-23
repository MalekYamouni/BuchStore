import type { Book } from "./Book";

export interface BookCardProps {
  book: Book;
  isFavorite: boolean;
  showDeleteButton: boolean;
  showCartButton: boolean;
  showBorrowButton: boolean;
  onClick: (book: Book) => void;
  isBorrowpage: boolean;
}
