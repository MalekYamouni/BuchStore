import SectionHeader from "@/components/SectionHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import useUsers from "@/hooks/useUser";
import { UserPen } from "lucide-react";

export function UserConfiguration() {
  const { getuserById } = useUsers();

  const user = getuserById.data;

  return (
    <div className="flex flex-col gap-5 p-5">
      <div className="ml-5 mr-5">
        <SectionHeader
          title="Benutzer Einstellungen"
          icon={<UserPen size={20} />}
        />
      </div>
      <div>
      <Card
        className="w-120 h-60 ml-5 display-flex justify-start
     shadow-lg rounded-2xl hover:scale-105 transition-transform duration-300 gap-5 p-4"
      >
        <CardHeader>
          <CardTitle className="text-lg fron-semibold leading-none tracking-tight">
            {user?.name}
          </CardTitle>
        </CardHeader>
        <CardContent>{user?.email}</CardContent>
        <CardContent>{user?.password}</CardContent>
      </Card>
      </div>
    </div>
  );
}
