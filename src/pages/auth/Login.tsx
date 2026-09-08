import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useLocation, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { schemaConnexion, type FormConnexion } from "../../schemas/auth.schema";
import { useAuthStore } from "../../store/authStore";
import {
  Mail,
  Lock,
  LogIn,
  AlertCircle,
  Eye,
  EyeOff,
  Building2,
  Shield,
  CheckCircle2,
} from "lucide-react";
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

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const connecter = useAuthStore((s) => s.connecter);
  const chargement = useAuthStore((s) => s.chargement);
  const [voirMotDePasse, setVoirMotDePasse] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormConnexion>({ resolver: zodResolver(schemaConnexion) });

  async function onSubmit(donnees: FormConnexion) {
    try {
      await connecter(donnees);
      const destination = (location.state as { from?: Location })?.from?.pathname || "/dashboard";
      navigate(destination, { replace: true });
      toast.success("Connexion réussie !");
    } catch {
      toast.error("Email ou mot de passe incorrect.");
    }
  }

  return (
    <div 
      className="min-h-screen flex items-center justify-center p-4"
      style={{ 
        backgroundColor: EPHM_DARK.background.page,
        backgroundImage: `radial-gradient(circle at 20% 50%, ${EPHM_DARK.primary[800]}40 0%, transparent 60%)`,
      }}
    >
      <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
        
        {/* =====================================
            SECTION GAUCHE - PRÉSENTATION
        ====================================== */}
        <div className="hidden lg:flex flex-col gap-6">
          {/* Logo / Marque */}
          <div className="flex items-center gap-3">
            <div 
              className="rounded-2xl p-3"
              style={{ backgroundColor: EPHM_DARK.primary[600] }}
            >
              <Building2 size={32} className="text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight" style={{ color: EPHM_DARK.neutral.gray800 }}>
                EPHM
              </h1>
              <p className="text-sm" style={{ color: EPHM_DARK.neutral.gray400 }}>
                Performances Hospitalières · Madagascar
              </p>
            </div>
          </div>

          {/* Message d'accueil */}
          <div className="space-y-4">
            <h2 className="text-4xl font-bold leading-tight" style={{ color: EPHM_DARK.neutral.gray800 }}>
              Bienvenue sur la plateforme
            </h2>
            <p className="text-lg" style={{ color: EPHM_DARK.neutral.gray400 }}>
              Analysez, suivez et optimisez les performances des établissements hospitaliers à Madagascar.
            </p>
          </div>

          {/* Points clés */}
          <div className="space-y-3 mt-4">
            <div className="flex items-center gap-3">
              <div 
                className="rounded-full p-1.5"
                style={{ backgroundColor: EPHM_DARK.status.success + "30" }}
              >
                <CheckCircle2 size={18} style={{ color: EPHM_DARK.status.success }} />
              </div>
              <span style={{ color: EPHM_DARK.neutral.gray600 }}>
                Suivi en temps réel des indicateurs hospitaliers
              </span>
            </div>
            <div className="flex items-center gap-3">
              <div 
                className="rounded-full p-1.5"
                style={{ backgroundColor: EPHM_DARK.status.success + "30" }}
              >
                <CheckCircle2 size={18} style={{ color: EPHM_DARK.status.success }} />
              </div>
              <span style={{ color: EPHM_DARK.neutral.gray600 }}>
                Analyse prédictive des risques et performances
              </span>
            </div>
            <div className="flex items-center gap-3">
              <div 
                className="rounded-full p-1.5"
                style={{ backgroundColor: EPHM_DARK.status.success + "30" }}
              >
                <CheckCircle2 size={18} style={{ color: EPHM_DARK.status.success }} />
              </div>
              <span style={{ color: EPHM_DARK.neutral.gray600 }}>
                Tableaux de bord interactifs par région
              </span>
            </div>
          </div>

          {/* Badge de version */}
          <div 
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full w-fit mt-4"
            style={{ 
              backgroundColor: EPHM_DARK.primary[800] + "60",
              border: `1px solid ${EPHM_DARK.primary[700]}`,
            }}
          >
            <Shield size={14} style={{ color: EPHM_DARK.primary[300] }} />
            <span className="text-xs" style={{ color: EPHM_DARK.neutral.gray400 }}>
              Version 2.0 · Sécurisé
            </span>
          </div>
        </div>

        {/* =====================================
            SECTION DROITE - FORMULAIRE
        ====================================== */}
        <div 
          className="w-full max-w-md mx-auto rounded-2xl border shadow-xl"
          style={{ 
            borderColor: EPHM_DARK.neutral.gray200,
            backgroundColor: EPHM_DARK.background.card,
          }}
        >
          <div className="p-8">
            {/* En-tête du formulaire - visible sur mobile */}
            <div className="lg:hidden flex items-center gap-3 mb-6">
              <div 
                className="rounded-xl p-2.5"
                style={{ backgroundColor: EPHM_DARK.primary[600] }}
              >
                <Building2 size={24} className="text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold" style={{ color: EPHM_DARK.neutral.gray800 }}>
                  EPHM
                </h1>
                <p className="text-xs" style={{ color: EPHM_DARK.neutral.gray400 }}>
                  Performances Hospitalières
                </p>
              </div>
            </div>

            <h2 className="text-2xl font-bold" style={{ color: EPHM_DARK.neutral.gray800 }}>
              Connexion
            </h2>
            <p className="text-sm mt-1" style={{ color: EPHM_DARK.neutral.gray400 }}>
              Accédez à votre tableau de bord
            </p>

            <form onSubmit={handleSubmit(onSubmit)} noValidate className="mt-6 space-y-4">
              {/* Champ Email */}
              <div>
                <label className="label text-sm font-medium" style={{ color: EPHM_DARK.neutral.gray600 }}>
                  <Mail size={16} className="mr-2" />
                  Adresse email
                </label>
                <div className="relative">
                  <Mail 
                    size={18} 
                    className="absolute left-3 top-1/2 -translate-y-1/2"
                    style={{ color: EPHM_DARK.neutral.gray400 }}
                  />
                  <input
                    type="email"
                    className={`input w-full pl-10 ${errors.email ? "input-error" : ""}`}
                    style={{ 
                      backgroundColor: EPHM_DARK.neutral.gray50,
                      borderColor: errors.email ? EPHM_DARK.status.danger : EPHM_DARK.neutral.gray200,
                      color: EPHM_DARK.neutral.gray800,
                    }}
                    placeholder="exemple@ephm.mg"
                    {...register("email")}
                  />
                </div>
                {errors.email && (
                  <p className="text-xs mt-1.5 flex items-center gap-1" style={{ color: EPHM_DARK.status.danger }}>
                    <AlertCircle size={12} />
                    {errors.email.message}
                  </p>
                )}
              </div>

              {/* Champ Mot de passe */}
              <div>
                <div className="flex items-center justify-between">
                  <label className="label text-sm font-medium" style={{ color: EPHM_DARK.neutral.gray600 }}>
                    <Lock size={16} className="mr-2" />
                    Mot de passe
                  </label>
                  <Link 
                    to="/mot-de-passe-oublie" 
                    className="text-xs hover:underline"
                    style={{ color: EPHM_DARK.primary[400] }}
                  >
                    Mot de passe oublié ?
                  </Link>
                </div>
                <div className="relative">
                  <Lock 
                    size={18} 
                    className="absolute left-3 top-1/2 -translate-y-1/2"
                    style={{ color: EPHM_DARK.neutral.gray400 }}
                  />
                  <input
                    type={voirMotDePasse ? "text" : "password"}
                    className={`input w-full pl-10 pr-10 ${errors.motDePasse ? "input-error" : ""}`}
                    style={{ 
                      backgroundColor: EPHM_DARK.neutral.gray50,
                      borderColor: errors.motDePasse ? EPHM_DARK.status.danger : EPHM_DARK.neutral.gray200,
                      color: EPHM_DARK.neutral.gray800,
                    }}
                    placeholder="••••••••"
                    {...register("motDePasse")}
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2"
                    onClick={() => setVoirMotDePasse(!voirMotDePasse)}
                    style={{ color: EPHM_DARK.neutral.gray400 }}
                  >
                    {voirMotDePasse ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {errors.motDePasse && (
                  <p className="text-xs mt-1.5 flex items-center gap-1" style={{ color: EPHM_DARK.status.danger }}>
                    <AlertCircle size={12} />
                    {errors.motDePasse.message}
                  </p>
                )}
              </div>

              {/* Bouton de connexion */}
              <button 
                type="submit" 
                className="btn w-full gap-2 text-white font-medium mt-6"
                style={{ 
                  backgroundColor: EPHM_DARK.primary[600],
                  borderColor: EPHM_DARK.primary[600],
                }}
                disabled={chargement}
                onMouseEnter={(e) => {
                  if (!chargement) {
                    e.currentTarget.style.backgroundColor = EPHM_DARK.primary[500];
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = EPHM_DARK.primary[600];
                }}
              >
                {chargement ? (
                  <>
                    <span className="loading loading-spinner loading-sm" />
                    Connexion en cours...
                  </>
                ) : (
                  <>
                    <LogIn size={18} />
                    Se connecter
                  </>
                )}
              </button>

              {/* Lien d'inscription */}
              <p className="text-center text-sm mt-4" style={{ color: EPHM_DARK.neutral.gray400 }}>
                Pas encore de compte ?{" "}
                <Link 
                  to="/inscription" 
                  className="font-medium hover:underline"
                  style={{ color: EPHM_DARK.primary[400] }}
                >
                  S'inscrire
                </Link>
              </p>
            </form>

            {/* Séparateur avec indicateur de sécurité */}
            <div className="relative mt-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t" style={{ borderColor: EPHM_DARK.neutral.gray200 }} />
              </div>
              <div className="relative flex justify-center text-xs">
                <span 
                  className="px-3"
                  style={{ 
                    backgroundColor: EPHM_DARK.background.card,
                    color: EPHM_DARK.neutral.gray400,
                  }}
                >
                  <Shield size={14} className="inline mr-1" />
                  Connexion sécurisée
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* =====================================
          FOOTER
      ====================================== */}
      <div className="absolute bottom-4 left-0 right-0 text-center">
        <p className="text-xs" style={{ color: EPHM_DARK.neutral.gray400 }}>
          © {new Date().getFullYear()} EPHM — Plateforme analytique hospitalière de Madagascar
        </p>
      </div>
    </div>
  );
}