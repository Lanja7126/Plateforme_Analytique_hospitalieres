import { NavLink, useNavigate } from "react-router-dom";
import {
  Home,
  Map,
  Building2,
  AlertTriangle,
  BookOpen,
  Upload,
  LogOut,
} from "lucide-react";
import { useAuthStore } from "../store/authStore";
import type { Role } from "../types/auth.types";

interface ElementMenu {
  to: string;
  label: string;
  icon: React.ReactNode;
  rolesAutorises?: Role[];
}

const ELEMENTS_MENU: ElementMenu[] = [
  { to: "/dashboard", label: "Accueil", icon: <Home className="my-1.5 inline-block size-4" /> },
  { to: "/dashboard/regional", label: "Dashboard régional", icon: <Map className="my-1.5 inline-block size-4" /> },
  { to: "/dashboard/etablissement", label: "Fiche établissement", icon: <Building2 className="my-1.5 inline-block size-4" /> },
  { to: "/dashboard/prediction", label: "Prédiction de risque", icon: <AlertTriangle className="my-1.5 inline-block size-4" /> },
  {
    to: "/dashboard/import",
    label: "Import de données",
    icon: <Upload className="my-1.5 inline-block size-4" />,
    rolesAutorises: ["admin"],
  },
  { to: "/dashboard/methodologie", label: "Méthodologie", icon: <BookOpen className="my-1.5 inline-block size-4" /> },
];

export default function Sidebar({ children }: { children?: React.ReactNode }) {
  const navigate = useNavigate();
  const utilisateur = useAuthStore((s) => s.utilisateur);
  const deconnecter = useAuthStore((s) => s.deconnecter);

  const elementsVisibles = ELEMENTS_MENU.filter(
    (el) => !el.rolesAutorises || (utilisateur && el.rolesAutorises.includes(utilisateur.role))
  );

  function gererDeconnexion() {
    deconnecter();
    navigate("/login", { replace: true });
  }

  return (
    <div className="drawer lg:drawer-open">
      <input id="my-drawer-4" type="checkbox" className="drawer-toggle inline" />
      <div className="drawer-content">
        <nav className="navbar w-full bg-base-300">
          <label htmlFor="my-drawer-4" aria-label="open sidebar" className="btn btn-square btn-ghost drawer-button">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" strokeLinejoin="round" strokeLinecap="round" strokeWidth="2" fill="none" stroke="currentColor" className="my-1.5 inline-block size-4"><path d="M4 4m0 2a2 2 0 0 1 2 -2h12a2 2 0 0 1 2 2v12a2 2 0 0 1 -2 2h-12a2 2 0 0 1 -2 -2z"></path><path d="M9 4v16"></path><path d="M14 10l2 2l-2 2"></path></svg>
          </label>
          <div className="px-4 font-semibold">🏥 Plateforme Analytique Hospitalière</div>
        </nav>
        <div className="p-4">{children}</div>
      </div>

      <div className="drawer-side is-drawer-close:overflow-visible">
        <label htmlFor="my-drawer-4" aria-label="close sidebar" className="drawer-overlay"></label>
        <div className="flex min-h-full flex-col items-start bg-base-200 is-drawer-close:w-14 is-drawer-open:w-64">
          <ul className="menu w-full grow">
            {elementsVisibles.map((el) => (
              <li key={el.to}>
                <NavLink
                  to={el.to}
                  end={el.to === "/dashboard"}
                  className={({ isActive }) =>
                    `is-drawer-close:tooltip is-drawer-close:tooltip-right ${isActive ? "menu-active" : ""}`
                  }
                  data-tip={el.label}
                >
                  {el.icon}
                  <span className="is-drawer-close:hidden">{el.label}</span>
                </NavLink>
              </li>
            ))}
          </ul>

          <div className="w-full border-t border-base-300 p-2">
            <div className="is-drawer-close:tooltip is-drawer-close:tooltip-right flex items-center gap-2 px-2 py-1" data-tip={utilisateur?.email}>
              <div className="avatar placeholder">
                <div className="bg-neutral text-neutral-content w-8 rounded-full">
                  <span className="text-xs">{utilisateur?.nom?.slice(0, 2).toUpperCase()}</span>
                </div>
              </div>
              <div className="is-drawer-close:hidden overflow-hidden">
                <p className="truncate text-sm font-medium">{utilisateur?.nom}</p>
                <p className="badge badge-ghost badge-xs">{utilisateur?.role}</p>
              </div>
            </div>
            <button
              onClick={gererDeconnexion}
              className="btn btn-ghost btn-sm is-drawer-close:tooltip is-drawer-close:tooltip-right mt-1 w-full justify-start"
              data-tip="Déconnexion"
            >
              <LogOut className="size-4" />
              <span className="is-drawer-close:hidden">Déconnexion</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
