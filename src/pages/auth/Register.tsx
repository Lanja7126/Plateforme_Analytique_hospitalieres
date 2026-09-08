import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useNavigate } from "react-router-dom";
import { useWatch } from "react-hook-form";
import toast from "react-hot-toast";
import { useState } from "react";
import {
  schemaInscription,
  type FormInscription,
} from "../../schemas/auth.schema";
import { useAuthStore } from "../../store/authStore";
import {
  User,
  Mail,
  Lock,
  UserPlus,
  AlertCircle,
  Eye,
  EyeOff,
  Building2,
  Shield,
  CheckCircle2,
  ArrowLeft,
  Key,
} from "lucide-react";

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
  },
};

export default function Register() {
  const navigate = useNavigate();
  const inscrire = useAuthStore((s) => s.inscrire);
  const chargement = useAuthStore((s) => s.chargement);
  const [voirMotDePasse, setVoirMotDePasse] = useState(false);
  const [voirConfirmation, setVoirConfirmation] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<FormInscription>({
    resolver: zodResolver(schemaInscription),
    mode: "onChange",
  });

  const motDePasse = useWatch({
    control,
    name: "motDePasse",
    defaultValue: "",
  });

  const criteresMotDePasse = {
    longueur: motDePasse && motDePasse.length >= 8,
    minuscule: motDePasse && /[a-z]/.test(motDePasse),
    majuscule: motDePasse && /[A-Z]/.test(motDePasse),
    chiffre: motDePasse && /[0-9]/.test(motDePasse),
  };

  const nombreCriteresValides =
    Object.values(criteresMotDePasse).filter(Boolean).length;

  async function onSubmit(donnees: FormInscription) {
    try {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { confirmMotDePasse, conditions, ...donneesApi } = donnees;
      await inscrire(donneesApi);
      toast.success("Compte créé avec succès");
      navigate("/dashboard", { replace: true });
    } catch (err) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message || "Impossible de créer le compte.";
      toast.error(message);
    }
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{
        backgroundColor: EPHM_DARK.background.page,
        backgroundImage: `radial-gradient(circle at 80% 50%, ${EPHM_DARK.primary[800]}40 0%, transparent 60%)`,
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
              <h1
                className="text-3xl font-bold tracking-tight"
                style={{ color: EPHM_DARK.neutral.gray800 }}
              >
                EPHM
              </h1>
              <p
                className="text-sm"
                style={{ color: EPHM_DARK.neutral.gray400 }}
              >
                Performances Hospitalières · Madagascar
              </p>
            </div>
          </div>

          {/* Message d'accueil */}
          <div className="space-y-4">
            <h2
              className="text-4xl font-bold leading-tight"
              style={{ color: EPHM_DARK.neutral.gray800 }}
            >
              Rejoignez la plateforme
            </h2>
            <p className="text-lg" style={{ color: EPHM_DARK.neutral.gray400 }}>
              Créez votre compte pour accéder aux outils d'analyse des
              performances hospitalières.
            </p>
          </div>

          {/* Points clés */}
          <div className="space-y-3 mt-4">
            <div className="flex items-center gap-3">
              <div
                className="rounded-full p-1.5"
                style={{ backgroundColor: EPHM_DARK.status.success + "30" }}
              >
                <CheckCircle2
                  size={18}
                  style={{ color: EPHM_DARK.status.success }}
                />
              </div>
              <span style={{ color: EPHM_DARK.neutral.gray600 }}>
                Accès aux tableaux de bord interactifs
              </span>
            </div>
            <div className="flex items-center gap-3">
              <div
                className="rounded-full p-1.5"
                style={{ backgroundColor: EPHM_DARK.status.success + "30" }}
              >
                <CheckCircle2
                  size={18}
                  style={{ color: EPHM_DARK.status.success }}
                />
              </div>
              <span style={{ color: EPHM_DARK.neutral.gray600 }}>
                Analyse des indicateurs hospitaliers
              </span>
            </div>
            <div className="flex items-center gap-3">
              <div
                className="rounded-full p-1.5"
                style={{ backgroundColor: EPHM_DARK.status.success + "30" }}
              >
                <CheckCircle2
                  size={18}
                  style={{ color: EPHM_DARK.status.success }}
                />
              </div>
              <span style={{ color: EPHM_DARK.neutral.gray600 }}>
                Outils de prédiction et d'alerte
              </span>
            </div>
          </div>

          {/* Badge de sécurité */}
          <div
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full w-fit mt-4"
            style={{
              backgroundColor: EPHM_DARK.primary[800] + "60",
              border: `1px solid ${EPHM_DARK.primary[700]}`,
            }}
          >
            <Shield size={14} style={{ color: EPHM_DARK.primary[300] }} />
            <span
              className="text-xs"
              style={{ color: EPHM_DARK.neutral.gray400 }}
            >
              Compte sécurisé · Accès restreint
            </span>
          </div>

          {/* Lien retour */}
          <Link
            to="/login"
            className="inline-flex items-center gap-2 text-sm hover:underline mt-2"
            style={{ color: EPHM_DARK.neutral.gray400 }}
          >
            <ArrowLeft size={16} />
            Retour à la connexion
          </Link>
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
                <h1
                  className="text-xl font-bold"
                  style={{ color: EPHM_DARK.neutral.gray800 }}
                >
                  EPHM
                </h1>
                <p
                  className="text-xs"
                  style={{ color: EPHM_DARK.neutral.gray400 }}
                >
                  Performances Hospitalières
                </p>
              </div>
            </div>

            <h2
              className="text-2xl font-bold"
              style={{ color: EPHM_DARK.neutral.gray800 }}
            >
              Créer un compte
            </h2>
            <p
              className="text-sm mt-1"
              style={{ color: EPHM_DARK.neutral.gray400 }}
            >
              Remplissez le formulaire pour vous inscrire
            </p>

            <form
              onSubmit={handleSubmit(onSubmit)}
              noValidate
              className="mt-6 space-y-4"
            >
              {/* Champ Nom complet */}
              <div>
                <label
                  className="label text-sm font-medium"
                  style={{ color: EPHM_DARK.neutral.gray600 }}
                >
                  <User size={16} className="mr-2" />
                  Nom complet
                </label>
                <div className="relative">
                  <User
                    size={18}
                    className="absolute left-3 top-1/2 -translate-y-1/2"
                    style={{ color: EPHM_DARK.neutral.gray400 }}
                  />
                  <input
                    type="text"
                    className={`input w-full pl-10 ${errors.nom ? "input-error" : ""}`}
                    style={{
                      backgroundColor: EPHM_DARK.neutral.gray50,
                      borderColor: errors.nom
                        ? EPHM_DARK.status.danger
                        : EPHM_DARK.neutral.gray200,
                      color: EPHM_DARK.neutral.gray800,
                    }}
                    placeholder="Votre nom complet"
                    {...register("nom")}
                  />
                </div>
                {errors.nom && (
                  <p
                    className="text-xs mt-1.5 flex items-center gap-1"
                    style={{ color: EPHM_DARK.status.danger }}
                  >
                    <AlertCircle size={12} />
                    {errors.nom.message}
                  </p>
                )}
              </div>

              {/* Champ Email */}
              <div>
                <label
                  className="label text-sm font-medium"
                  style={{ color: EPHM_DARK.neutral.gray600 }}
                >
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
                      borderColor: errors.email
                        ? EPHM_DARK.status.danger
                        : EPHM_DARK.neutral.gray200,
                      color: EPHM_DARK.neutral.gray800,
                    }}
                    placeholder="exemple@ephm.mg"
                    {...register("email")}
                  />
                </div>
                {errors.email && (
                  <p
                    className="text-xs mt-1.5 flex items-center gap-1"
                    style={{ color: EPHM_DARK.status.danger }}
                  >
                    <AlertCircle size={12} />
                    {errors.email.message}
                  </p>
                )}
              </div>

              {/* Champ Mot de passe */}
              <div>
                <label
                  className="label text-sm font-medium"
                  style={{ color: EPHM_DARK.neutral.gray600 }}
                >
                  <Lock size={16} className="mr-2" />
                  Mot de passe
                </label>
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
                      borderColor: errors.motDePasse
                        ? EPHM_DARK.status.danger
                        : EPHM_DARK.neutral.gray200,
                      color: EPHM_DARK.neutral.gray800,
                    }}
                    placeholder="8 caractères minimum"
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

                {/* Indicateur de force du mot de passe */}
                {motDePasse && motDePasse.length > 0 && (
                  <div className="mt-2 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span
                        className="text-xs"
                        style={{ color: EPHM_DARK.neutral.gray400 }}
                      >
                        Force du mot de passe
                      </span>
                      <span
                        className="text-xs font-medium"
                        style={{
                          color:
                            nombreCriteresValides <= 2
                              ? EPHM_DARK.status.danger
                              : nombreCriteresValides <= 3
                                ? EPHM_DARK.status.warning
                                : EPHM_DARK.status.success,
                        }}
                      >
                        {nombreCriteresValides <= 2
                          ? "Faible"
                          : nombreCriteresValides <= 3
                            ? "Moyen"
                            : "Fort"}
                      </span>
                    </div>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4].map((i) => (
                        <div
                          key={i}
                          className="h-1 flex-1 rounded-full transition-all"
                          style={{
                            backgroundColor:
                              i <= nombreCriteresValides
                                ? nombreCriteresValides <= 2
                                  ? EPHM_DARK.status.danger
                                  : nombreCriteresValides <= 3
                                    ? EPHM_DARK.status.warning
                                    : EPHM_DARK.status.success
                                : EPHM_DARK.neutral.gray200,
                          }}
                        />
                      ))}
                    </div>
                    <div className="grid grid-cols-2 gap-1 text-xs">
                      <span
                        className="flex items-center gap-1"
                        style={{
                          color: criteresMotDePasse.longueur
                            ? EPHM_DARK.status.success
                            : EPHM_DARK.neutral.gray400,
                        }}
                      >
                        <CheckCircle2
                          size={10}
                          style={{
                            color: criteresMotDePasse.longueur
                              ? EPHM_DARK.status.success
                              : EPHM_DARK.neutral.gray400,
                          }}
                        />
                        8 caractères
                      </span>
                      <span
                        className="flex items-center gap-1"
                        style={{
                          color: criteresMotDePasse.minuscule
                            ? EPHM_DARK.status.success
                            : EPHM_DARK.neutral.gray400,
                        }}
                      >
                        <CheckCircle2
                          size={10}
                          style={{
                            color: criteresMotDePasse.minuscule
                              ? EPHM_DARK.status.success
                              : EPHM_DARK.neutral.gray400,
                          }}
                        />
                        Minuscule
                      </span>
                      <span
                        className="flex items-center gap-1"
                        style={{
                          color: criteresMotDePasse.majuscule
                            ? EPHM_DARK.status.success
                            : EPHM_DARK.neutral.gray400,
                        }}
                      >
                        <CheckCircle2
                          size={10}
                          style={{
                            color: criteresMotDePasse.majuscule
                              ? EPHM_DARK.status.success
                              : EPHM_DARK.neutral.gray400,
                          }}
                        />
                        Majuscule
                      </span>
                      <span
                        className="flex items-center gap-1"
                        style={{
                          color: criteresMotDePasse.chiffre
                            ? EPHM_DARK.status.success
                            : EPHM_DARK.neutral.gray400,
                        }}
                      >
                        <CheckCircle2
                          size={10}
                          style={{
                            color: criteresMotDePasse.chiffre
                              ? EPHM_DARK.status.success
                              : EPHM_DARK.neutral.gray400,
                          }}
                        />
                        Chiffre
                      </span>
                    </div>
                  </div>
                )}

                {errors.motDePasse && (
                  <p
                    className="text-xs mt-1.5 flex items-center gap-1"
                    style={{ color: EPHM_DARK.status.danger }}
                  >
                    <AlertCircle size={12} />
                    {errors.motDePasse.message}
                  </p>
                )}
              </div>

              {/* Champ Confirmation du mot de passe - CORRIGÉ */}
              <div>
                <label
                  className="label text-sm font-medium"
                  style={{ color: EPHM_DARK.neutral.gray600 }}
                >
                  <Key size={16} className="mr-2" />
                  Confirmer le mot de passe
                </label>
                <div className="relative">
                  <Key
                    size={18}
                    className="absolute left-3 top-1/2 -translate-y-1/2"
                    style={{ color: EPHM_DARK.neutral.gray400 }}
                  />
                  <input
                    type={voirConfirmation ? "text" : "password"}
                    className={`input w-full pl-10 pr-10 ${errors.confirmMotDePasse ? "input-error" : ""}`}
                    style={{
                      backgroundColor: EPHM_DARK.neutral.gray50,
                      borderColor: errors.confirmMotDePasse
                        ? EPHM_DARK.status.danger
                        : EPHM_DARK.neutral.gray200,
                      color: EPHM_DARK.neutral.gray800,
                    }}
                    placeholder="Confirmez votre mot de passe"
                    {...register("confirmMotDePasse")}
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2"
                    onClick={() => setVoirConfirmation(!voirConfirmation)}
                    style={{ color: EPHM_DARK.neutral.gray400 }}
                  >
                    {voirConfirmation ? (
                      <EyeOff size={18} />
                    ) : (
                      <Eye size={18} />
                    )}
                  </button>
                </div>
                {errors.confirmMotDePasse && (
                  <p
                    className="text-xs mt-1.5 flex items-center gap-1"
                    style={{ color: EPHM_DARK.status.danger }}
                  >
                    <AlertCircle size={12} />
                    {errors.confirmMotDePasse.message}
                  </p>
                )}
              </div>

              {/* Conditions d'utilisation - CORRIGÉ */}
              <div className="flex items-start gap-2 mt-2">
                <input
                  type="checkbox"
                  className="checkbox checkbox-sm mt-0.5"
                  style={{
                    accentColor: EPHM_DARK.primary[600],
                    borderColor: EPHM_DARK.neutral.gray200,
                  }}
                  {...register("conditions")}
                />
                <label
                  className="text-xs"
                  style={{ color: EPHM_DARK.neutral.gray400 }}
                >
                  J'accepte les{" "}
                  <Link
                    to="/conditions"
                    className="hover:underline"
                    style={{ color: EPHM_DARK.primary[400] }}
                  >
                    conditions d'utilisation
                  </Link>{" "}
                  et la{" "}
                  <Link
                    to="/confidentialite"
                    className="hover:underline"
                    style={{ color: EPHM_DARK.primary[400] }}
                  >
                    politique de confidentialité
                  </Link>
                </label>
              </div>
              {errors.conditions && (
                <p
                  className="text-xs flex items-center gap-1"
                  style={{ color: EPHM_DARK.status.danger }}
                >
                  <AlertCircle size={12} />
                  {errors.conditions.message}
                </p>
              )}

              {/* Bouton d'inscription */}
              <button
                type="submit"
                className="btn w-full gap-2 text-white font-medium mt-4"
                style={{
                  backgroundColor: EPHM_DARK.primary[600],
                  borderColor: EPHM_DARK.primary[600],
                }}
                disabled={chargement}
                onMouseEnter={(e) => {
                  if (!chargement) {
                    e.currentTarget.style.backgroundColor =
                      EPHM_DARK.primary[500];
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor =
                    EPHM_DARK.primary[600];
                }}
              >
                {chargement ? (
                  <>
                    <span className="loading loading-spinner loading-sm" />
                    Création en cours...
                  </>
                ) : (
                  <>
                    <UserPlus size={18} />
                    Créer mon compte
                  </>
                )}
              </button>

              {/* Lien de connexion */}
              <p
                className="text-center text-sm mt-4"
                style={{ color: EPHM_DARK.neutral.gray400 }}
              >
                Déjà un compte ?{" "}
                <Link
                  to="/login"
                  className="font-medium hover:underline"
                  style={{ color: EPHM_DARK.primary[400] }}
                >
                  Se connecter
                </Link>
              </p>
            </form>

            {/* Séparateur avec indicateur de sécurité */}
            <div className="relative mt-6">
              <div className="absolute inset-0 flex items-center">
                <div
                  className="w-full border-t"
                  style={{ borderColor: EPHM_DARK.neutral.gray200 }}
                />
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
                  Données sécurisées
                </span>
              </div>
            </div>

            {/* Lien retour - visible sur mobile */}
            <div className="lg:hidden mt-4 text-center">
              <Link
                to="/login"
                className="text-sm flex items-center justify-center gap-2 hover:underline"
                style={{ color: EPHM_DARK.neutral.gray400 }}
              >
                <ArrowLeft size={14} />
                Retour à la connexion
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* =====================================
          FOOTER
      ====================================== */}
      <div className="absolute bottom-4 left-0 right-0 text-center">
        <p className="text-xs" style={{ color: EPHM_DARK.neutral.gray400 }}>
          © {new Date().getFullYear()} EPHM — Plateforme analytique hospitalière
          de Madagascar
        </p>
      </div>
    </div>
  );
}
