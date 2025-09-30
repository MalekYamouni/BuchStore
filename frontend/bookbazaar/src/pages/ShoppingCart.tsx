import { useEffect, useMemo, useState } from "react";
import ShoppingCartCard from "../components/ShoppingCartCard";
import "../styles/totalPrice.css";
import { useCartStore } from "@/States/useCartState";
import { Label } from "@radix-ui/react-label";
import { GlassesIcon, ShoppingBasket } from "lucide-react";
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
import { useNavigate } from "react-router-dom";
import useCart from "@/hooks/useCart";
import SectionHeader from "@/components/SectionHeader";

function ShoppingCart() {
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const { buyBooksMutation } = useBooks();
  const { getuserById } = useUsers();
  
  const userBalance = getuserById.data?.balance;
  const navigate = useNavigate();
  const shoppingCart = useCartStore((s) => s.shoppingCart);
  const addLocal = useCartStore((s) => s.addToCart);
  const removeLocal = useCartStore((s) => s.removeFromCart);
  const updateQuantityLocal = useCartStore((s) => s.updateQuantity);
  const { data: serverCart, isLoading, error, removeFromCart } = useCart();

  useEffect(() => {
    if (serverCart && Array.isArray(serverCart)) {
      useCartStore.setState({ shoppingCart: serverCart });
    }
  }, [serverCart]);

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

  if(isLoading) return <div>Warenkorb wird geladen...</div>
  if(error) return <div>Fehler beim Laden des Warenkorbs...</div>
  return (
    <div className="flex flex-col gap-5 p-5">
      <SectionHeader
        title="Warenkorb"
        variant="cart"
        icon={<ShoppingBasket size={20} />}
        right={<span>Guthaben: {userBalance ?? 0} €</span>}
      />
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
      <div className="ml-5">
        <div className="w-120">
          <SectionHeader title="Ihre Artikel" />
        </div>
      </div>
      {filteredCart.length === 0 ? (
        <Label className="text-2xl m-5 flex items-center gap-3">
          Keine Artikel hinzugefügt
        </Label>
      ) : (
        filteredCart.map((book) => (
          <ShoppingCartCard
            key={book.id}
            book={book}
            onRemove={async (bookId) => {
              removeLocal(bookId);
              try {
                await removeFromCart.mutateAsync(bookId);
              } catch (err) {
                addLocal(book);
                console.error("Fehler beim Entfernen aus Warenkorb:", err);
              }
            }}
            onQtyChange={(bookId, delta) => {
              updateQuantityLocal(bookId, delta);
            }}
          />
        ))
      )}
      <div className="flex justify-center items-center font-bold text-2xl rounded-4xl bg-gray-300 max-w-3xl w-full mx-auto hover:underline ">
        {filteredCart.length > 0 && (
          <Button className="w-full rounded-4xl" onClick={handleBuyAll}>
            <ShoppingBasket className="w-full"></ShoppingBasket>
          </Button>
        )}
      </div>
      <div className="flex justify-center items-center font-bold text-2xl rounded-4xl bg-gray-300 max-w-3xl w-full mx-auto hover:underline ">
        {totalPrice === 0 ? (
          <span
            onClick={() => navigate("/books")}
            className="flex items-center gap-3 cursor-pointer hover:underline"
          >
            Stöber Sie hier<GlassesIcon></GlassesIcon>
          </span>
        ) : (
          <h2>Gesamtpreis {totalPrice.toFixed(2)}€</h2>
        )}
      </div>
    </div>
  );
}

export default ShoppingCart;
