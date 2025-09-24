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
import { useAuthStore } from "@/hooks/userAuth";

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
    <div className="bg-[#333] flex flex-col items-center justify-items-start min-h-screen ">
      <form
        className="bg-gray-200 p-6 rounded-xl shadow-lg flex flex-col gap-4 w-full max-w-md brd mt-50"
        onSubmit={handleNewBookSubmit(onNewBookSubmit)}
      >
        <Input
          {...registerNewBook("name", {
            required: "Name ist Pflicht",
            minLength: { value: 3, message: "Mindestens 3 Zeichen" },
          })}
          type="text"
          placeholder="Name"
          className="border border-gray-500"
        />
        {newBookErrors.name && (
          <p className="text-red-500 text-sm">{newBookErrors.name.message}</p>
        )}
        <Input
          {...registerNewBook("author", {
            required: "Autor ist Pflicht",
            minLength: { value: 3, message: "Mindestens 3 Zeichen" },
          })}
          type="text"
          placeholder="Autor"
          className="border border-gray-500"
        />
        {newBookErrors.author && (
          <p className="text-red-500 text-sm">{newBookErrors.author.message}</p>
        )}
        <Input
          {...registerNewBook("price", {
            required: "Preis ist Pflicht",
            valueAsNumber: true,
            min: {
              value: 0.01,
              message: "Preis muss größer als 0.00 € sein",
            },
          })}
          placeholder="Preis"
          type="number"
          className="border border-gray-500"
          step={0.01}
          min="0"
        />
        {newBookErrors.price && (
          <p className="text-red-500 text-sm">{newBookErrors.price.message}</p>
        )}
        <Input
          {...registerNewBook("borrowPrice", {
            required: "Leihpreis ist Pflicht",
            valueAsNumber: true,
            min: {
              value: 0.01,
              message: "Preis muss größer als 0.00 € sein",
            },
          })}
          placeholder="Leihpreis"
          type="number"
          className="border border-gray-500"
          step={0.01}
          min="0"
        />
        {newBookErrors.borrowPrice && (
          <p className="text-red-500 text-sm">
            {newBookErrors.borrowPrice.message}
          </p>
        )}
        <Controller
          control={control}
          name="genre"
          rules={{ required: "Genre ist Pflicht" }}
          render={({ field }) => (
            <Select
              onValueChange={(value) => field.onChange(value)}
              value={field.value || ""}
            >
              <SelectTrigger className="w-full border border-gray-500">
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
          {...registerNewBook("description", {
            required: "Beschreibung ist Pflicht",
            minLength: { value: 3, message: "Mindestens 3 Zeichen" },
          })}
          placeholder="Kurzbeschreibung"
          type="text"
          className="border h-25 border-gray-500"
        />
        {newBookErrors.description && (
          <p className="text-red-500 text-sm">
            {newBookErrors.description.message}
          </p>
        )}
        <Input
          {...registerNewBook("descriptionLong", {
            required: "Beschreibung ist Pflicht",
            minLength: { value: 3, message: "Mindestens 3 Zeichen" },
          })}
          placeholder="Beschreibung"
          type="text"
          className="border h-50 border-gray-500"
        />
        {newBookErrors.descriptionLong && (
          <p className="text-red-500 text-sm">
            {newBookErrors.descriptionLong.message}
          </p>
        )}
        <Button type="submit">Buch hinzufügen 📘</Button>
        {errorMessage && (
          <p className="text-red-500 text-sm font-medium">{errorMessage}</p>
        )}
      </form>
    </div>
  );
}
export default AddBook;
