// Label removed in favor of SectionHeader for consistent headers
import BookCard from "./BookCard";
import { BookHeart } from "lucide-react";
import { useFavoritesStore } from "@/States/useFavoriteState";
import { useState } from "react";
import SectionHeader from "./SectionHeader";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Input } from "./ui/input";
import type { Book } from "@/interface/Book";

function FavoriteList() {
  const { favorites } = useFavoritesStore();
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [selectedCard, setSelectedCard] = useState<Book>();

  const filteredFavorites = favorites.filter((book) => {
    if (filter !== "all" && book.genre !== filter) {
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
        <SectionHeader title="Favoriten" icon={<BookHeart size={20} />}  />
      </div>
      <div className="text-2xl m-5 flex items-center gap-3">
        <Select value={filter} onValueChange={setFilter}>
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
          <div className="ml-5 mt-5">
            <SectionHeader title="Ihre Favoriten" />
          </div>
          {filteredFavorites.length === 0 ? (
            <div className="text-2xl m-5 flex items-center gap-3">
              Keine Favoriten hinzugefügt
            </div>
          ) : (
            filteredFavorites.map((book) => (
              <BookCard
                key={book.id}
                book={book}
                isFavorite={true}
                showDeleteButton={false}
                showCartButton={true}
                showBorrowButton={false}
                onClick={(b) => setSelectedCard(b)}
                isBorrowpage={false}
              />
            ))
          )}
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
                <p className="mb-3 text-sm text-muted-foreground">{selectedCard.descriptionLong}</p>
              </>
            ) : (
              <>
                <div className="sticky top-0 z-10 -mx-5 px-5 pt-2 pb-3 bg-card border-b border-border">
                  <SectionHeader title="Wähle ein Buch" />
                </div>
                <p className="mb-3 text-sm text-muted-foreground">Bitte wähle ein Buch, um Details zu sehen.</p>
              </>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}
export default FavoriteList;
