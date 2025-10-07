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
      <div >
        <Card
          className="w-200 h-80 mx-auto flex justify-start
     shadow-lg rounded-2xl hover:scale-105 transition-transform duration-300 gap-5 p-4"
        >
          <CardHeader>
            <CardTitle className="text-lg fron-semibold leading-none tracking-tight">
              <p>Informationen</p>
            </CardTitle>
          </CardHeader>
          <CardContent><span>Email: {user?.email}</span></CardContent>
          <CardContent><span>Benutzername: {user?.username}</span></CardContent>
          <CardContent><span>Name: {user?.name}</span></CardContent>
          <CardContent><span>Nachname: {user?.lastname}</span></CardContent>
          <CardContent><span>Erstellt: {user?.created}</span></CardContent>
          <CardContent><span>Guthaben: {user?.balance}€</span></CardContent>
        </Card>
      </div>
    </div>
  );
}
