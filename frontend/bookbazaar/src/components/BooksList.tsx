import BookCard from "./BookCard";
import /*Label*/ "./ui/label";
import { LibraryBig } from "lucide-react";
import { useFavoritesStore } from "@/States/useFavoriteState";
import useBooks from "@/hooks/useBooks";
import { useState } from "react";
import SectionHeader from "./SectionHeader";
import {
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Select,
} from "./ui/select";
import { Input } from "./ui/input";
import type { Book } from "@/interface/Book";

function BookList() {
  const { favorites } = useFavoritesStore();
  const { data: books } = useBooks();
  const [genreFilter, setGenreFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [selectedCard, setSelectedCard] = useState<Book>();

  const filteredBooks = books?.filter((book) => {
    if (genreFilter !== "all" && book.genre !== genreFilter) {
      return false;
    }
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

  return (
    <div className="flex flex-col gap-5 p-5">
      <div className="ml-5 mr-5">
        <SectionHeader title="Bücherliste" icon={<LibraryBig size={20} />} />
      </div>
      <div className="text-2xl m-5 flex items-center gap-3">
        <Select value={genreFilter} onValueChange={setGenreFilter}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Filter auswählen" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Alle</SelectItem>
            <SelectItem value="Romance">Romance</SelectItem>
            <SelectItem value="Action">Action</SelectItem>
            <SelectItem value="Thriller">Thriller</SelectItem>
            <SelectItem value="Fantasy">Fantasy</SelectItem>
          </SelectContent>
        </Select>
        <Input
          placeholder="Suche nach Titel, Autor oder Beschreibung"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-60"
        />
      </div>
      <div className="flex gap-10">
        <div className="flex-1 flex flex-col gap-3 list-column">
          <div className="ml-5 mt-5">
            <SectionHeader title="Auswahl" />
          </div>
          {filteredBooks?.map((book) => (
            <BookCard
              key={book.id}
              book={book}
              isFavorite={favorites.some((fav) => fav.id === book.id)}
              showDeleteButton={true}
              showCartButton={true}
              showBorrowButton={false}
              onClick={(b) => setSelectedCard(b)}
              isBorrowpage={false}
            />
          ))}
        </div>
        <aside className="flex-1 border border-border bg-card text-foreground p-5 rounded-2xl shadow-lg transition-all duration-500 detail-panel">
          <div
            className={`detail-inner transition-transform duration-500 ${
              selectedCard ? "opacity-100 translate-x-0" : "opacity-20 blur-sm "
            }`}
          >
            {selectedCard ? (
              <>
                <SectionHeader title={selectedCard.name} />
                <p className="mb-3 text-sm text-muted-foreground">
                  {selectedCard.descriptionLong}
                </p>
                <div className="meta text-xs text-muted-foreground">
                  <div>Autor: {selectedCard.author}</div>
                  <div>Genre: {selectedCard.genre}</div>
                  <div>Preis: {selectedCard.price.toFixed(2)}€</div>
                </div>
              </>
            ) : (
              <>
                <div className="sticky top-0 z-10 -mx-5 px-5 pt-2 pb-3 bg-card border-b border-border">
                  <SectionHeader title="Wähle ein Buch" />
                </div>
                <p className="mb-3 text-sm text-muted-foreground">
                  Kein Buch ausgewählt. Wähle links eine Karte aus, um die
                  Details hier zu sehen.
                </p>
              </>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}

export default BookList;
