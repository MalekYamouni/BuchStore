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
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { useAutoLogin } from "@/hooks/userAutoLogin";

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
  const passwordRegex =
    /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_\-+=<>?{}[\]~])[A-Za-z\d!@#$%^&*()_\-+=<>?{}[\]~]{8,}$/;

  useAutoLogin("/home");

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
            <CardTitle className="text-lg font-semibold">
              Registrieren
            </CardTitle>
          </CardHeader>
          <form
            onSubmit={handleRegisterSubmit(onSubmitRegistration)}
            className="flex-1 flex flex-col"
          >
            <CardContent className="flex-1">
              <div className="space-y-4">
                <Input
                  {...registerRegisterForm("name", {
                    required: "Vorname ist erforderlich",
                    minLength: {
                      value: 4,
                      message: "Name muss mindestens 4 Zeichen beinhalten",
                    },
                  })}
                  className="bg-background text-foreground border-border placeholder:text-muted-foreground focus:bg-background"
                  placeholder="Vorname"
                />
                {registerErrors.name && (
                  <p className="text-red-500 text-sm">
                    {registerErrors.name.message}
                  </p>
                )}
                <Input
                  {...registerRegisterForm("lastname", {
                    required: "Nachname ist erforderlich",
                    minLength: {
                      value: 4,
                      message: "Nachname muss mindestens 4 Zeichen beinhalten",
                    },
                  })}
                  className="bg-background text-foreground border-border placeholder:text-muted-foreground focus:bg-background"
                  placeholder="Nachname"
                />
                {registerErrors.lastname && (
                  <p className="text-red-500 text-sm">
                    {registerErrors.lastname.message}
                  </p>
                )}
                <Input
                  {...registerRegisterForm("email", {
                    required: "Email ist erforderlich",
                  })}
                  className="bg-background text-foreground border-border placeholder:text-muted-foreground focus:bg-background"
                  placeholder="Email"
                  type="email"
                />
                <Input
                  {...registerRegisterForm("username", {
                    required: "Username ist erforderlich",
                    minLength: {
                      value: 5,
                      message: "Username muss mindestens 5 Zeichen beinhalten",
                    },
                  })}
                  className="bg-background text-foreground border-border placeholder:text-muted-foreground focus:bg-background"
                  placeholder="Username"
                />
                {registerErrors.username && (
                  <p className="text-red-500 text-sm">
                    {registerErrors.username.message}
                  </p>
                )}{" "}
                <Input
                  {...registerRegisterForm("password", {
                    required: "Passwort erforderlich",
                    pattern: {
                      value: passwordRegex,
                      message:
                        "Passwort muss mindestens 8 Zeichen, einen Großbuchstaben, eine Zahl und ein Sonderzeichen enthalten",
                    },
                  })}
                  className="bg-background text-foreground border-border placeholder:text-muted-foreground focus:bg-background"
                  placeholder="Passwort"
                  type="password"
                />
                {registerErrors.password && (
                  <p className="text-red-500 text-sm">
                    {registerErrors.password.message}
                  </p>
                )}
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
                className="bg-background text-foreground border-border placeholder:text-muted-foreground focus:bg-background"
                {...registerLoginForm("username", { required: "Bitte geben Sie Ihren Usernamen ein" })}
              />
              {loginError.username && (
                <p className="text-red-500">{loginError.username}</p>
              )}
              <Input
                placeholder="Passwort"
                type="password"
                className="bg-background text-foreground border-border placeholder:text-muted-foreground focus:bg-background"
                {...registerLoginForm("password", { required: "Bitte geben Sie Ihr Passwort ein" })}
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
