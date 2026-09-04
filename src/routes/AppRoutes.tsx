import { Routes, Route, Navigate } from "react-router-dom";
import RouteProtegee from "./RouteProtegee";
import RouteAvecRole from "./RouteAvecRole";
import DashboardLayout from "../layouts/DashboardLayout";

import Login from "../pages/auth/Login";
import Register from "../pages/auth/Register";

import Accueil from "../pages/dashboard/Accueil";
import DashboardRegional from "../pages/dashboard/DashboardRegional";
import FicheEtablissement from "../pages/dashboard/FicheEtablissement";
import Prediction from "../pages/dashboard/Prediction";
import Methodologie from "../pages/dashboard/Methodologie";
import ImportDonnees from "../pages/dashboard/ImportDonnees";

export default function AppRoutes() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/login" element={<Login />} />
      <Route path="/inscription" element={<Register />} />

      {/* Protégé : authentification requise */}
      <Route element={<RouteProtegee />}>
        <Route element={<DashboardLayout />}>
          <Route path="/dashboard" element={<Accueil />} />
          <Route path="/dashboard/regional" element={<DashboardRegional />} />
          <Route path="/dashboard/etablissement" element={<FicheEtablissement />} />
          <Route path="/dashboard/prediction" element={<Prediction />} />
          <Route path="/dashboard/methodologie" element={<Methodologie />} />

          {/* Protégé : réservé au rôle admin, en plus d'être authentifié */}
          <Route element={<RouteAvecRole rolesAutorises={["admin"]} />}>
            <Route path="/dashboard/import" element={<ImportDonnees />} />
          </Route>
        </Route>
      </Route>

      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}
