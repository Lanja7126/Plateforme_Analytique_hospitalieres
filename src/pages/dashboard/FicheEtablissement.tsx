import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, Legend, BarChart, Bar,
  ComposedChart, Area
} from "recharts";
import { getEtablissements, getHistoriqueEtablissement } from "../../api/stats.api";
import { COULEURS_CATEGORIES } from "../../constants/dashboard.constants";
import {
  Search,
  Hospital,
  MapPin,
  Activity,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  CheckCircle2,
  BarChart3,
  LineChart as LineChartIcon,
  Table,
  Calendar,
  Clock,
  HeartPulse,
  Building2,
  Zap,
  Globe,
  Target,
  Gauge,
  Layers,
  PieChart,
  Database,
  FileText,
  ClipboardList,
  CalendarDays,
  Minus,
  Circle,
  ArrowUpRight,
  ArrowDownRight,
  Info,
  X,
  ChevronDown,
  ChevronUp,
  Download,
  Eye,
  EyeOff,
  Printer,
  Lightbulb,
  Users,
} from "lucide-react";

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
    teal: "#00a0a0",
    tealLight: "#4db8b8",
    tealDark: "#004d4d",
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

const formaterPourcentage = (valeur: number | undefined | null, decimals: number = 2): string => {
  if (valeur === undefined || valeur === null || isNaN(valeur)) return "N/A";
  if (valeur > 1) return valeur.toFixed(decimals);
  return (valeur * 100).toFixed(decimals);
};

const getStatutRisque = (tauxMortalite: number, tom: number): { label: string; couleur: string } => {
  if (tauxMortalite > 0.05 || tom > 0.8) {
    return { label: "Critique", couleur: EPHM_DARK.status.danger };
  }
  if (tauxMortalite > 0.03 || tom > 0.6) {
    return { label: "Élevé", couleur: EPHM_DARK.status.warning };
  }
  if (tauxMortalite > 0.01 || tom > 0.4) {
    return { label: "Modéré", couleur: EPHM_DARK.accent.gold };
  }
  return { label: "Maîtrisé", couleur: EPHM_DARK.status.success };
};

