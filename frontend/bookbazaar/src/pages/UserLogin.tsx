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

function UserLogin() {
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
      <div className="flex p-40 justify-center min-h-screen bg-gray-100">
        <Card className="w-120 h-150 shadow-lg rounded-2xl hover:scale-105 transition-transform duration-300 gap-5">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Registrieren</CardTitle>
          </CardHeader>
          <form onSubmit={handleRegisterSubmit(onSubmitRegistration)}>
            <CardContent>
              <div className="space-y-4">
                <Input {...registerRegisterForm("name", { required: true })} placeholder="Vorname" />
                <Input {...registerRegisterForm("lastname", { required: true })} placeholder="Nachname" />
                <Input {...registerRegisterForm("email", { required: true })} placeholder="Email" type="email" />
                <Input {...registerRegisterForm("username", { required: true })} placeholder="Username" />
                <Input {...registerRegisterForm("password", { required: true })} placeholder="Passwort" type="password" />
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
      <Card className="w-120 h-70 shadow-lg rounded-2xl hover:scale-105 transition-transform duration-300 gap-5">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Anmeldung</CardTitle>
        </CardHeader>
        <form onSubmit={handleLoginSubmit(onSubmitLogin)}>
          <CardContent>
            <div className="flex flex-col space-y-4">
              <Input placeholder="Username" {...registerLoginForm("username", { required: true })} />
              {loginError.username && <p className="text-red-500">{loginError.username}</p>}
              <Input placeholder="Passwort" type="password" {...registerLoginForm("password", { required: true })} />
              {loginError.password && <p className="text-red-500">{loginError.password}</p>}
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
