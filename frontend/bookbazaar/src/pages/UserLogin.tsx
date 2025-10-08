import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useAuthStore } from "@/States/userAuthState";
import useUsers from "@/hooks/useUser";
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { tryAutoLogin } from "@/lib/auth";

export interface UserRegistration {
  name: string;
  lastname: string;
  username: string;
  email: string;
  password: string;
}

export interface UserLogin {
  username: string;
  password: string;
}

export default function UserLogin() {
  const { addNewUser } = useUsers();
  const [showRegister, setShowRegister] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuthStore();
  const [loginError, setLoginError] = useState({ username: "", password: "" });

  // Beim Mount versuchen, automatisch einzuloggen
  useEffect(() => {
    tryAutoLogin().then((ok) => {
      if (ok) navigate("/home"); // User bleibt eingeloggt
    });
  }, []);

  const {
    register: registerRegisterForm,
    handleSubmit: handleRegisterSubmit,
    formState: { errors: registerErrors },
  } = useForm<UserRegistration>();

  const {
    register: registerLoginForm,
    handleSubmit: handleLoginSubmit,
    formState: { errors: loginErrors },
  } = useForm<UserLogin>();

  const onSubmitRegistration = (data: UserRegistration) => {
    const newUser: UserRegistration = {
      name: data.name,
      lastname: data.lastname,
      username: data.username,
      email: data.email,
      password: data.password,
    };

    setShowRegister(false);
    addNewUser.mutate(newUser);
  };

  const onSubmitLogin = async (data: UserLogin) => {
    try {
      const res = await fetch("http://localhost:8080/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include", // HttpOnly Cookie wird gesendet
        body: JSON.stringify({
          username: data.username,
          password: data.password,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        setLoginError({ username: errorData.error, password: "" });
        return;
      }

      const responseData = await res.json();
      const token = responseData.access_token;
      const userId = responseData.userId;
      const role = responseData.role;

      if (!token) {
        setLoginError({ username: "Token nicht erhalten", password: "" });
        return;
      }

      login(token, userId, role); // Zustand wird gesetzt
      navigate("/home");
    } catch (err) {
      console.error("Login-Fehler", err);
      setLoginError({ username: "Login fehlgeschlagen", password: "" });
    }
  };

  if (showRegister) {
    return (
      <div className="min-h-screen bg-background text-foreground grid place-items-center px-4">
        <Card className="w-full max-w-md bg-card border border-border rounded-2xl shadow-md min-h-[30rem] flex flex-col">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Registrieren</CardTitle>
          </CardHeader>
          <form
            onSubmit={handleRegisterSubmit(onSubmitRegistration)}
            className="flex-1 flex flex-col"
          >
            <CardContent className="flex-1">
              <div className="space-y-4">
                <Input
                  {...registerRegisterForm("name", { required: true })}
                  placeholder="Vorname"
                />
                <Input
                  {...registerRegisterForm("lastname", { required: true })}
                  placeholder="Nachname"
                />
                <Input
                  {...registerRegisterForm("email", { required: true })}
                  placeholder="Email"
                  type="email"
                />
                <Input
                  {...registerRegisterForm("username", { required: true })}
                  placeholder="Username"
                />
                <Input
                  {...registerRegisterForm("password", { required: true })}
                  placeholder="Passwort"
                  type="password"
                />
              </div>
            </CardContent>
            <CardFooter className="flex flex-col gap-3 pt-4">
              <Button
                type="submit"
                className="w-full bg-muted text-foreground border border-border hover:bg-muted/80"
              >
                Registrieren
              </Button>
              <Button
                type="button"
                onClick={() => setShowRegister(false)}
                variant="outline"
                className="w-full bg-muted text-foreground border border-border hover:bg-muted/80"
              >
                Zurück
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground grid place-items-center px-4">
      {/* Login: kompakter, keine min-h, kein flex-stretching */}
      <Card className="w-full max-w-md bg-card border border-border rounded-2xl shadow-md">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Anmeldung</CardTitle>
        </CardHeader>
        <form
          onSubmit={handleLoginSubmit(onSubmitLogin)}
          className="flex flex-col"
        >
          <CardContent>
            <div className="flex flex-col space-y-4">
              <Input
                placeholder="Username"
                {...registerLoginForm("username", { required: true })}
              />
              {loginError.username && (
                <p className="text-red-500">{loginError.username}</p>
              )}
              <Input
                placeholder="Passwort"
                type="password"
                {...registerLoginForm("password", { required: true })}
              />
              {loginError.password && (
                <p className="text-red-500">{loginError.password}</p>
              )}
            </div>
          </CardContent>
          {/* Einheiltiche Abstände der Buttons */}
          <CardFooter className="flex flex-col gap-3 pt-4">
            <Button
              type="submit"
              className="w-full bg-muted text-foreground border border-border hover:bg-muted/80"
            >
              Anmelden
            </Button>
            <Button
              onClick={() => setShowRegister(true)}
              variant="outline"
              className="w-full bg-muted text-foreground border border-border hover:bg-muted/80"
            >
              Registrieren
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
