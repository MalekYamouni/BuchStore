import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useAuthStore } from "@/hooks/userAuth";
import useUsers from "@/hooks/useUser";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";

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

function UserLogin() {
  const { isLoading, error, addNewUser } = useUsers();
  const [showRegister, setShowRegister] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuthStore();
  const [loginError, setLoginError] = useState({ username: "", password: "" });

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

    console.log(JSON.stringify(newUser, null, 2));
    setShowRegister(false);
    addNewUser.mutate(newUser);
  };

  const onSubmitLogin = async (data: UserLogin) => {
    try {
      const res = await fetch("http://localhost:8080/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
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
      const token = responseData.token;
      const userId = responseData.userId;
      const role = responseData.role;

      if (!token) {
        setLoginError({ username: "Token nicht erhalten", password: "" });
        return;
      }

      login(token, userId, role);
      localStorage.setItem("authToken", token);
      localStorage.setItem("userId", String(userId));
      navigate("/home");
    } catch (err) {
      console.error("Login-Fehler", err);
      setLoginError({ username: "Login fehlgeschlagen", password: "" });
    }
  };

  if (isLoading) return <p>Lade Benutzer</p>;
  if (error) return <p>Fehler: {error.message}</p>;
  if (showRegister) {
    return (
      <div className="flex p-40 justify-center min-h-screen bg-gray-100">
        <Card
          className="w-120 h-150 ml-5 display-flex justify-center
     shadow-lg rounded-2xl hover:scale-105 transition-transform duration-300 gap-5"
        >
          <CardHeader>
            <CardTitle className="text-lg fron-semibold leading-none tracking-tight">
              Registrieren
            </CardTitle>
          </CardHeader>
          <form onSubmit={handleRegisterSubmit(onSubmitRegistration)}>
            <CardContent>
              <div className="space-y-4">
                <Input
                  {...registerRegisterForm("name", {
                    required: "Vorname ist Pflicht",
                    minLength: { value: 3, message: "Mindestens 3 Zeichen" },
                  })}
                  placeholder="Vorname"
                  type="text"
                ></Input>
                {registerErrors.name && (
                  <p className="text-red-500 text-sm">
                    {registerErrors.name.message}
                  </p>
                )}
                <Input
                  {...registerRegisterForm("lastname", {
                    required: "Nachname ist Pflicht",
                    minLength: { value: 3, message: "Mindestens 3 Zeichen" },
                  })}
                  type="text"
                  placeholder="Nachname"
                ></Input>
                {registerErrors.lastname && (
                  <p className="text-red-500 text-sm">
                    {registerErrors.lastname.message}
                  </p>
                )}
                <Input
                  {...registerRegisterForm("email", {
                    required: "E-Mail ist Pflicht",
                    pattern: {
                      value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                      message: "Ungültige E-Mail",
                    },
                  })}
                  type="email"
                  placeholder="Email"
                ></Input>
                {registerErrors.email && (
                  <p className="text-red-500 text-sm">
                    {registerErrors.email.message}
                  </p>
                )}
                <Input
                  {...registerRegisterForm("username", {
                    required: "Username ist Pflicht",
                    minLength: { value: 3, message: "Mindestens 3 Zeichen" },
                  })}
                  type="text"
                  placeholder="Username"
                ></Input>
                {registerErrors.username && (
                  <p className="text-red-500 text-sm">
                    {registerErrors.username.message}
                  </p>
                )}
                <Input
                  {...registerRegisterForm("password", {
                    required: "Passwort ist Pflicht",
                    minLength: { value: 6, message: "Mindestens 6 Zeichen" },
                    pattern: {
                      value: /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d).{6,}$/,
                      message:
                        "Passwort muss mindestens 6 Zeichen, 1 Großbuchstabe und 1 Zahl enthalten",
                    },
                  })}
                  type="password"
                  placeholder="Passwort"
                ></Input>
                {registerErrors.password && (
                  <p className="text-red-500 text-sm">
                    {registerErrors.password.message}
                  </p>
                )}
              </div>
            </CardContent>
            <CardFooter className="flex justify-start gap-3 pt-3">
              <Button type="submit">Registrieren</Button>
              <Button onClick={() => setShowRegister(false)}>Zurück</Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex p-40 justify-center min-h-screen bg-gray-100">
      <Card
        className="w-120 h-70 ml-5 display-flex justify-center
     shadow-lg rounded-2xl hover:scale-105 transition-transform duration-300 gap-5"
      >
        <CardHeader>
          <CardTitle className="text-lg fron-semibold leading-none tracking-tight">
            Anmeldung
          </CardTitle>
        </CardHeader>
        <form onSubmit={handleLoginSubmit(onSubmitLogin)}>
          <CardContent>
            <div className="flext flex-col space-y-4">
              <Input
                placeholder="Username"
                {...registerLoginForm("username", {
                  required: "Username bitte eingeben",
                })}
              />
              {loginErrors.username && (
                <p className="text-red-500 text-sm">
                  {loginErrors.username.message}
                </p>
              )}
              {loginError && (
                <p className="text-red-500">{loginError.username}</p>
              )}

              <Input
                placeholder="Passwort"
                type="password"
                {...registerLoginForm("password", {
                  required: "Passwort bitte eingeben",
                })}
              />
              {loginErrors.password && (
                <p className="text-red-500 text-sm">
                  {loginErrors.password.message}
                </p>
              )}
              {loginError && (
                <p className="text-red-500">{loginError.password}</p>
              )}
            </div>
          </CardContent>
          <CardFooter className="flex justify-start gap-3 pt-3">
            <Button type="submit">Anmelden</Button>
            <Button onClick={() => setShowRegister(true)}>Registrieren</Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}

export default UserLogin;
