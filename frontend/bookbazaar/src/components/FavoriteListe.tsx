import { Label } from "@radix-ui/react-label";
import BookCard from "./BookCard";
import { BookHeart } from "lucide-react";
import { useFavoritesStore } from "@/States/useFavoriteState";
import { useState } from "react";
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
      <Label className="text-5xl m-5 flex items-center gap-3">
        <BookHeart size={36}></BookHeart>Favoriten
      </Label>
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
          <h2 className="text-2xl font-bold ml-5 bg-gray-200 pl-6 rounded-br-full">
            Ihre Favoriten
          </h2>
          {filteredFavorites.length === 0 ? (
            <Label className="text-2xl m-5 flex items-center gap-3">
              Keine Favoriten hinzugefügt
            </Label>
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
        <div className="flex-1 border-1 border-gray-300 p-5 rounded-2xl shadow-lg">
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
export default FavoriteList;