export default function FicheEtablissement() {
  const { data: etablissements, isLoading: chargementListe } = useQuery({
    queryKey: ["etablissements"],
    queryFn: getEtablissements,
  });

  const [codeSelectionne, setCodeSelectionne] = useState<string>("");
  const [recherche, setRecherche] = useState("");
  const [ongletActif, setOngletActif] = useState<"vue-ensemble" | "tendances" | "donnees-brutes" | "analyse">("vue-ensemble");
  const [afficherTousMois, setAfficherTousMois] = useState(false);

  const etablissementsFiltres = useMemo(() => {
    if (!etablissements) return [];
    const q = recherche.toLowerCase();
    return etablissements.filter((e) => 
      e.nom_hopital.toLowerCase().includes(q) || 
      e.region.toLowerCase().includes(q) ||
      e.code_hopital.toLowerCase().includes(q)
    );
  }, [etablissements, recherche]);

  const { data: historique, isLoading: chargementHistorique } = useQuery({
    queryKey: ["historique", codeSelectionne],
    queryFn: () => getHistoriqueEtablissement(codeSelectionne),
    enabled: !!codeSelectionne,
  });

  const donneesGraphique = (historique ?? []).map((r) => ({
    periode: `${String(r.mois).padStart(2, "0")}/${r.annee}`,
    IGPH: r.IGPH ?? 0,
    "Taux mortalité (%)": r.taux_mortalite !== undefined ? 
      (r.taux_mortalite > 1 ? r.taux_mortalite : r.taux_mortalite * 100) : 0,
    "TOM (%)": r.TOM !== undefined ? 
      (r.TOM > 1 ? r.TOM : r.TOM * 100) : 0,
    "Haut risque": r.haut_risque ? 1 : 0,
  }));

  const stats = useMemo(() => {
    if (!historique || historique.length === 0) return null;
    
    const igphValues = historique.map(r => r.IGPH ?? 0).filter(v => v > 0);
    const mortaliteValues = historique.map(r => r.taux_mortalite ?? 0);
    const tomValues = historique.map(r => r.TOM ?? 0);
    
    return {
      igphMoyen: igphValues.length > 0 ? igphValues.reduce((a, b) => a + b, 0) / igphValues.length : 0,
      igphMax: Math.max(...igphValues, 0),
      igphMin: Math.min(...igphValues, 0),
      mortaliteMoyenne: mortaliteValues.reduce((a, b) => a + b, 0) / mortaliteValues.length,
      tomMoyen: tomValues.reduce((a, b) => a + b, 0) / tomValues.length,
      moisRisque: historique.filter(r => r.haut_risque).length,
      totalMois: historique.length,
      derniereCategorie: historique[historique.length - 1]?.categorie,
      tendanceIGPH: igphValues.length > 1 ? 
        (igphValues[igphValues.length - 1] - igphValues[0]) / igphValues.length : 0,
      derniereMortalite: mortaliteValues[mortaliteValues.length - 1] || 0,
      derniereTOM: tomValues[tomValues.length - 1] || 0,
    };
  }, [historique]);

  const distributionCategories = useMemo(() => {
    if (!historique) return [];
    const counts: Record<string, number> = {};
    historique.forEach(r => {
      if (r.categorie) {
        counts[r.categorie] = (counts[r.categorie] || 0) + 1;
      }
    });
    return Object.entries(counts).map(([nom, valeur]) => ({ nom, valeur }));
  }, [historique]);

  const derniereEntree = historique?.[historique.length - 1];
  const statutRisque = derniereEntree ? 
    getStatutRisque(derniereEntree.taux_mortalite || 0, derniereEntree.TOM || 0) : 
    { label: "N/A", couleur: EPHM_DARK.neutral.gray400 };

  // Données pour l'analyse
  const donneesAnalyse = useMemo(() => {
    if (!historique || historique.length === 0) return null;
    
    const dernier = historique[historique.length - 1];
    const avantDernier = historique[historique.length - 2];
    
    return {
      evolutionIGPH: dernier && avantDernier ? 
        ((dernier.IGPH || 0) - (avantDernier.IGPH || 0)) / (avantDernier.IGPH || 1) * 100 : 0,
      evolutionMortalite: dernier && avantDernier ? 
        ((dernier.taux_mortalite || 0) - (avantDernier.taux_mortalite || 0)) / (avantDernier.taux_mortalite || 0.01) * 100 : 0,
      moisStables: historique.filter(r => !r.haut_risque).length,
      moisCritiques: historique.filter(r => r.haut_risque).length,
    };
  }, [historique]);

  const derniersMois = useMemo(() => {
    if (!historique) return [];
    return afficherTousMois ? 
      [...historique].reverse() : 
      [...historique].reverse().slice(0, 12);
  }, [historique, afficherTousMois]);

  return (
    <div className="space-y-6 p-6" style={{ backgroundColor: EPHM_DARK.background.page, minHeight: "100vh" }}>

      {/* =====================================
          HEADER
      ====================================== */}

      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2" style={{ color: EPHM_DARK.neutral.gray800 }}>
            <Hospital size={28} style={{ color: EPHM_DARK.primary[400] }} />
            Fiche établissement
          </h1>
          <p style={{ color: EPHM_DARK.neutral.gray400 }}>
            Historique, tendances et profil détaillé d'un hôpital.
          </p>
        </div>
        {codeSelectionne && (
          <div className="flex items-center gap-2">
            <button 
              className="btn btn-sm gap-2"
              style={{ 
                backgroundColor: EPHM_DARK.background.card,
                borderColor: EPHM_DARK.neutral.gray200,
                color: EPHM_DARK.neutral.gray600
              }}
            >
              <Download size={16} />
              Exporter
            </button>
            <button 
              className="btn btn-sm gap-2"
              style={{ 
                backgroundColor: EPHM_DARK.background.card,
                borderColor: EPHM_DARK.neutral.gray200,
                color: EPHM_DARK.neutral.gray600
              }}
            >
              <Printer size={16} />
              Imprimer
            </button>
          </div>
        )}
      </div>

      {/* =====================================
          RECHERCHE
      ====================================== */}

      <div className="max-w-md">
        <label className="label flex items-center gap-2" style={{ color: EPHM_DARK.neutral.gray500 }}>
          <Search size={16} />
          Rechercher un établissement
        </label>
        <div className="relative">
          <Search 
            size={18} 
            className="absolute left-3 top-1/2 -translate-y-1/2" 
            style={{ color: EPHM_DARK.neutral.gray400 }}
          />
          <input
            type="text"
            placeholder="Nom, région ou code..."
            className="input w-full pl-10"
            style={{ 
              backgroundColor: EPHM_DARK.neutral.gray50,
              borderColor: EPHM_DARK.neutral.gray200,
              color: EPHM_DARK.neutral.gray800
            }}
            value={recherche}
            onChange={(e) => setRecherche(e.target.value)}
          />
          {recherche && (
            <button
              className="absolute right-3 top-1/2 -translate-y-1/2"
              onClick={() => setRecherche("")}
              style={{ color: EPHM_DARK.neutral.gray400 }}
            >
              <X size={16} />
            </button>
          )}
        </div>
        {chargementListe ? (
          <div className="mt-2"><span className="loading loading-spinner loading-sm" /></div>
        ) : (
          recherche && (
            <ul 
              className="menu rounded-box mt-1 max-h-56 overflow-y-auto border"
              style={{ 
                backgroundColor: EPHM_DARK.background.card,
                borderColor: EPHM_DARK.neutral.gray200
              }}
            >
              {etablissementsFiltres.slice(0, 15).map((e) => (
                <li key={e.code_hopital}>
                  <button 
                    onClick={() => { 
                      setCodeSelectionne(e.code_hopital); 
                      setRecherche("");
                    }}
                    style={{ color: EPHM_DARK.neutral.gray700 }}
                    className="flex items-center gap-2 w-full"
                  >
                    <Hospital size={16} style={{ color: EPHM_DARK.primary[400] }} />
                    <span className="flex-1 text-left">{e.nom_hopital}</span>
                    <span className="text-xs flex items-center gap-1" style={{ color: EPHM_DARK.neutral.gray400 }}>
                      <MapPin size={12} />
                      {e.region}
                    </span>
                  </button>
                </li>
              ))}
              {etablissementsFiltres.length === 0 && (
                <li className="px-3 py-2 text-sm flex items-center gap-2" style={{ color: EPHM_DARK.neutral.gray400 }}>
                  <AlertTriangle size={14} />
                  Aucun résultat
                </li>
              )}
            </ul>
          )
        )}
      </div>

      {/* =====================================
          ÉTAT VIDE
      ====================================== */}

      {!codeSelectionne && (
        <div 
          className="alert p-6 rounded-xl border flex items-center gap-4"
          style={{ 
            backgroundColor: EPHM_DARK.background.card,
            borderColor: EPHM_DARK.neutral.gray200,
            color: EPHM_DARK.neutral.gray500
          }}
        >
          <div 
            className="rounded-full p-3"
            style={{ backgroundColor: EPHM_DARK.primary[800] + "40" }}
          >
            <Info size={24} style={{ color: EPHM_DARK.primary[300] }} />
          </div>
          <div>
            <p className="font-semibold" style={{ color: EPHM_DARK.neutral.gray700 }}>
              Aucun établissement sélectionné
            </p>
            <p className="text-sm">Recherchez et sélectionnez un établissement ci-dessus pour afficher sa fiche complète.</p>
          </div>
        </div>
      )}

      {/* =====================================
          CHARGEMENT
      ====================================== */}

      {codeSelectionne && chargementHistorique && (
        <div className="flex flex-col items-center justify-center py-12 gap-4">
          <span className="loading loading-spinner loading-lg" style={{ color: EPHM_DARK.primary[400] }} />
          <p style={{ color: EPHM_DARK.neutral.gray400 }}>Chargement des données de l'établissement...</p>
        </div>
      )}

      {/* =====================================
          FICHE ÉTABLISSEMENT
      ====================================== */}

      {derniereEntree && stats && (
        <>
          {/* CARTE D'IDENTITÉ */}
          <div 
            className="card border shadow-sm"
            style={{ 
              borderColor: EPHM_DARK.neutral.gray200,
              backgroundColor: EPHM_DARK.background.card 
            }}
          >
            <div className="card-body">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div 
                    className="rounded-xl p-4"
                    style={{ backgroundColor: EPHM_DARK.primary[800] + "50" }}
                  >
                    <Hospital size={32} style={{ color: EPHM_DARK.primary[300] }} />
                  </div>
                  <div>
                    <h2 className="card-title text-xl" style={{ color: EPHM_DARK.neutral.gray800 }}>
                      {derniereEntree.nom_hopital}
                    </h2>
                    <div className="flex flex-wrap items-center gap-3 text-sm" style={{ color: EPHM_DARK.neutral.gray400 }}>
                      <span className="flex items-center gap-1">
                        <FileText size={14} />
                        {derniereEntree.code_hopital}
                      </span>
                      <span className="w-px h-4" style={{ backgroundColor: EPHM_DARK.neutral.gray200 }} />
                      <span className="flex items-center gap-1">
                        <MapPin size={14} />
                        {derniereEntree.region}
                      </span>
                      <span className="w-px h-4" style={{ backgroundColor: EPHM_DARK.neutral.gray200 }} />
                      <span className="flex items-center gap-1">
                        <Calendar size={14} />
                        Mis à jour le {derniereEntree.mois}/{derniereEntree.annee}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {derniereEntree.categorie && (
                    <span
                      className="badge badge-lg px-4 py-3 text-sm font-semibold flex items-center gap-2"
                      style={{
                        color: COULEURS_CATEGORIES[derniereEntree.categorie] || EPHM_DARK.neutral.gray400,
                        backgroundColor: `${COULEURS_CATEGORIES[derniereEntree.categorie] || EPHM_DARK.neutral.gray400}18`,
                        borderColor: COULEURS_CATEGORIES[derniereEntree.categorie] || EPHM_DARK.neutral.gray400,
                      }}
                    >
                      <Layers size={14} />
                      {derniereEntree.categorie}
                    </span>
                  )}
                  <span
                    className="badge badge-lg px-4 py-3 text-sm font-semibold flex items-center gap-2"
                    style={{
                      color: statutRisque.couleur,
                      backgroundColor: statutRisque.couleur + "18",
                      borderColor: statutRisque.couleur,
                    }}
                  >
                    <Activity size={14} />
                    {statutRisque.label}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-sm md:grid-cols-4 mt-4 pt-4 border-t" style={{ borderColor: EPHM_DARK.neutral.gray200 }}>
                <p className="flex items-center gap-2">
                  <Building2 size={14} style={{ color: EPHM_DARK.neutral.gray400 }} />
                  <span style={{ color: EPHM_DARK.neutral.gray400 }}>Type :</span> 
                  <span style={{ color: EPHM_DARK.neutral.gray700 }}>{derniereEntree.type_etablissement}</span>
                </p>
                <p className="flex items-center gap-2">
                  <Globe size={14} style={{ color: EPHM_DARK.neutral.gray400 }} />
                  <span style={{ color: EPHM_DARK.neutral.gray400 }}>Zone :</span> 
                  <span style={{ color: EPHM_DARK.neutral.gray700 }}>{derniereEntree.zone_geographique}</span>
                </p>
                <p className="flex items-center gap-2">
                  <Zap size={14} style={{ color: EPHM_DARK.neutral.gray400 }} />
                  <span style={{ color: EPHM_DARK.neutral.gray400 }}>Énergie :</span> 
                  <span style={{ color: EPHM_DARK.neutral.gray700 }}>{derniereEntree.source_energie_principale}</span>
                </p>
                <p className="flex items-center gap-2">
                  <Users size={14} style={{ color: EPHM_DARK.neutral.gray400 }} />
                  <span style={{ color: EPHM_DARK.neutral.gray400 }}>Lits :</span> 
                  <span style={{ color: EPHM_DARK.neutral.gray700 }}>
                    {derniereEntree.lits_disponibles || "N/A"}
                  </span>
                </p>
              </div>
            </div>
          </div>

          {/* =====================================
              KPI RAPIDES
          ====================================== */}

          <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
            <div 
              className="stat rounded-xl border p-4"
              style={{ 
                borderColor: EPHM_DARK.neutral.gray200,
                backgroundColor: EPHM_DARK.background.card 
              }}
            >
              <div className="stat-title text-xs flex items-center gap-2" style={{ color: EPHM_DARK.neutral.gray400 }}>
                <Gauge size={14} />
                IGPH
              </div>
              <div className="stat-value text-xl font-bold" style={{ color: EPHM_DARK.primary[300] }}>
                {derniereEntree.IGPH?.toFixed(3) ?? "—"}
              </div>
              <div className="stat-desc text-xs" style={{ color: EPHM_DARK.neutral.gray500 }}>
                {stats.tendanceIGPH > 0 ? (
                  <span className="flex items-center gap-1" style={{ color: EPHM_DARK.status.success }}>
                    <TrendingUp size={12} /> +{stats.tendanceIGPH.toFixed(3)}
                  </span>
                ) : stats.tendanceIGPH < 0 ? (
                  <span className="flex items-center gap-1" style={{ color: EPHM_DARK.status.danger }}>
                    <TrendingDown size={12} /> {stats.tendanceIGPH.toFixed(3)}
                  </span>
                ) : (
                  <span className="flex items-center gap-1">
                    <Minus size={12} /> Stable
                  </span>
                )}
              </div>
            </div>

            <div 
              className="stat rounded-xl border p-4"
              style={{ 
                borderColor: EPHM_DARK.neutral.gray200,
                backgroundColor: EPHM_DARK.background.card 
              }}
            >
              <div className="stat-title text-xs flex items-center gap-2" style={{ color: EPHM_DARK.neutral.gray400 }}>
                <HeartPulse size={14} />
                Mortalité
              </div>
              <div className="stat-value text-xl font-bold" style={{ 
                color: (derniereEntree.taux_mortalite || 0) > 0.05 ? EPHM_DARK.status.danger : EPHM_DARK.neutral.gray700 
              }}>
                {formaterPourcentage(derniereEntree.taux_mortalite, 2)} %
              </div>
              <div className="stat-desc text-xs" style={{ color: EPHM_DARK.neutral.gray500 }}>
                Moyenne: {formaterPourcentage(stats.mortaliteMoyenne, 2)} %
              </div>
            </div>

            <div 
              className="stat rounded-xl border p-4"
              style={{ 
                borderColor: EPHM_DARK.neutral.gray200,
                backgroundColor: EPHM_DARK.background.card 
              }}
            >
              <div className="stat-title text-xs flex items-center gap-2" style={{ color: EPHM_DARK.neutral.gray400 }}>
                <Target size={14} />
                TOM
              </div>
              <div className="stat-value text-xl font-bold" style={{ color: EPHM_DARK.accent.gold }}>
                {formaterPourcentage(derniereEntree.TOM, 1)} %
              </div>
              <div className="stat-desc text-xs" style={{ color: EPHM_DARK.neutral.gray500 }}>
                Moyenne: {formaterPourcentage(stats.tomMoyen, 1)} %
              </div>
            </div>

            <div 
              className="stat rounded-xl border p-4"
              style={{ 
                borderColor: EPHM_DARK.neutral.gray200,
                backgroundColor: EPHM_DARK.background.card 
              }}
            >
              <div className="stat-title text-xs flex items-center gap-2" style={{ color: EPHM_DARK.neutral.gray400 }}>
                <AlertTriangle size={14} />
                Mois à risque
              </div>
              <div className="stat-value text-xl font-bold" style={{ 
                color: stats.moisRisque > stats.totalMois * 0.3 ? EPHM_DARK.status.danger : EPHM_DARK.neutral.gray700 
              }}>
                {stats.moisRisque} / {stats.totalMois}
              </div>
              <div className="stat-desc text-xs" style={{ color: EPHM_DARK.neutral.gray500 }}>
                {((stats.moisRisque / stats.totalMois) * 100).toFixed(0)}% des mois
              </div>
            </div>

            <div 
              className="stat rounded-xl border p-4"
              style={{ 
                borderColor: EPHM_DARK.neutral.gray200,
                backgroundColor: EPHM_DARK.background.card 
              }}
            >
              <div className="stat-title text-xs flex items-center gap-2" style={{ color: EPHM_DARK.neutral.gray400 }}>
                <Clock size={14} />
                Période analysée
              </div>
              <div className="stat-value text-xl font-bold" style={{ color: EPHM_DARK.neutral.gray700 }}>
                {stats.totalMois} mois
              </div>
              <div className="stat-desc text-xs" style={{ color: EPHM_DARK.neutral.gray500 }}>
                {historique?.[0]?.annee || "—"} - {derniereEntree.annee}
              </div>
            </div>
          </div>

          {/* =====================================
              STATISTIQUES DÉTAILLÉES
          ====================================== */}

          <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
            <div 
              className="rounded-xl border p-4"
              style={{ 
                borderColor: EPHM_DARK.neutral.gray200,
                backgroundColor: EPHM_DARK.background.card 
              }}
            >
              <h3 className="text-sm font-semibold flex items-center gap-2" style={{ color: EPHM_DARK.neutral.gray700 }}>
                <BarChart3 size={16} />
                IGPH
              </h3>
              <div className="mt-2 space-y-1 text-sm">
                <div className="flex justify-between items-center">
                  <span style={{ color: EPHM_DARK.neutral.gray400 }}>Moyenne</span>
                  <span style={{ color: EPHM_DARK.neutral.gray700 }}>{stats.igphMoyen.toFixed(3)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span style={{ color: EPHM_DARK.neutral.gray400 }}>Max</span>
                  <span className="flex items-center gap-1" style={{ color: EPHM_DARK.status.success }}>
                    <ArrowUpRight size={14} /> {stats.igphMax.toFixed(3)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span style={{ color: EPHM_DARK.neutral.gray400 }}>Min</span>
                  <span className="flex items-center gap-1" style={{ color: EPHM_DARK.status.danger }}>
                    <ArrowDownRight size={14} /> {stats.igphMin.toFixed(3)}
                  </span>
                </div>
              </div>
            </div>

            <div 
              className="rounded-xl border p-4"
              style={{ 
                borderColor: EPHM_DARK.neutral.gray200,
                backgroundColor: EPHM_DARK.background.card 
              }}
            >
              <h3 className="text-sm font-semibold flex items-center gap-2" style={{ color: EPHM_DARK.neutral.gray700 }}>
                <HeartPulse size={16} />
                Mortalité
              </h3>
              <div className="mt-2 space-y-1 text-sm">
                <div className="flex justify-between items-center">
                  <span style={{ color: EPHM_DARK.neutral.gray400 }}>Actuelle</span>
                  <span style={{ color: EPHM_DARK.neutral.gray700 }}>
                    {formaterPourcentage(stats.derniereMortalite, 2)} %
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span style={{ color: EPHM_DARK.neutral.gray400 }}>Moyenne</span>
                  <span style={{ color: EPHM_DARK.neutral.gray700 }}>
                    {formaterPourcentage(stats.mortaliteMoyenne, 2)} %
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span style={{ color: EPHM_DARK.neutral.gray400 }}>Tendance</span>
                  {donneesAnalyse && donneesAnalyse.evolutionMortalite > 0 ? (
                    <span className="flex items-center gap-1" style={{ color: EPHM_DARK.status.danger }}>
                      <TrendingUp size={14} /> +{donneesAnalyse.evolutionMortalite.toFixed(1)}%
                    </span>
                  ) : donneesAnalyse && donneesAnalyse.evolutionMortalite < 0 ? (
                    <span className="flex items-center gap-1" style={{ color: EPHM_DARK.status.success }}>
                      <TrendingDown size={14} /> {donneesAnalyse.evolutionMortalite.toFixed(1)}%
                    </span>
                  ) : (
                    <span className="flex items-center gap-1" style={{ color: EPHM_DARK.neutral.gray400 }}>
                      <Minus size={14} /> Stable
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div 
              className="rounded-xl border p-4"
              style={{ 
                borderColor: EPHM_DARK.neutral.gray200,
                backgroundColor: EPHM_DARK.background.card 
              }}
            >
              <h3 className="text-sm font-semibold flex items-center gap-2" style={{ color: EPHM_DARK.neutral.gray700 }}>
                <Activity size={16} />
                Stabilité
              </h3>
              <div className="mt-2 space-y-1 text-sm">
                <div className="flex justify-between items-center">
                  <span style={{ color: EPHM_DARK.neutral.gray400 }}>Mois stables</span>
                  <span style={{ color: EPHM_DARK.status.success }}>
                    {donneesAnalyse?.moisStables || 0}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span style={{ color: EPHM_DARK.neutral.gray400 }}>Mois critiques</span>
                  <span style={{ color: EPHM_DARK.status.danger }}>
                    {donneesAnalyse?.moisCritiques || 0}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span style={{ color: EPHM_DARK.neutral.gray400 }}>Taux de stabilité</span>
                  <span style={{ color: EPHM_DARK.neutral.gray700 }}>
                    {stats.totalMois > 0 ? 
                      (((donneesAnalyse?.moisStables || 0) / stats.totalMois) * 100).toFixed(0) : 0}%
                  </span>
                </div>
              </div>
            </div>

            <div 
              className="rounded-xl border p-4"
              style={{ 
                borderColor: EPHM_DARK.neutral.gray200,
                backgroundColor: EPHM_DARK.background.card 
              }}
            >
              <h3 className="text-sm font-semibold flex items-center gap-2" style={{ color: EPHM_DARK.neutral.gray700 }}>
                <PieChart size={16} />
                Catégories
              </h3>
              <div className="mt-2 space-y-1">
                {distributionCategories.slice(0, 3).map(({ nom, valeur }) => (
                  <div key={nom} className="flex items-center gap-2">
                    <Circle 
                      size={8} 
                      className="shrink-0" 
                      fill={COULEURS_CATEGORIES[nom] || EPHM_DARK.neutral.gray400}
                      stroke={COULEURS_CATEGORIES[nom] || EPHM_DARK.neutral.gray400}
                    />
                    <span className="text-sm flex-1 truncate" style={{ color: EPHM_DARK.neutral.gray600 }}>
                      {nom}
                    </span>
                    <span className="text-sm font-semibold" style={{ color: EPHM_DARK.neutral.gray700 }}>
                      {valeur}
                    </span>
                  </div>
                ))}
                {distributionCategories.length > 3 && (
                  <span className="text-xs" style={{ color: EPHM_DARK.neutral.gray400 }}>
                    +{distributionCategories.length - 3} autres
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* =====================================
              ONGLETS DE NAVIGATION
          ====================================== */}

          <div 
            className="tabs tabs-boxed rounded-xl border p-1 flex overflow-x-auto"
            style={{ 
              borderColor: EPHM_DARK.neutral.gray200,
              backgroundColor: EPHM_DARK.background.card 
            }}
          >
            <button
              className={`tab flex-1 flex items-center justify-center gap-2 whitespace-nowrap ${ongletActif === "vue-ensemble" ? "tab-active" : ""}`}
              style={{ 
                color: ongletActif === "vue-ensemble" ? EPHM_DARK.neutral.gray800 : EPHM_DARK.neutral.gray400,
                backgroundColor: ongletActif === "vue-ensemble" ? EPHM_DARK.primary[600] : "transparent",
              }}
              onClick={() => setOngletActif("vue-ensemble")}
            >
              <BarChart3 size={16} />
              Vue d'ensemble
            </button>
            <button
              className={`tab flex-1 flex items-center justify-center gap-2 whitespace-nowrap ${ongletActif === "tendances" ? "tab-active" : ""}`}
              style={{ 
                color: ongletActif === "tendances" ? EPHM_DARK.neutral.gray800 : EPHM_DARK.neutral.gray400,
                backgroundColor: ongletActif === "tendances" ? EPHM_DARK.primary[600] : "transparent",
              }}
              onClick={() => setOngletActif("tendances")}
            >
              <LineChartIcon size={16} />
              Tendances
            </button>
            <button
              className={`tab flex-1 flex items-center justify-center gap-2 whitespace-nowrap ${ongletActif === "analyse" ? "tab-active" : ""}`}
              style={{ 
                color: ongletActif === "analyse" ? EPHM_DARK.neutral.gray800 : EPHM_DARK.neutral.gray400,
                backgroundColor: ongletActif === "analyse" ? EPHM_DARK.primary[600] : "transparent",
              }}
              onClick={() => setOngletActif("analyse")}
            >
              <ClipboardList size={16} />
              Analyse
            </button>
            <button
              className={`tab flex-1 flex items-center justify-center gap-2 whitespace-nowrap ${ongletActif === "donnees-brutes" ? "tab-active" : ""}`}
              style={{ 
                color: ongletActif === "donnees-brutes" ? EPHM_DARK.neutral.gray800 : EPHM_DARK.neutral.gray400,
                backgroundColor: ongletActif === "donnees-brutes" ? EPHM_DARK.primary[600] : "transparent",
              }}
              onClick={() => setOngletActif("donnees-brutes")}
            >
              <Table size={16} />
              Données brutes
            </button>
          </div>

          {/* =====================================
              ONGLET 1: VUE D'ENSEMBLE
          ====================================== */}

          {ongletActif === "vue-ensemble" && (
            <>
              <div 
                className="card border shadow-sm"
                style={{ 
                  borderColor: EPHM_DARK.neutral.gray200,
                  backgroundColor: EPHM_DARK.background.card 
                }}
              >
                <div className="card-body">
                  <h2 className="card-title text-base flex items-center gap-2" style={{ color: EPHM_DARK.neutral.gray700 }}>
                    <LineChartIcon size={18} />
                    Évolution mensuelle - Vue d'ensemble
                  </h2>
                  <div style={{ width: "100%", height: 320 }}>
                    <ResponsiveContainer>
                      <ComposedChart data={donneesGraphique}>
                        <CartesianGrid strokeDasharray="3 3" stroke={EPHM_DARK.neutral.gray200} />
                        <XAxis dataKey="periode" stroke={EPHM_DARK.neutral.gray400} />
                        <YAxis yAxisId="left" stroke={EPHM_DARK.neutral.gray400} />
                        <YAxis yAxisId="right" orientation="right" stroke={EPHM_DARK.neutral.gray400} />
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: EPHM_DARK.background.card,
                            borderColor: EPHM_DARK.neutral.gray200,
                            color: EPHM_DARK.neutral.gray800
                          }}
                        />
                        <Legend />
                        <Line 
                          yAxisId="left"
                          type="monotone" 
                          dataKey="IGPH" 
                          stroke={EPHM_DARK.primary[400]} 
                          strokeWidth={2} 
                          dot={{ fill: EPHM_DARK.primary[400] }}
                        />
                        <Line 
                          yAxisId="right"
                          type="monotone" 
                          dataKey="Taux mortalité (%)" 
                          stroke={EPHM_DARK.status.danger} 
                          strokeWidth={2}
                          dot={{ fill: EPHM_DARK.status.danger }}
                        />
                        <Area 
                          yAxisId="right"
                          type="monotone" 
                          dataKey="TOM (%)" 
                          stroke={EPHM_DARK.accent.gold} 
                          fill={EPHM_DARK.accent.gold + "30"}
                          strokeWidth={1}
                        />
                      </ComposedChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>

              <div 
                className="card border shadow-sm"
                style={{ 
                  borderColor: EPHM_DARK.neutral.gray200,
                  backgroundColor: EPHM_DARK.background.card 
                }}
              >
                <div className="card-body">
                  <h2 className="card-title text-base flex items-center gap-2" style={{ color: EPHM_DARK.neutral.gray700 }}>
                    <PieChart size={18} />
                    Distribution des catégories
                  </h2>
                  <div style={{ width: "100%", height: 250 }}>
                    <ResponsiveContainer>
                      <BarChart data={distributionCategories}>
                        <CartesianGrid strokeDasharray="3 3" stroke={EPHM_DARK.neutral.gray200} />
                        <XAxis dataKey="nom" stroke={EPHM_DARK.neutral.gray400} />
                        <YAxis stroke={EPHM_DARK.neutral.gray400} />
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: EPHM_DARK.background.card,
                            borderColor: EPHM_DARK.neutral.gray200,
                            color: EPHM_DARK.neutral.gray800
                          }}
                        />
                        <Bar 
                          dataKey="valeur" 
                          fill={EPHM_DARK.primary[400]}
                          radius={[4, 4, 0, 0]}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* =====================================
              ONGLET 2: TENDANCES
          ====================================== */}

          {ongletActif === "tendances" && (
            <div 
              className="card border shadow-sm"
              style={{ 
                borderColor: EPHM_DARK.neutral.gray200,
                backgroundColor: EPHM_DARK.background.card 
              }}
            >
              <div className="card-body">
                <h2 className="card-title text-base flex items-center gap-2" style={{ color: EPHM_DARK.neutral.gray700 }}>
                  <TrendingUp size={18} />
                  Tendance des indicateurs clés
                </h2>
                <div className="grid gap-6 md:grid-cols-3">
                  <div>
                    <h3 className="text-sm font-semibold flex items-center gap-2" style={{ color: EPHM_DARK.neutral.gray500 }}>
                      <Gauge size={14} />
                      IGPH
                    </h3>
                    <div style={{ width: "100%", height: 200 }}>
                      <ResponsiveContainer>
                        <LineChart data={donneesGraphique}>
                          <CartesianGrid strokeDasharray="3 3" stroke={EPHM_DARK.neutral.gray200} />
                          <XAxis dataKey="periode" stroke={EPHM_DARK.neutral.gray400} fontSize={10} />
                          <YAxis stroke={EPHM_DARK.neutral.gray400} fontSize={10} />
                          <Tooltip 
                            contentStyle={{ 
                              backgroundColor: EPHM_DARK.background.card,
                              borderColor: EPHM_DARK.neutral.gray200,
                              color: EPHM_DARK.neutral.gray800
                            }}
                          />
                          <Line 
                            type="monotone" 
                            dataKey="IGPH" 
                            stroke={EPHM_DARK.primary[400]} 
                            strokeWidth={2} 
                            dot={false}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-semibold flex items-center gap-2" style={{ color: EPHM_DARK.neutral.gray500 }}>
                      <HeartPulse size={14} />
                      Taux de mortalité
                    </h3>
                    <div style={{ width: "100%", height: 200 }}>
                      <ResponsiveContainer>
                        <LineChart data={donneesGraphique}>
                          <CartesianGrid strokeDasharray="3 3" stroke={EPHM_DARK.neutral.gray200} />
                          <XAxis dataKey="periode" stroke={EPHM_DARK.neutral.gray400} fontSize={10} />
                          <YAxis stroke={EPHM_DARK.neutral.gray400} fontSize={10} />
                          <Tooltip 
                            contentStyle={{ 
                              backgroundColor: EPHM_DARK.background.card,
                              borderColor: EPHM_DARK.neutral.gray200,
                              color: EPHM_DARK.neutral.gray800
                            }}
                          />
                          <Line 
                            type="monotone" 
                            dataKey="Taux mortalité (%)" 
                            stroke={EPHM_DARK.status.danger} 
                            strokeWidth={2}
                            dot={false}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-semibold flex items-center gap-2" style={{ color: EPHM_DARK.neutral.gray500 }}>
                      <Target size={14} />
                      TOM
                    </h3>
                    <div style={{ width: "100%", height: 200 }}>
                      <ResponsiveContainer>
                        <LineChart data={donneesGraphique}>
                          <CartesianGrid strokeDasharray="3 3" stroke={EPHM_DARK.neutral.gray200} />
                          <XAxis dataKey="periode" stroke={EPHM_DARK.neutral.gray400} fontSize={10} />
                          <YAxis stroke={EPHM_DARK.neutral.gray400} fontSize={10} />
                          <Tooltip 
                            contentStyle={{ 
                              backgroundColor: EPHM_DARK.background.card,
                              borderColor: EPHM_DARK.neutral.gray200,
                              color: EPHM_DARK.neutral.gray800
                            }}
                          />
                          <Line 
                            type="monotone" 
                            dataKey="TOM (%)" 
                            stroke={EPHM_DARK.accent.gold} 
                            strokeWidth={2}
                            dot={false}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* =====================================
              ONGLET 3: ANALYSE
          ====================================== */}

          {ongletActif === "analyse" && (
            <div className="space-y-4">
              {/* Résumé analytique */}
              <div 
                className="card border shadow-sm"
                style={{ 
                  borderColor: EPHM_DARK.neutral.gray200,
                  backgroundColor: EPHM_DARK.background.card 
                }}
              >
                <div className="card-body">
                  <h2 className="card-title text-base flex items-center gap-2" style={{ color: EPHM_DARK.neutral.gray700 }}>
                    <ClipboardList size={18} />
                    Analyse de performance
                  </h2>
                  <div className="grid gap-4 md:grid-cols-3">
                    <div className="rounded-lg p-4" style={{ backgroundColor: EPHM_DARK.neutral.gray50 }}>
                      <div className="flex items-center justify-between">
                        <span className="text-sm" style={{ color: EPHM_DARK.neutral.gray400 }}>Performance globale</span>
                        <span 
                          className="text-2xl font-bold"
                          style={{ 
                            color: stats.igphMoyen > 0.7 ? EPHM_DARK.status.success : 
                                   stats.igphMoyen > 0.4 ? EPHM_DARK.accent.gold : 
                                   EPHM_DARK.status.danger
                          }}
                        >
                          {stats.igphMoyen > 0.7 ? "✅" : stats.igphMoyen > 0.4 ? "⚠️" : "❌"}
                        </span>
                      </div>
                      <p className="text-sm mt-1" style={{ color: EPHM_DARK.neutral.gray600 }}>
                        IGPH moyen: {stats.igphMoyen.toFixed(3)}
                      </p>
                      <div className="mt-2 h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: EPHM_DARK.neutral.gray200 }}>
                        <div 
                          className="h-full rounded-full"
                          style={{ 
                            width: `${Math.min(stats.igphMoyen * 100, 100)}%`,
                            backgroundColor: stats.igphMoyen > 0.7 ? EPHM_DARK.status.success : 
                                           stats.igphMoyen > 0.4 ? EPHM_DARK.accent.gold : 
                                           EPHM_DARK.status.danger
                          }}
                        />
                      </div>
                    </div>

                    <div className="rounded-lg p-4" style={{ backgroundColor: EPHM_DARK.neutral.gray50 }}>
                      <div className="flex items-center justify-between">
                        <span className="text-sm" style={{ color: EPHM_DARK.neutral.gray400 }}>Stabilité</span>
                        <span 
                          className="text-2xl font-bold"
                          style={{ 
                            color: (donneesAnalyse?.moisCritiques || 0) < stats.totalMois * 0.2 ? 
                              EPHM_DARK.status.success : 
                              (donneesAnalyse?.moisCritiques || 0) < stats.totalMois * 0.4 ? 
                              EPHM_DARK.accent.gold : 
                              EPHM_DARK.status.danger
                          }}
                        >
                          {(donneesAnalyse?.moisCritiques || 0) < stats.totalMois * 0.2 ? "🟢" : 
                           (donneesAnalyse?.moisCritiques || 0) < stats.totalMois * 0.4 ? "🟡" : "🔴"}
                        </span>
                      </div>
                      <p className="text-sm mt-1" style={{ color: EPHM_DARK.neutral.gray600 }}>
                        {donneesAnalyse?.moisStables || 0} mois stables / {stats.totalMois} total
                      </p>
                      <div className="mt-2 h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: EPHM_DARK.neutral.gray200 }}>
                        <div 
                          className="h-full rounded-full"
                          style={{ 
                            width: `${((donneesAnalyse?.moisStables || 0) / stats.totalMois) * 100}%`,
                            backgroundColor: EPHM_DARK.primary[400]
                          }}
                        />
                      </div>
                    </div>

                    <div className="rounded-lg p-4" style={{ backgroundColor: EPHM_DARK.neutral.gray50 }}>
                      <div className="flex items-center justify-between">
                        <span className="text-sm" style={{ color: EPHM_DARK.neutral.gray400 }}>Tendance</span>
                        <span 
                          className="text-2xl font-bold"
                          style={{ 
                            color: stats.tendanceIGPH > 0 ? EPHM_DARK.status.success : 
                                   stats.tendanceIGPH < 0 ? EPHM_DARK.status.danger : 
                                   EPHM_DARK.neutral.gray400
                          }}
                        >
                          {stats.tendanceIGPH > 0 ? "📈" : stats.tendanceIGPH < 0 ? "📉" : "➖"}
                        </span>
                      </div>
                      <p className="text-sm mt-1" style={{ color: EPHM_DARK.neutral.gray600 }}>
                        {stats.tendanceIGPH > 0 ? "Amélioration" : 
                         stats.tendanceIGPH < 0 ? "Détérioration" : "Stable"}
                      </p>
                      <div className="mt-2 text-sm font-semibold" style={{ 
                        color: stats.tendanceIGPH > 0 ? EPHM_DARK.status.success : 
                               stats.tendanceIGPH < 0 ? EPHM_DARK.status.danger : 
                               EPHM_DARK.neutral.gray400
                      }}>
                        {stats.tendanceIGPH > 0 ? "+" : ""}{stats.tendanceIGPH.toFixed(4)} / mois
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Recommandations */}
              <div 
                className="card border shadow-sm"
                style={{ 
                  borderColor: EPHM_DARK.neutral.gray200,
                  backgroundColor: EPHM_DARK.background.card 
                }}
              >
                <div className="card-body">
                  <h2 className="card-title text-base flex items-center gap-2" style={{ color: EPHM_DARK.neutral.gray700 }}>
                    <Lightbulb size={18} />
                    Recommandations
                  </h2>
                  <div className="space-y-2">
                    {stats.tendanceIGPH < 0 && (
                      <div className="flex items-start gap-3 p-3 rounded-lg" style={{ backgroundColor: EPHM_DARK.status.danger + "15" }}>
                        <AlertTriangle size={18} style={{ color: EPHM_DARK.status.danger, marginTop: 2 }} />
                        <div>
                          <p className="font-semibold" style={{ color: EPHM_DARK.status.danger }}>
                            IGPH en baisse
                          </p>
                          <p className="text-sm" style={{ color: EPHM_DARK.neutral.gray500 }}>
                            L'IGPH moyen est en baisse constante. Une analyse approfondie des facteurs de performance est recommandée.
                          </p>
                        </div>
                      </div>
                    )}
                    {(stats.moisRisque / stats.totalMois) > 0.3 && (
                      <div className="flex items-start gap-3 p-3 rounded-lg" style={{ backgroundColor: EPHM_DARK.status.warning + "15" }}>
                        <AlertTriangle size={18} style={{ color: EPHM_DARK.status.warning, marginTop: 2 }} />
                        <div>
                          <p className="font-semibold" style={{ color: EPHM_DARK.status.warning }}>
                            Taux de risque élevé
                          </p>
                          <p className="text-sm" style={{ color: EPHM_DARK.neutral.gray500 }}>
                            {((stats.moisRisque / stats.totalMois) * 100).toFixed(0)}% des mois sont en haut risque. 
                            Une évaluation des protocoles de soins est recommandée.
                          </p>
                        </div>
                      </div>
                    )}
                    {stats.mortaliteMoyenne > 0.05 && (
                      <div className="flex items-start gap-3 p-3 rounded-lg" style={{ backgroundColor: EPHM_DARK.status.danger + "15" }}>
                        <HeartPulse size={18} style={{ color: EPHM_DARK.status.danger, marginTop: 2 }} />
                        <div>
                          <p className="font-semibold" style={{ color: EPHM_DARK.status.danger }}>
                            Mortalité élevée
                          </p>
                          <p className="text-sm" style={{ color: EPHM_DARK.neutral.gray500 }}>
                            Le taux de mortalité moyen ({formaterPourcentage(stats.mortaliteMoyenne, 2)}%) 
                            est supérieur au seuil recommandé. Une revue des pratiques cliniques est nécessaire.
                          </p>
                        </div>
                      </div>
                    )}
                    {stats.tendanceIGPH > 0 && stats.mortaliteMoyenne < 0.03 && stats.moisRisque === 0 && (
                      <div className="flex items-start gap-3 p-3 rounded-lg" style={{ backgroundColor: EPHM_DARK.status.success + "15" }}>
                        <CheckCircle2 size={18} style={{ color: EPHM_DARK.status.success, marginTop: 2 }} />
                        <div>
                          <p className="font-semibold" style={{ color: EPHM_DARK.status.success }}>
                            Performance exemplaire
                          </p>
                          <p className="text-sm" style={{ color: EPHM_DARK.neutral.gray500 }}>
                            L'établissement affiche d'excellents résultats. Continuez à maintenir ces standards de qualité.
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* =====================================
              ONGLET 4: DONNÉES BRUTES
          ====================================== */}

          {ongletActif === "donnees-brutes" && (
            <div 
              className="rounded-xl border"
              style={{ 
                borderColor: EPHM_DARK.neutral.gray200,
                backgroundColor: EPHM_DARK.background.card 
              }}
            >
              <div className="p-4 border-b flex items-center justify-between flex-wrap gap-2" style={{ borderColor: EPHM_DARK.neutral.gray200 }}>
                <div className="flex items-center gap-2">
                  <Database size={18} style={{ color: EPHM_DARK.primary[400] }} />
                  <span style={{ color: EPHM_DARK.neutral.gray700 }}>
                    Historique complet ({historique?.length || 0} enregistrements)
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    className="btn btn-sm gap-2"
                    style={{ 
                      backgroundColor: EPHM_DARK.neutral.gray50,
                      borderColor: EPHM_DARK.neutral.gray200,
                      color: EPHM_DARK.neutral.gray600
                    }}
                    onClick={() => setAfficherTousMois(!afficherTousMois)}
                  >
                    {afficherTousMois ? (
                      <>
                        <EyeOff size={14} />
                        Voir les 12 derniers mois
                      </>
                    ) : (
                      <>
                        <Eye size={14} />
                        Voir tous les mois
                      </>
                    )}
                  </button>
                  <button
                    className="btn btn-sm gap-2"
                    style={{ 
                      backgroundColor: EPHM_DARK.neutral.gray50,
                      borderColor: EPHM_DARK.neutral.gray200,
                      color: EPHM_DARK.neutral.gray600
                    }}
                  >
                    <Download size={14} />
                    Exporter CSV
                  </button>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="table table-sm">
                  <thead>
                    <tr style={{ color: EPHM_DARK.neutral.gray500 }}>
                      <th className="flex items-center gap-2">
                        <CalendarDays size={14} />
                        Année
                      </th>
                      <th>
                        <Clock size={14} />
                        Mois
                      </th>
                      <th>
                        <Layers size={14} />
                        Catégorie
                      </th>
                      <th>
                        <Gauge size={14} />
                        IGPH
                      </th>
                      <th>
                        <Target size={14} />
                        TOM (%)
                      </th>
                      <th>
                        <HeartPulse size={14} />
                        Mortalité (%)
                      </th>
                      <th>
                        <AlertTriangle size={14} />
                        Risque
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {derniersMois.map((r) => (
                      <tr key={r._id} style={{ color: EPHM_DARK.neutral.gray700 }}>
                        <td>{r.annee}</td>
                        <td>{r.mois}</td>
                        <td>
                          {r.categorie ? (
                            <span
                              className="badge badge-sm flex items-center gap-1"
                              style={{
                                color: COULEURS_CATEGORIES[r.categorie] || EPHM_DARK.neutral.gray400,
                                backgroundColor: `${COULEURS_CATEGORIES[r.categorie] || EPHM_DARK.neutral.gray400}18`,
                                borderColor: COULEURS_CATEGORIES[r.categorie] || EPHM_DARK.neutral.gray400,
                              }}
                            >
                              <Layers size={10} />
                              {r.categorie}
                            </span>
                          ) : (
                            <span style={{ color: EPHM_DARK.neutral.gray400 }}>—</span>
                          )}
                        </td>
                        <td style={{ color: r.IGPH ? EPHM_DARK.neutral.gray700 : EPHM_DARK.neutral.gray400 }}>
                          {r.IGPH?.toFixed(3) ?? "—"}
                        </td>
                        <td>{formaterPourcentage(r.TOM, 1)}</td>
                        <td style={{ 
                          color: (r.taux_mortalite || 0) > 0.05 ? EPHM_DARK.status.danger : EPHM_DARK.neutral.gray600 
                        }}>
                          {formaterPourcentage(r.taux_mortalite, 2)}
                        </td>
                        <td>
                          {r.haut_risque ? (
                            <span 
                              className="badge badge-sm flex items-center gap-1"
                              style={{ 
                                backgroundColor: EPHM_DARK.status.danger + "30",
                                color: EPHM_DARK.status.danger,
                                borderColor: EPHM_DARK.status.danger
                              }}
                            >
                              <AlertTriangle size={10} />
                              Critique
                            </span>
                          ) : (
                            <span className="flex items-center gap-1" style={{ color: EPHM_DARK.status.success }}>
                              <CheckCircle2 size={12} />
                              OK
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                    {derniersMois.length === 0 && (
                      <tr>
                        <td colSpan={7} className="text-center py-8" style={{ color: EPHM_DARK.neutral.gray400 }}>
                          Aucune donnée disponible
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
              {historique && historique.length > 12 && (
                <div className="p-3 text-center border-t" style={{ borderColor: EPHM_DARK.neutral.gray200 }}>
                  <button
                    className="text-sm flex items-center gap-2 mx-auto"
                    style={{ color: EPHM_DARK.primary[400] }}
                    onClick={() => setAfficherTousMois(!afficherTousMois)}
                  >
                    {afficherTousMois ? (
                      <>
                        <ChevronUp size={14} />
                        Voir les 12 derniers mois
                      </>
                    ) : (
                      <>
                        <ChevronDown size={14} />
                        Voir tous les mois ({historique.length} enregistrements)
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          )}

          {/* =====================================
              RÉSUMÉ DES INDICATEURS
          ====================================== */}

          <div 
            className="rounded-xl border p-4 text-sm"
            style={{ 
              borderColor: EPHM_DARK.neutral.gray200,
              backgroundColor: EPHM_DARK.background.card 
            }}
          >
            <h3 className="font-semibold flex items-center gap-2" style={{ color: EPHM_DARK.neutral.gray700 }}>
              <FileText size={16} />
              Synthèse des indicateurs
            </h3>
            <div className="mt-2 grid gap-2 md:grid-cols-3" style={{ color: EPHM_DARK.neutral.gray500 }}>
              <div className="flex items-center gap-2">
                <Calendar size={14} />
                <span className="font-medium" style={{ color: EPHM_DARK.neutral.gray600 }}>
                  Période :
                </span> 
                {stats.totalMois} mois
                {stats.moisRisque > 0 && (
                  <span className="flex items-center gap-1" style={{ color: EPHM_DARK.status.danger }}>
                    <AlertTriangle size={12} />
                    ({stats.moisRisque} critiques)
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <Gauge size={14} />
                <span className="font-medium" style={{ color: EPHM_DARK.neutral.gray600 }}>
                  IGPH moyen :
                </span> 
                {stats.igphMoyen.toFixed(3)}
                {stats.tendanceIGPH > 0 ? (
                  <span className="flex items-center gap-1" style={{ color: EPHM_DARK.status.success }}>
                    <TrendingUp size={14} /> ↗
                  </span>
                ) : stats.tendanceIGPH < 0 ? (
                  <span className="flex items-center gap-1" style={{ color: EPHM_DARK.status.danger }}>
                    <TrendingDown size={14} /> ↘
                  </span>
                ) : (
                  <span className="flex items-center gap-1" style={{ color: EPHM_DARK.neutral.gray400 }}>
                    <Minus size={14} /> →
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <Activity size={14} />
                <span className="font-medium" style={{ color: EPHM_DARK.neutral.gray600 }}>
                  Catégorie actuelle :
                </span> 
                <span style={{ color: EPHM_DARK.neutral.gray700 }}>
                  {stats.derniereCategorie || "N/A"}
                </span>
              </div>
            </div>
          </div>

        </>
      )}
    </div>
  );
}