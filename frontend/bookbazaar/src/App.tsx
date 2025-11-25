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
import { useEffect } from "react";
import { tryAutoLogin } from "./lib/auth";
import { UserProfile } from "./pages/UserProfile";
import { ModeToggle } from "./components/ui/mode-toggle";
import UserHistory from "./pages/UserOrderHistory";

function App() {
  useEffect(() => {
    tryAutoLogin();
  }, []);

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
          path="/borrowBooks"
          element={
            <ProtectedRoute>
              <BorrowBooks />
            </ProtectedRoute>
          }
        ></Route>
        <Route
          path="/userProfile"
          element={
            <ProtectedRoute>
              <UserProfile />
            </ProtectedRoute>
          }
        ></Route>
        <Route
          path="/userHistory"
          element={
            <ProtectedRoute>
              <UserHistory />
            </ProtectedRoute>
          }
        ></Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
