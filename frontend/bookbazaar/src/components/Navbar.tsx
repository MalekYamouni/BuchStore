import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import "../styles/NavBar.css";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
} from "@radix-ui/react-navigation-menu";
import { LogOut, UserRound } from "lucide-react";
import { useAuthStore } from "@/States/userAuthState";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { logout } from "@/lib/auth";
import { ModeToggle } from "./ui/mode-toggle";

function NavBar() {
  const location = useLocation();
  const navigate = useNavigate();
  const isLoggedIn = useAuthStore((s) => s.isLoggedIn);
  const userProfileNav = () => {
    navigate("/userProfile");
  };

  const isAdmin = useAuthStore((s) => s.isAdmin());
  return (
    <div className="sticky top-0 z-50">
      <NavigationMenu className="hover:cursor-default w-full bg-muted border-b border-border">
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
          {isAdmin && (
            <NavigationMenuLink asChild>
              <Link
                className={location.pathname === "/add" ? "active" : ""}
                to="/add"
              >
                Erstellen
              </Link>
            </NavigationMenuLink>
          )}
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
            <button className="px-3 py-2 bg-muted text-foreground hover:bg-muted/80 active:bg-muted/70 border border-border rounded-4xl transition-colors">
              <UserRound></UserRound>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-60 h-50 p-3 dropdown-over">
            <DropdownMenuLabel className="bg-muted text-muted-foreground">
              Mein Konto
            </DropdownMenuLabel>
            <DropdownMenuItem className="hover:bg-muted hover:text-foreground" onClick={userProfileNav}>Profil</DropdownMenuItem>
            <DropdownMenuItem className="hover:bg-muted hover:text-foreground">Einstellungen</DropdownMenuItem>
            {isLoggedIn == true ? (
              <DropdownMenuItem
                onClick={() => logout()}
                className="flex items-center justify-between hover:bg-muted hover:text-foreground"
              >
                Logout<LogOut></LogOut>
              </DropdownMenuItem>
            ) : (
              ""
            )}
          </DropdownMenuContent>
        </DropdownMenu>
        <ModeToggle />
      </NavigationMenu>
    </div>
  );
}

export default NavBar;
