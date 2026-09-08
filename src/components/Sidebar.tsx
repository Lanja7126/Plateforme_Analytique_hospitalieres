import { NavLink, useNavigate } from "react-router-dom";
import {
  Home,
  Map,
  Building2,
  AlertTriangle,
  BookOpen,
  Upload,
  LogOut,
  Menu,
  ChevronLeft,
  ChevronRight,
  HelpCircle,
  Settings,
} from "lucide-react";
import { useAuthStore } from "../store/authStore";
import type { Role } from "../types/auth.types";
import logo from "../assets/logo-ephm.svg";
import { useState } from "react";

// ============================================================
// PALETTE EPHM DARK
// ============================================================
const EPHM_DARK = {
  primary: {
    50: "#e6f5f5",
    100: "#b3e0e0",
    200: "#80cccc",
    300: "#4db8b8",
    400: "#26a8a8",
    500: "#00a0a0",
    600: "#008080",
    700: "#006666",
    800: "#004d4d",
    900: "#003333",
  },
  accent: {
    gold: "#d4b85a",
    coral: "#e87461",
  },
  status: {
    success: "#3da68a",
    warning: "#dbb84d",
    danger: "#d96a5a",
    info: "#5a9fd4",
  },
  neutral: {
    white: "#ffffff",
    gray50: "#1a2a27",
    gray100: "#1f332f",
    gray200: "#2a3f3b",
    gray300: "#3d5a55",
    gray400: "#5a7a73",
    gray500: "#7a9a93",
    gray600: "#9abab2",
    gray700: "#b8d4cd",
    gray800: "#d8ece6",
    gray900: "#f0f8f5",
  },
  background: {
    page: "#0d1a18",
    card: "#152826",
    cardHover: "#1c3532",
    elevated: "#1f3a37",
  }
};

interface ElementMenu {
  to: string;
  label: string;
  icon: React.ReactNode;
  rolesAutorises?: Role[];
  end?: boolean;
}

const ELEMENTS_MENU: ElementMenu[] = [
  {
    to: "/dashboard",
    label: "Accueil",
    icon: <Home className="size-5" />,
    end: true,
  },
  {
    to: "/dashboard/regional",
    label: "Dashboard régional",
    icon: <Map className="size-5" />,
  },
  {
    to: "/dashboard/etablissement",
    label: "Fiche établissement",
    icon: <Building2 className="size-5" />,
  },
  {
    to: "/dashboard/prediction",
    label: "Prédiction de risque",
    icon: <AlertTriangle className="size-5" />,
  },
  {
    to: "/dashboard/import",
    label: "Import de données",
    icon: <Upload className="size-5" />,
    rolesAutorises: ["admin"],
  },
  {
    to: "/dashboard/methodologie",
    label: "Méthodologie",
    icon: <BookOpen className="size-5" />,
  },
];

// ============================================================
// FONCTION UTILITAIRE POUR RÉCUPÉRER L'ÉTAT INITIAL
// ============================================================
const getInitialCollapsedState = (): boolean => {
  try {
    const saved = localStorage.getItem("sidebar-collapsed");
    if (saved !== null) {
      return JSON.parse(saved);
    }
  } catch {
    // Ignorer les erreurs de parsing
  }
  return false;
};

