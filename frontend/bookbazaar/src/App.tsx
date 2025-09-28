import "./App.css";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import NavBar from "./components/Navbar";
import HomePage from "./pages/HomePage";
import ShoppingCart from "./pages/ShoppingCart";
import FavoritePage from "./pages/FavoritePage";
import AddBookPage from "./pages/AddBookPage";
import UserLogin from "./pages/UserLogin";
import ProtectedRoute from "./States/protectedRoute";
import BorrowBooks from "./pages/BorrowPage";

function App() {
  return (
    <BrowserRouter>
      <NavBar />
      <Routes>
        <Route path="/" element={<Navigate to="/users" replace />} />
        <Route path="/users" element={<UserLogin />} />
        <Route
          path="/home"
          element={
            <ProtectedRoute>
              <HomePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/add"
          element={
            <ProtectedRoute>
              <AddBookPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/favorites"
          element={
            <ProtectedRoute>
              <FavoritePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/cart"
          element={
            <ProtectedRoute>
              <ShoppingCart />
            </ProtectedRoute>
          }
        />
        <Route
          path="borrowBooks"
          element={
            <ProtectedRoute>
              <BorrowBooks />
            </ProtectedRoute>
          }
        ></Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
