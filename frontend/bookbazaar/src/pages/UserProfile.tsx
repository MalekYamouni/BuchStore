import SectionHeader from "@/components/SectionHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import useUsers from "@/hooks/useUser";
import { UserPen } from "lucide-react";

export function UserProfile() {
  const { getuserById } = useUsers();

  const user = getuserById.data;

  return (
    <div className="flex flex-col gap-5 p-5">
      <div className="m-5">
        <SectionHeader title="Dein Profil" icon={<UserPen size={20} />} />
      </div>
      <div>
        <Card
          className="w-200 h-80 mx-auto flex justify-start bg-card text-foreground border border-border shadow-lg rounded-2xl hover:scale-105 transition-transform duration-300 gap-5 p-4"
        >
          <CardHeader>
            <CardTitle className="text-lg font-semibold leading-none tracking-tight">
              <p>Informationen</p>
            </CardTitle>
          </CardHeader>
          <CardContent><span className="text-foreground">Email: {user?.email}</span></CardContent>
          <CardContent><span className="text-foreground">Benutzername: {user?.username}</span></CardContent>
          <CardContent><span className="text-foreground">Name: {user?.name}</span></CardContent>
          <CardContent><span className="text-foreground">Nachname: {user?.lastname}</span></CardContent>
          <CardContent><span className="text-foreground">Erstellt: {user?.created}</span></CardContent>
          <CardContent><span className="text-foreground">Guthaben: {user?.balance}€</span></CardContent>
        </Card>
      </div>
    </div>
  );
}
