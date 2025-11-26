import SectionHeader from "@/components/SectionHeader";
import { Card, CardContent } from "@/components/ui/card";
import useOrderedBooks from "@/hooks/useOrderedBooks";
import { BookImage } from "lucide-react";
import { useMemo } from "react";

export default function UserHistory() {
  const { data: books } = useOrderedBooks();

  const orders = useMemo(() => {
    return (books ?? []).flatMap((b) => {
      const count = b.orderedQuantity ?? 1;
      return Array.from({ length: count }, (_, i) => ({ book: b, idx: i }));
    });
  }, [books]);

  return (
    <div className="p-5">
      <SectionHeader title="Bestellverlauf" icon={<BookImage size={20} />} />
      <Card className="mt-4">
        <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 py-6">
          {orders.length === 0 ? (
            <div className="text-muted-forground">
              Keine Bestellungen vorhanden
            </div>
          ) : (
            orders.map(({ book, idx }) => (
              <div
                key={`${book.id}-${idx}`}
                className="border border-border rounded-xl p-4 bg-card"
              >
                <div className="font-semibold">{book.name}</div>
                <div className="text-sm text-muted-foreground">
                  Autor: {book.author}
                </div>
                <div className="text-sm text-muted-foreground">
                  Genre: {book.genre}
                </div>
                <div className="text-sm text-muted-foreground">
                  Preis: {book.price} €
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
