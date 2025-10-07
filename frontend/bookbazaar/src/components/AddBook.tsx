import "../styles/AddBook.css";
import useBooks from "@/hooks/useBooks";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Controller, useForm } from "react-hook-form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { useState } from "react";
import { useAuthStore } from "@/States/userAuthState";
import SectionHeader from "./SectionHeader";

interface NewBook {
  name: string;
  author: string;
  price: number;
  genre: string;
  description: string;
  descriptionLong: string;
  quantity: number;
  isBorrowed: false;
  borrowPrice: number;
}

function AddBook() {
  const { addNewBook } = useBooks();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const isAdmin = useAuthStore((s) => s.isAdmin());

  const {
    register: registerNewBook,
    handleSubmit: handleNewBookSubmit,
    formState: { errors: newBookErrors },
    control,
    reset,
  } = useForm<NewBook>({
    defaultValues: { genre: "" },
  });

  const onNewBookSubmit = async (data: NewBook) => {
    const newBook: NewBook = {
      name: data.name,
      author: data.author,
      genre: data.genre,
      description: data.description,
      price: data.price,
      descriptionLong: data.descriptionLong,
      quantity: 1,
      isBorrowed: false,
      borrowPrice: data.borrowPrice,
    };

    try {
      await addNewBook.mutateAsync(newBook);
      setErrorMessage(null);
      reset();
    } catch (err: any) {
      setErrorMessage(err.message);
      reset();
    }
  };
  if (!isAdmin) {
    return (
      <div className="text-red-500 text-center mt-10">
        Nur Administratoren können Bücher hinzufügen.
      </div>
    );
  }
  return (
    <div className="min-h-screen p-6 bg-background">
      <div className="max-w-4xl mx-auto">
        <SectionHeader title="Buch hinzufügen" subtitle="Fülle die Felder aus, um ein neues Buch zur Bibliothek hinzuzufügen." />

  <div className="mt-4 bg-card text-foreground backdrop-blur-sm border border-border rounded-2xl shadow-md p-6">
          <form className="flex flex-col gap-4" onSubmit={handleNewBookSubmit(onNewBookSubmit)}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                {...registerNewBook("name", { required: "Name ist Pflicht", minLength: { value: 3, message: "Mindestens 3 Zeichen" } })}
                type="text"
                placeholder="Titel"
                className="w-full"
              />
        {newBookErrors.name && (
          <p className="text-red-500 text-sm">{newBookErrors.name.message}</p>
        )}
              <Input
                {...registerNewBook("author", { required: "Autor ist Pflicht", minLength: { value: 3, message: "Mindestens 3 Zeichen" } })}
                type="text"
                placeholder="Autor"
                className="w-full"
              />
        {newBookErrors.author && (
          <p className="text-red-500 text-sm">{newBookErrors.author.message}</p>
        )}
              <Input
                {...registerNewBook("price", { required: "Preis ist Pflicht", valueAsNumber: true, min: { value: 0.01, message: "Preis muss größer als 0.00 € sein" } })}
                placeholder="Preis (€)"
                type="number"
                className="w-full"
                step={0.01}
                min="0"
              />
        {newBookErrors.price && (
          <p className="text-red-500 text-sm">{newBookErrors.price.message}</p>
        )}
              <Input
                {...registerNewBook("borrowPrice", { required: "Leihpreis ist Pflicht", valueAsNumber: true, min: { value: 0.01, message: "Preis muss größer als 0.00 € sein" } })}
                placeholder="Leihpreis (€)"
                type="number"
                className="w-full"
                step={0.01}
                min="0"
              />
        {newBookErrors.borrowPrice && (
          <p className="text-red-500 text-sm">
            {newBookErrors.borrowPrice.message}
          </p>
        )}
            </div>

            <Controller
          control={control}
          name="genre"
          rules={{ required: "Genre ist Pflicht" }}
          render={({ field }) => (
            <Select
              onValueChange={(value) => field.onChange(value)}
              value={field.value || ""}
            >
                  <SelectTrigger className="w-full">
                <SelectValue placeholder="Genre auswählen" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Romance">Romance</SelectItem>
                <SelectItem value="Action">Action</SelectItem>
                <SelectItem value="Thriller">Thriller</SelectItem>
                <SelectItem value="Fantasy">Fantasy</SelectItem>
              </SelectContent>
            </Select>
          )}
        />
        {newBookErrors.genre && (
          <p className="text-red-500 text-sm">{newBookErrors.genre.message}</p>
        )}
            <Input
              {...registerNewBook("description", { required: "Beschreibung ist Pflicht", minLength: { value: 3, message: "Mindestens 3 Zeichen" } })}
              placeholder="Kurzbeschreibung"
              type="text"
              className="w-full"
            />
        {newBookErrors.description && (
          <p className="text-red-500 text-sm">
            {newBookErrors.description.message}
          </p>
        )}
            <Input
              {...registerNewBook("descriptionLong", { required: "Beschreibung ist Pflicht", minLength: { value: 3, message: "Mindestens 3 Zeichen" } })}
              placeholder="Ausführliche Beschreibung"
              type="text"
              className="w-full h-32"
            />
        {newBookErrors.descriptionLong && (
          <p className="text-red-500 text-sm">
            {newBookErrors.descriptionLong.message}
          </p>
        )}
            <div className="flex items-center justify-between gap-4 mt-4">
              <div />
              <div className="flex items-center gap-3">
                <Button type="submit">Buch hinzufügen</Button>
              </div>
            </div>

            {errorMessage && <p className="text-red-500 text-sm font-medium mt-2">{errorMessage}</p>}
          </form>
        </div>
      </div>
    </div>
  );
}
export default AddBook;
