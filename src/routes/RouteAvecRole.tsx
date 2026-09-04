import { Outlet } from "react-router-dom";
import type { Role } from "../types/auth.types";
import { useRole } from "../store/authStore";

interface Props {
  rolesAutorises: Role[];
}

export default function RouteAvecRole({ rolesAutorises }: Props) {
  const role = useRole();

  if (!role || !rolesAutorises.includes(role)) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-2 text-center">
        <h1 className="text-3xl font-bold">403</h1>
        <p className="text-base-content/70">
          Accès réservé au rôle {rolesAutorises.join(" ou ")} — tu es connecté en tant que {role ?? "invité"}.
        </p>
      </div>
    );
  }

  return <Outlet />;
}
