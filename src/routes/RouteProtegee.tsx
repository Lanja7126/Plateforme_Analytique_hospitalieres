import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useEstAuthentifie } from "../store/authStore";

export default function RouteProtegee() {
  const estAuthentifie = useEstAuthentifie();
  const location = useLocation();

  if (!estAuthentifie) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <Outlet />;
}
