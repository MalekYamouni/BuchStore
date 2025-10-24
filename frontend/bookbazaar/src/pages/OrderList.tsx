import OrderCard from "@/components/OrderCard";
import useOrderedBooks from "@/hooks/useOrderedBooks";
import { Label } from "@radix-ui/react-label";

export function OrderList() {
  const { data: orderedBooks } = useOrderedBooks();

  return (
    <div className="flex flex-col gap-4">
      {!orderedBooks || orderedBooks.length === 0 ? (
        <Label className="text-base text-muted-foreground">
          Keine Bestellungen vorhanden
        </Label>
      ) : (
        orderedBooks.map((book) => (
          <div key={book.id} className="relative">
            {/* gleiche Card-Optik wie links */}
            <OrderCard book={book} onRemove={() => {}} onQtyChange={() => {}} />
            {/* Badge mit Kaufmenge (Fallback 1) */}
            <span className="absolute top-2 right-2 rounded-full bg-muted text-foreground border border-border px-3 py-1 text-sm">
              x{book.orderedQuantity ??  1} gekauft
            </span>
          </div>
        ))
      )}
    </div>
  );
}
