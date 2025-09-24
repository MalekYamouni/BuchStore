import { useMemo, useState } from "react";
import ShoppingCartCard from "../components/ShoppingCartCard";
import "../styles/totalPrice.css";
import { useCartStore } from "@/hooks/useCart";
import { Label } from "@radix-ui/react-label";
import { CreditCard, GlassesIcon, ShoppingBasket } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import useBooks from "@/hooks/useBooks";
import { Button } from "@/components/ui/button";
import useUsers from "@/hooks/useUser";

function ShoppingCart() {
  const { shoppingCart } = useCartStore();
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const { buyBooksMutation } = useBooks();
  const { data: getuserById } = useUsers();
  const userBalance = getuserById?.balance;

  const handleBuyAll = async () => {
    const purchases = shoppingCart.map((book) => ({
      bookId: book.id,
      quantity: book.quantityCart ?? 1,
    }));

    console.log("Daten an Backend:", { purchases });
    await buyBooksMutation.mutateAsync({ purchases });
  };

  const filteredCart = shoppingCart.filter((book) => {
    if (filter !== "all" && book.genre !== filter) {
      return false;
    }

    if (search) {
      const term = search.toLowerCase();

      return (
        book.genre.toLowerCase() === term ||
        book.name.toLowerCase().includes(term) ||
        book.author.toLowerCase().includes(term) ||
        book.description.toLowerCase().includes(term)
      );
    }
    return true;
  });

  const totalPrice = useMemo(
    () =>
      shoppingCart.reduce(
        (sum, book) => (sum += book.price * (book.quantityCart ?? 1)),
        0
      ),
    [shoppingCart]
  );

  return (
    <div className="flex flex-col gap-5 p-5">
      <Label className="text-5xl m-5 flex items-center gap-3">
        <ShoppingBasket size={36}></ShoppingBasket>Warenkorb
      </Label>
      <Label className="text-2xl m-5 flex items-center gap-3">
        <CreditCard className="inlineblock"></CreditCard>{" "}
        <span>Guthaben : {userBalance} €</span>
      </Label>
      <div className="text-2xl m-5 flex items-center gap-3">
        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Filter auswählen" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Alle</SelectItem>
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
      {filteredCart.map((book) => (
        <ShoppingCartCard key={book.id} book={book} />
      ))}
      <div className="flex justify-center items-center w-5xl pl-5">
        {filteredCart.length > 0 && (
          <Button onClick={handleBuyAll}>
            <ShoppingBasket className="w-3xl"></ShoppingBasket>
          </Button>
        )}
      </div>
      <div className="total-price">
        {totalPrice === 0 ? (
          <p>
            Stöber Sie hier<GlassesIcon></GlassesIcon>
          </p>
        ) : (
          <h2>Gesamtpreis {totalPrice.toFixed(2)}€</h2>
        )}
      </div>
    </div>
  );
}

export default ShoppingCart;