// ============================================================
// COMPOSANT SIDEBAR
// ============================================================
export default function Sidebar({ children }: { children?: React.ReactNode }) {
  const navigate = useNavigate();
  const utilisateur = useAuthStore((s) => s.utilisateur);
  const deconnecter = useAuthStore((s) => s.deconnecter);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(getInitialCollapsedState);

  const elementsVisibles = ELEMENTS_MENU.filter(
    (el) =>
      !el.rolesAutorises ||
      (utilisateur && el.rolesAutorises.includes(utilisateur.role)),
  );

  function gererDeconnexion() {
    deconnecter();
    navigate("/login", { replace: true });
  }

  const toggleCollapse = () => {
    setIsCollapsed((prev) => {
      const newState = !prev;
      localStorage.setItem("sidebar-collapsed", JSON.stringify(newState));
      return newState;
    });
  };

  const largeurSidebar = isCollapsed ? "w-16" : "w-64";

  return (
    <div className="drawer lg:drawer-open">
      <input
        id="my-drawer-4"
        type="checkbox"
        className="drawer-toggle"
        checked={isMobileMenuOpen}
        onChange={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
      />
      
      {/* CONTENU PRINCIPAL */}
      <div 
        className="drawer-content flex flex-col"
        style={{ backgroundColor: EPHM_DARK.background.page }}
      >
        {/* BARRE DE NAVIGATION */}
        <nav 
          className="navbar w-full border-b shadow-sm"
          style={{ 
            backgroundColor: EPHM_DARK.background.card,
            borderColor: EPHM_DARK.neutral.gray200,
          }}
        >
          <div className="flex-1 flex items-center gap-3">
            <label
              htmlFor="my-drawer-4"
              aria-label="open sidebar"
              className="btn btn-square btn-ghost lg:hidden"
              style={{ color: EPHM_DARK.neutral.gray600 }}
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              <Menu className="size-5" />
            </label>
            
            <div 
              className="hidden lg:flex items-center gap-2"
              onClick={toggleCollapse}
              style={{ cursor: "pointer" }}
            >
              {isCollapsed ? (
                <ChevronRight className="size-4" style={{ color: EPHM_DARK.neutral.gray400 }} />
              ) : (
                <ChevronLeft className="size-4" style={{ color: EPHM_DARK.neutral.gray400 }} />
              )}
            </div>

            <div className="flex items-center gap-2 font-semibold" style={{ color: EPHM_DARK.neutral.gray800 }}>
              <img src={logo} alt="Logo EPHM" className="w-8 h-8 mr-2" />
              <span className={isCollapsed ? "hidden lg:inline" : "inline"}>
                EPHM
              </span>
              <span className="hidden lg:inline text-sm font-normal" style={{ color: EPHM_DARK.neutral.gray400 }}>
                Performances Hospitalières
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button 
              className="btn btn-ghost btn-sm btn-square"
              style={{ color: EPHM_DARK.neutral.gray400 }}
            >
              <HelpCircle className="size-4" />
            </button>
            <button 
              className="btn btn-ghost btn-sm btn-square"
              style={{ color: EPHM_DARK.neutral.gray400 }}
            >
              <Settings className="size-4" />
            </button>
            <div className="avatar placeholder">
              <div 
                className="w-8 rounded-full"
                style={{ 
                  backgroundColor: EPHM_DARK.primary[600],
                  color: EPHM_DARK.neutral.white,
                }}
              >
                <span className="text-xs font-medium">
                  {utilisateur?.nom?.slice(0, 2).toUpperCase() || "U"}
                </span>
              </div>
            </div>
          </div>
        </nav>

        {/* CONTENU DE LA PAGE */}
        <div className="p-4 lg:p-6 flex-1">{children}</div>
      </div>

      {/* SIDEBAR */}
      <div className="drawer-side z-50">
        <label
          htmlFor="my-drawer-4"
          aria-label="close sidebar"
          className="drawer-overlay"
        ></label>
        
        <div 
          className={`flex min-h-full flex-col transition-all duration-300 ${largeurSidebar}`}
          style={{ 
            backgroundColor: EPHM_DARK.background.card,
            borderRight: `1px solid ${EPHM_DARK.neutral.gray200}`,
          }}
        >
          {/* LOGO */}
          <div 
            className={`flex items-center gap-3 p-4 border-b ${isCollapsed ? "justify-center" : ""}`}
            style={{ borderColor: EPHM_DARK.neutral.gray200 }}
          >
            <img src={logo} alt="Logo EPHM" className="w-8 h-8 shrink-0" />
            {!isCollapsed && (
              <div>
                <h1 className="font-bold text-sm" style={{ color: EPHM_DARK.neutral.gray800 }}>
                  EPHM
                </h1>
                <p className="text-xs" style={{ color: EPHM_DARK.neutral.gray400 }}>
                  Madagascar
                </p>
              </div>
            )}
          </div>

          {/* MENU - VERSION CORRIGÉE ✅ */}
          <ul className="menu menu-sm flex-1 gap-1 p-3">
            {elementsVisibles.map((el) => (
              <li key={el.to}>
                <NavLink
                  to={el.to}
                  end={el.end}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${
                      isActive ? "menu-active" : ""
                    } ${isCollapsed ? "justify-center" : ""}`
                  }
                  style={({ isActive }) => ({
                    backgroundColor: isActive ? EPHM_DARK.primary[600] : "transparent",
                    color: isActive ? EPHM_DARK.neutral.white : EPHM_DARK.neutral.gray500,
                  })}
                  title={isCollapsed ? el.label : undefined}
                  onClick={() => {
                    if (window.innerWidth < 1024) {
                      setIsMobileMenuOpen(false);
                    }
                  }}
                >
                  {/* ✅ Utilisation de la fonction children de NavLink */}
                  {({ isActive }) => (
                    <>
                      {el.icon}
                      {!isCollapsed && (
                        <span className="flex-1 text-sm">{el.label}</span>
                      )}
                      {!isCollapsed && isActive && (
                        <span 
                          className="w-1.5 h-1.5 rounded-full"
                          style={{ backgroundColor: EPHM_DARK.neutral.white }}
                        />
                      )}
                    </>
                  )}
                </NavLink>
              </li>
            ))}
          </ul>

          {/* SECTION UTILISATEUR */}
          <div 
            className="border-t p-3"
            style={{ borderColor: EPHM_DARK.neutral.gray200 }}
          >
            <div 
              className={`flex items-center gap-3 px-2 py-2 rounded-lg ${
                isCollapsed ? "justify-center" : ""
              }`}
              style={{ backgroundColor: EPHM_DARK.neutral.gray50 }}
            >
              <div className="avatar placeholder">
                <div 
                  className="w-9 rounded-full"
                  style={{ 
                    backgroundColor: EPHM_DARK.primary[600],
                    color: EPHM_DARK.neutral.white,
                  }}
                >
                  <span className="text-sm font-medium">
                    {utilisateur?.nom?.slice(0, 2).toUpperCase() || "U"}
                  </span>
                </div>
              </div>
              {!isCollapsed && (
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate" style={{ color: EPHM_DARK.neutral.gray700 }}>
                    {utilisateur?.nom || "Utilisateur"}
                  </p>
                  <p className="text-xs truncate" style={{ color: EPHM_DARK.neutral.gray400 }}>
                    {utilisateur?.email || "email@example.com"}
                  </p>
                  <span 
                    className="badge badge-xs mt-0.5"
                    style={{
                      backgroundColor: utilisateur?.role === "admin" ? EPHM_DARK.primary[600] : EPHM_DARK.neutral.gray300,
                      color: utilisateur?.role === "admin" ? EPHM_DARK.neutral.white : EPHM_DARK.neutral.gray700,
                    }}
                  >
                    {utilisateur?.role || "user"}
                  </span>
                </div>
              )}
            </div>

            <button
              onClick={gererDeconnexion}
              className={`btn btn-ghost btn-sm w-full mt-2 ${
                isCollapsed ? "justify-center" : "justify-start"
              } gap-2`}
              style={{ color: EPHM_DARK.neutral.gray500 }}
              title={isCollapsed ? "Déconnexion" : undefined}
            >
              <LogOut className="size-4" />
              {!isCollapsed && <span>Déconnexion</span>}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}