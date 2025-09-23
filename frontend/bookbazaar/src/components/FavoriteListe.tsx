import { Label } from "@radix-ui/react-label";
import BookCard from "./BookCard";
import { BookHeart } from "lucide-react";
import { useFavoritesStore } from "@/hooks/useFavorite";
import { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Input } from "./ui/input";

function FavoriteList() {
  const { favorites } = useFavoritesStore();
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");

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
    <div className="flex flex-col gap-5">
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
          />
        ))
      )}
    </div>
  );
}
export default FavoriteList;
