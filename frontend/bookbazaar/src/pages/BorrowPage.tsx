import BookCard from "@/components/BookCard";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import useBooks from "@/hooks/useBooks";
import useBorrow from "@/hooks/useBorrow";
import { useFavoritesStore } from "@/States/useFavoriteState";
import useUsers from "@/hooks/useUser";
import type { Book } from "@/interface/Book";
import { Label } from "@radix-ui/react-dropdown-menu";
import { CreditCard, LibrarySquare } from "lucide-react";
import { useEffect, useState } from "react";
import SectionHeader from "@/components/SectionHeader";

function BorrowBooks() {
  const { borrowedBooksQuery } = useBorrow();
  const [genreFilter, setGenreFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [selectedCard, setSelectedCard] = useState<Book>();
  const { favorites } = useFavoritesStore();
  const { data: books } = useBooks();
  const {getuserById} = useUsers();

  const borrowedBooks = borrowedBooksQuery.data ?? [];
  const availableBooks = books?.filter(
    (book) => !borrowedBooks.some((b) => b.id === book.id)
  );

  const userBalance = getuserById.data?.balance ?? 0;

  const filteredBooks = borrowedBooks.filter((book) => {
    if (genreFilter !== "all" && book.genre !== genreFilter) return false;
    if (search) {
      const term = search.toLowerCase();
      return (
        book.genre.toLowerCase() === term ||
        book.name.toLowerCase().includes(term) ||
        book.author.toLowerCase().includes(term) ||
        (book.description && book.description.toLowerCase().includes(term))
      );
    }
    return true;
  });

  useEffect(() => {
    if (
      selectedCard &&
      !borrowedBooks.some((b) => b.id === selectedCard.id) &&
      !availableBooks?.some((b) => b.id === selectedCard.id)
    ) {
      setSelectedCard(undefined);
    }
  }, [borrowedBooks, selectedCard]);

  if (borrowedBooksQuery.isLoading) return <p>Lade ausgeliehene Bücher...</p>;
  if (borrowedBooksQuery.error)
    return <p>Fehler: {(borrowedBooksQuery.error as Error).message}</p>;

  
  return (
    <div className="flex flex-col gap-5 p-5">
      <Label className="text-5xl m-5 flex items-center gap-3">
        <LibrarySquare size={36}></LibrarySquare>Verleih
      </Label>
      <Label className="text-2xl m-5 flex items-center gap-3">
        <CreditCard className="inlineblock"></CreditCard> <span>Guthaben : {userBalance} €</span>
      </Label>
      <div className="text-2xl m-5 flex items-center gap-3">
        <Select value={genreFilter} onValueChange={setGenreFilter}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Filter auswählen" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Alle Favoriten</SelectItem>
            <SelectItem value="Romance">Romance</SelectItem>
            <SelectItem value="Action">Action</SelectItem>
            <SelectItem value="Thriller">Thriller</SelectItem>
          </SelectContent>
        </Select>
        <Input
          placeholder="Suche nach Titel, Autor oder Beschreibung"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-60"
        ></Input>
      </div>
      <div className="flex gap-10">
        <div className="flex-1 flex flex-col gap-3">
          <div className="ml-5">
            <SectionHeader title="Geliehen" />
          </div>
          {filteredBooks?.map((book) => (
            <BookCard
              key={book.id}
              book={book}
              isFavorite={favorites.some((fav) => fav.id === book.id)}
              showDeleteButton={false}
              showCartButton={false}
              showBorrowButton={true}
              isBorrowpage={true}
              onClick={(b) => setSelectedCard(b)}
            />
          ))}
        </div>
        <div className="flex-1 flex flex-col gap-3">
          <div className="ml-5">
            <SectionHeader title="Verfügbar" />
          </div>
          {availableBooks?.map((borrowBook) => (
            <BookCard
              key={borrowBook.id}
              book={borrowBook}
              isFavorite={favorites.some((fav) => fav.id === borrowBook.id)}
              showDeleteButton={false}
              showCartButton={false}
              showBorrowButton={true}
              onClick={(b) => setSelectedCard(b)}
              isBorrowpage={true}
            />
          ))}
        </div>
        <div>
        </div>
  <div className="flex-1 border-1 border-gray-300 p-5 rounded-2xl shadow-lg detail-panel">
          {selectedCard ? (
            <div>
              <h2 className="text-3xl mb-2">{selectedCard.name}</h2>
              <p>{selectedCard.descriptionLong}</p>
            </div>
          ) : (
            <p>Bitte wähle ein Buch, um Details zu sehen.</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default BorrowBooks;
