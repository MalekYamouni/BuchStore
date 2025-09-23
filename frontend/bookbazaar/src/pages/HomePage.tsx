import BookList from "../components/BooksList";
import useBooks from "@/hooks/useBooks";

function HomePage() {
  const { isLoading, error} = useBooks();

  if (isLoading) return <p>Lade Bücher...</p>;
  if (error) return <p>{error.message}</p>;

  return (
    <div>
      <BookList
      />
    </div>
  );
}

export default HomePage;
