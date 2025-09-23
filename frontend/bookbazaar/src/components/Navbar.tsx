import { Link, useLocation } from "react-router-dom";
import "../styles/NavBar.css";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
} from "@radix-ui/react-navigation-menu";
import { LogIn, LogOut, UserRound, UserRoundX } from "lucide-react";
import { useAuthStore } from "@/hooks/userAuth";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@radix-ui/react-dropdown-menu";

function NavBar() {
  const location = useLocation();
  const { isLoggedIn, logout } = useAuthStore();
  return (
    <div>
      <NavigationMenu>
        <NavigationMenuItem className="flex gap-50 p-5 text-lg font-semibold">
          {isLoggedIn ? (
            ""
          ) : (
            <NavigationMenuLink asChild>
              <Link
                className={location.pathname === "/users" ? "active" : ""}
                to="/users"
              >
                Login
              </Link>
            </NavigationMenuLink>
          )}

          <NavigationMenuLink asChild>
            <Link
              className={location.pathname === "/home" ? "active" : ""}
              to="/home"
            >
              Home
            </Link>
          </NavigationMenuLink>
          <NavigationMenuLink asChild>
            <Link
              className={location.pathname === "/favorites" ? "active" : ""}
              to="/favorites"
            >
              Favoriten
            </Link>
          </NavigationMenuLink>
          <NavigationMenuLink asChild>
            <Link
              className={location.pathname === "/add" ? "active" : ""}
              to="/add"
            >
              Erstellen
            </Link>
          </NavigationMenuLink>
          <NavigationMenuLink asChild>
            <Link
              className={location.pathname === "/cart" ? "active" : ""}
              to="/cart"
            >
              Warenkorb
            </Link>
          </NavigationMenuLink>
          <NavigationMenuLink asChild>
            <Link
              className={location.pathname === "/borrowBooks" ? "active" : ""}
              to="/borrowBooks"
            >
              Verleih
            </Link>
          </NavigationMenuLink>
        </NavigationMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="px-3 py-2 bg-gray-200 rounded-4xl">
              <UserRound></UserRound>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-60 h-50 p-3 bg-white shadow-md rounded flex flex-col gap-2">
            <DropdownMenuLabel className="bg-gray-200">
              Mein Konto
            </DropdownMenuLabel>
            <DropdownMenuItem>Profil</DropdownMenuItem>
            <DropdownMenuItem>Einstellungen</DropdownMenuItem>
            {isLoggedIn == true ? (
              <DropdownMenuItem
                onClick={logout}
                className="flex items-center justify-between"
              >
                Logout<LogOut></LogOut>
              </DropdownMenuItem>
            ) : (
              ""
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </NavigationMenu>
    </div>
  );
}

export default NavBar;
