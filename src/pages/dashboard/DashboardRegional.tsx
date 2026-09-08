import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { MapContainer, TileLayer, GeoJSON } from "react-leaflet";
import type {
  Layer,
  LeafletMouseEvent,
  PathOptions,
  StyleFunction,
} from "leaflet";
import type { Feature, Geometry } from "geojson";
import "leaflet/dist/leaflet.css";
import { getRegions } from "../../api/stats.api";
import {
  COULEURS_CATEGORIES,
  CENTRE_MADAGASCAR,
  MAPPING_REGIONS_GEOJSON,
} from "../../constants/dashboard.constants";
import madagascarRegions from "../../assets/gadm41_MDG_2.json";
import {
  MapPin,
  Building2,
  AlertTriangle,
  BarChart3,
  HeartPulse,
  Layers,
  Search,
  Filter,
  ArrowUpDown,
  Info,
  Download,
  Eye,
  EyeOff,
  Award,
  Gauge,
  FileText,
} from "lucide-react";

// ============================================================
// TYPES
// ============================================================

// Type importé de l'API
interface RegionAgregee {
  region: string;
  categorieDominante: string | null;
  nbHopitaux: number;
  igphMoyen: number;
  pctHautRisque: number;
  tauxMortaliteMoyen: number;
  nbRapports?: number;
}

// Types GeoJSON simplifiés
interface GeoJsonFeatureProperties {
  NAME_2: string;
  [key: string]: unknown;
}

interface GeoJsonFeature {
  type: "Feature";
  properties: GeoJsonFeatureProperties;
  geometry: unknown;
}

interface GeoJsonData {
  type: "FeatureCollection";
  features: GeoJsonFeature[];
}

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
  },
};

// ============================================================
// UTILITAIRES
// ============================================================
const formaterPourcentage = (
  valeur: number | undefined | null,
  decimals: number = 2,
): string => {
  if (valeur === undefined || valeur === null || isNaN(valeur)) return "N/A";
  if (valeur > 1) return valeur.toFixed(decimals);
  return (valeur * 100).toFixed(decimals);
};

const getCouleurCategorie = (categorie: string | null | undefined): string => {
  if (!categorie) return "#CBD5E1";
  return COULEURS_CATEGORIES[categorie] ?? "#CBD5E1";
};

type Tri = "igph" | "risque" | "nom" | "mortalite";

// ============================================================
// COMPOSANT PRINCIPAL
// ============================================================
export default function DashboardRegional() {
  const { data: regions, isLoading } = useQuery({
    queryKey: ["regions"],
    queryFn: () => getRegions(),
  });

  const [tri, setTri] = useState<Tri>("igph");
  const [recherche, setRecherche] = useState("");
  const [regionSurvolee, setRegionSurvolee] = useState<string | null>(null);
  const [afficherLegende, setAfficherLegende] = useState(true);

  // ============================================================
  // CLASSEMENT ET FILTRAGE
  // ============================================================

  const classement = useMemo(() => {
    const liste = [...(regions ?? [])];

    const listeFiltree = recherche
      ? liste.filter(
          (r) =>
            r.region.toLowerCase().includes(recherche.toLowerCase()) ||
            (r.categorieDominante?.toLowerCase() || "").includes(
              recherche.toLowerCase(),
            ),
        )
      : liste;

    if (tri === "igph") {
      listeFiltree.sort((a, b) => b.igphMoyen - a.igphMoyen);
    } else if (tri === "risque") {
      listeFiltree.sort((a, b) => b.pctHautRisque - a.pctHautRisque);
    } else if (tri === "mortalite") {
      listeFiltree.sort((a, b) => b.tauxMortaliteMoyen - a.tauxMortaliteMoyen);
    } else if (tri === "nom") {
      listeFiltree.sort((a, b) => a.region.localeCompare(b.region));
    }

    return listeFiltree;
  }, [regions, tri, recherche]);

  // ============================================================
  // STATISTIQUES GLOBALES
  // ============================================================

  const statsGlobales = useMemo(() => {
    if (!regions || regions.length === 0) return null;

    const totalHopitaux = regions.reduce((acc, r) => acc + r.nbHopitaux, 0);
    const moyenneIGPH =
      regions.reduce((acc, r) => acc + r.igphMoyen, 0) / regions.length;
    const moyenneRisque =
      regions.reduce((acc, r) => acc + r.pctHautRisque, 0) / regions.length;
    const moyenneMortalite =
      regions.reduce((acc, r) => acc + r.tauxMortaliteMoyen, 0) /
      regions.length;

    const meilleureRegion = [...regions].sort(
      (a, b) => b.igphMoyen - a.igphMoyen,
    )[0];
    const regionPlusRisquee = [...regions].sort(
      (a, b) => b.pctHautRisque - a.pctHautRisque,
    )[0];

    return {
      totalHopitaux,
      moyenneIGPH,
      moyenneRisque,
      moyenneMortalite,
      meilleureRegion,
      regionPlusRisquee,
      totalRegions: regions.length,
    };
  }, [regions]);

  const getRegionData = (nomGeoJson: string): RegionAgregee | undefined => {
    return regions?.find(
      (r) => MAPPING_REGIONS_GEOJSON[r.region] === nomGeoJson,
    );
  };

  const styleRegion: StyleFunction<GeoJsonFeatureProperties> = (
    feature?: Feature<Geometry, GeoJsonFeatureProperties>,
  ) => {
    if (!feature) {
      return {
        fillColor: "#CBD5E1",
        fillOpacity: 0.5,
        color: "#FFFFFF",
        weight: 1.2,
        dashArray: "4 4",
      };
    }

    const nomRegion = feature?.properties?.NAME_2;
    const regionData = getRegionData(nomRegion || "");
    const couleur = getCouleurCategorie(regionData?.categorieDominante);

    const estSurvolee = regionSurvolee === nomRegion;

    return {
      fillColor: couleur,
      fillOpacity: estSurvolee ? 0.95 : 0.75,
      color: estSurvolee ? EPHM_DARK.primary[300] : "#FFFFFF",
      weight: estSurvolee ? 2.5 : 1.2,
      dashArray: regionData ? undefined : "4 4",
    };
  };

  const onEachRegion = (
    feature: Feature<Geometry, GeoJsonFeatureProperties> | undefined,
    layer: Layer,
  ): void => {
    if (!feature) return;

    const nomRegion = feature?.properties?.NAME_2;
    const regionData = getRegionData(nomRegion || "");

    if (regionData) {
      const couleurCategorie = getCouleurCategorie(
        regionData.categorieDominante,
      );

      layer.bindPopup(`
        <div style="
          min-width: 260px;
          font-family: system-ui, -apple-system, sans-serif;
          padding: 4px;
        ">
          <div style="
            font-size: 18px;
            font-weight: 700;
            margin-bottom: 10px;
            color: #1a2a27;
            border-bottom: 2px solid #008080;
            padding-bottom: 6px;
          ">
            <MapPin className="w-4 h-4" />
            ${regionData.region}
          </div>
          
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 6px 12px; margin-bottom: 6px;">
            <div>
              <span style="color: #5a7a73; font-size: 12px;">Établissements</span>
              <div style="font-weight: 600; font-size: 16px; color: #1f332f;">${regionData.nbHopitaux}</div>
            </div>
            <div>
              <span style="color: #5a7a73; font-size: 12px;">IGPH moyen</span>
              <div style="font-weight: 600; font-size: 16px; color: #008080;">${regionData.igphMoyen.toFixed(3)}</div>
            </div>
            <div>
              <span style="color: #5a7a73; font-size: 12px;">Haut risque</span>
              <div style="font-weight: 600; font-size: 16px; color: #d96a5a;">${formaterPourcentage(regionData.pctHautRisque, 1)} %</div>
            </div>
            <div>
              <span style="color: #5a7a73; font-size: 12px;">Mortalité</span>
              <div style="font-weight: 600; font-size: 16px; color: #e87461;">${formaterPourcentage(regionData.tauxMortaliteMoyen, 2)} %</div>
            </div>
          </div>
          
          <div style="
            margin-top: 8px;
            padding-top: 8px;
            border-top: 1px solid #e2e7e5;
            display: flex;
            align-items: center;
            gap: 8px;
          ">
            <span style="color: #5a7a73; font-size: 13px;">Catégorie :</span>
            <span style="
              display: inline-block;
              padding: 2px 10px;
              border-radius: 12px;
              font-size: 12px;
              font-weight: 600;
              color: ${couleurCategorie};
              background-color: ${couleurCategorie}18;
              border: 1px solid ${couleurCategorie};
            ">
              ${regionData.categorieDominante ?? "Non classée"}
            </span>
          </div>
        </div>
      `);
    } else {
      layer.bindPopup(`
        <div style="
          min-width: 180px;
          font-family: system-ui, -apple-system, sans-serif;
          padding: 8px;
          text-align: center;
        ">
          <div style="font-weight: 600; color: #1f332f;">${nomRegion || "Région inconnue"}</div>
          <div style="color: #5a7a73; font-size: 13px; margin-top: 4px;">
            Aucune donnée disponible
          </div>
        </div>
      `);
    }

    // Gestion des événements de la carte
    layer.on({
      mouseover: (event: LeafletMouseEvent) => {
        const target = event.target as Layer & {
          setStyle: (style: PathOptions) => void;
          bringToFront: () => void;
        };
        setRegionSurvolee(nomRegion || null);
        target.setStyle({
          weight: 2.5,
          fillOpacity: 0.95,
        });
        if (typeof target.bringToFront === "function") {
          target.bringToFront();
        }
      },
      mouseout: () => {
        setRegionSurvolee(null);
      },
    });
  };

  if (isLoading) {
    return (
      <div
        className="flex flex-col items-center justify-center py-20 gap-4"
        style={{
          backgroundColor: EPHM_DARK.background.page,
          minHeight: "100vh",
        }}
      >
        <span
          className="loading loading-spinner loading-lg"
          style={{ color: EPHM_DARK.primary[400] }}
        />
        <p style={{ color: EPHM_DARK.neutral.gray400 }}>
          Chargement des données régionales...
        </p>
      </div>
    );
  }

  if (!regions || regions.length === 0) {
    return (
      <div
        className="p-6"
        style={{
          backgroundColor: EPHM_DARK.background.page,
          minHeight: "100vh",
        }}
      >
        <div
          className="alert p-6 rounded-xl border flex items-center gap-4"
          style={{
            backgroundColor: EPHM_DARK.background.card,
            borderColor: EPHM_DARK.neutral.gray200,
            color: EPHM_DARK.neutral.gray500,
          }}
        >
          <Info size={24} style={{ color: EPHM_DARK.primary[300] }} />
          <div>
            <p
              className="font-semibold"
              style={{ color: EPHM_DARK.neutral.gray700 }}
            >
              Aucune donnée disponible
            </p>
            <p className="text-sm">
              Importe un fichier CSV pour commencer à visualiser les données
              régionales.
            </p>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div
      className="space-y-6 p-6"
      style={{ backgroundColor: EPHM_DARK.background.page, minHeight: "100vh" }}
    >
      {/* HEADER */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1
            className="text-2xl font-bold flex items-center gap-2"
            style={{ color: EPHM_DARK.neutral.gray800 }}
          >
            <MapPin size={28} style={{ color: EPHM_DARK.primary[400] }} />
            Dashboard régional
          </h1>
          <p style={{ color: EPHM_DARK.neutral.gray400 }}>
            Carte interactive et classement des{" "}
            {statsGlobales?.totalRegions || 0} régions de Madagascar
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            className="btn btn-sm gap-2"
            style={{
              backgroundColor: EPHM_DARK.background.card,
              borderColor: EPHM_DARK.neutral.gray200,
              color: EPHM_DARK.neutral.gray600,
            }}
            onClick={() => setAfficherLegende(!afficherLegende)}
          >
            {afficherLegende ? <EyeOff size={14} /> : <Eye size={14} />}
            Légende
          </button>
          <button
            className="btn btn-sm gap-2"
            style={{
              backgroundColor: EPHM_DARK.background.card,
              borderColor: EPHM_DARK.neutral.gray200,
              color: EPHM_DARK.neutral.gray600,
            }}
          >
            <Download size={14} />
            Exporter
          </button>
        </div>
      </div>

      {/* STATISTIQUES GLOBALES */}
      {statsGlobales && (
        <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
          <div
            className="stat rounded-xl border p-4"
            style={{
              borderColor: EPHM_DARK.neutral.gray200,
              backgroundColor: EPHM_DARK.background.card,
            }}
          >
            <div
              className="stat-title text-xs flex items-center gap-2"
              style={{ color: EPHM_DARK.neutral.gray400 }}
            >
              <Building2 size={14} />
              Établissements
            </div>
            <div
              className="stat-value text-xl font-bold"
              style={{ color: EPHM_DARK.neutral.gray800 }}
            >
              {statsGlobales.totalHopitaux}
            </div>
          </div>

          <div
            className="stat rounded-xl border p-4"
            style={{
              borderColor: EPHM_DARK.neutral.gray200,
              backgroundColor: EPHM_DARK.background.card,
            }}
          >
            <div
              className="stat-title text-xs flex items-center gap-2"
              style={{ color: EPHM_DARK.neutral.gray400 }}
            >
              <Gauge size={14} />
              IGPH moyen
            </div>
            <div
              className="stat-value text-xl font-bold"
              style={{ color: EPHM_DARK.primary[300] }}
            >
              {statsGlobales.moyenneIGPH.toFixed(3)}
            </div>
          </div>

          <div
            className="stat rounded-xl border p-4"
            style={{
              borderColor: EPHM_DARK.neutral.gray200,
              backgroundColor: EPHM_DARK.background.card,
            }}
          >
            <div
              className="stat-title text-xs flex items-center gap-2"
              style={{ color: EPHM_DARK.neutral.gray400 }}
            >
              <AlertTriangle size={14} />
              Risque moyen
            </div>
            <div
              className="stat-value text-xl font-bold"
              style={{ color: EPHM_DARK.status.danger }}
            >
              {formaterPourcentage(statsGlobales.moyenneRisque, 1)} %
            </div>
          </div>

          <div
            className="stat rounded-xl border p-4"
            style={{
              borderColor: EPHM_DARK.neutral.gray200,
              backgroundColor: EPHM_DARK.background.card,
            }}
          >
            <div
              className="stat-title text-xs flex items-center gap-2"
              style={{ color: EPHM_DARK.neutral.gray400 }}
            >
              <HeartPulse size={14} />
              Mortalité moyenne
            </div>
            <div
              className="stat-value text-xl font-bold"
              style={{ color: EPHM_DARK.neutral.gray700 }}
            >
              {formaterPourcentage(statsGlobales.moyenneMortalite, 2)} %
            </div>
          </div>

          <div
            className="stat rounded-xl border p-4"
            style={{
              borderColor: EPHM_DARK.neutral.gray200,
              backgroundColor: EPHM_DARK.background.card,
            }}
          >
            <div
              className="stat-title text-xs flex items-center gap-2"
              style={{ color: EPHM_DARK.neutral.gray400 }}
            >
              <Award size={14} />
              Meilleure région
            </div>
            <div
              className="stat-value text-lg font-bold truncate"
              style={{ color: EPHM_DARK.status.success }}
            >
              {statsGlobales.meilleureRegion?.region || "—"}
            </div>
            <div
              className="stat-desc text-xs"
              style={{ color: EPHM_DARK.neutral.gray500 }}
            >
              IGPH: {statsGlobales.meilleureRegion?.igphMoyen.toFixed(3) || "—"}
            </div>
          </div>
        </div>
      )}

      {/* CARTE */}
      <div
        className="overflow-hidden rounded-xl border"
        style={{
          borderColor: EPHM_DARK.neutral.gray200,
          backgroundColor: EPHM_DARK.background.card,
        }}
      >
        <MapContainer
          center={CENTRE_MADAGASCAR}
          zoom={5.3}
          minZoom={5}
          maxZoom={8}
          scrollWheelZoom={true}
          style={{
            height: "520px",
            width: "100%",
            backgroundColor: EPHM_DARK.neutral.gray50,
          }}
        >
          <TileLayer
            attribution="&copy; OpenStreetMap contributors"
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <GeoJSON
            data={madagascarRegions as unknown as GeoJsonData}
            style={styleRegion}
            onEachFeature={onEachRegion}
          />
        </MapContainer>
      </div>

      {/* LÉGENDE */}
      {afficherLegende && (
        <div
          className="flex flex-wrap items-center gap-4 rounded-xl border p-4"
          style={{
            borderColor: EPHM_DARK.neutral.gray200,
            backgroundColor: EPHM_DARK.background.card,
          }}
        >
          <span
            className="font-semibold flex items-center gap-2"
            style={{ color: EPHM_DARK.neutral.gray700 }}
          >
            <Layers size={16} />
            Légende :
          </span>
          {Object.entries(COULEURS_CATEGORIES).map(([categorie, couleur]) => (
            <div key={categorie} className="flex items-center gap-2">
              <span
                className="h-4 w-4 rounded-sm"
                style={{ backgroundColor: couleur }}
              />
              <span
                className="text-sm"
                style={{ color: EPHM_DARK.neutral.gray600 }}
              >
                {categorie}
              </span>
            </div>
          ))}
          <div className="flex items-center gap-2 ml-auto">
            <span
              className="h-4 w-4 rounded-sm"
              style={{
                backgroundColor: "#CBD5E1",
                border: "1px dashed #5a7a73",
              }}
            />
            <span
              className="text-sm"
              style={{ color: EPHM_DARK.neutral.gray400 }}
            >
              Données manquantes
            </span>
          </div>
        </div>
      )}

      <p
        className="text-xs flex items-center gap-2"
        style={{ color: EPHM_DARK.neutral.gray400 }}
      >
        <Info size={14} />
        Couleur = catégorie de performance dominante issue du modèle K-Means.
        Cliquez sur une région pour afficher ses indicateurs détaillés.
      </p>

      {/* RECHERCHE ET FILTRES */}
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex-1 min-w-[200px] max-w-md">
          <div className="relative">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2"
              style={{ color: EPHM_DARK.neutral.gray400 }}
            />
            <input
              type="text"
              placeholder="Rechercher une région ou catégorie..."
              className="input w-full pl-9"
              style={{
                backgroundColor: EPHM_DARK.neutral.gray50,
                borderColor: EPHM_DARK.neutral.gray200,
                color: EPHM_DARK.neutral.gray800,
              }}
              value={recherche}
              onChange={(e) => setRecherche(e.target.value)}
            />
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span
            className="text-sm flex items-center gap-1"
            style={{ color: EPHM_DARK.neutral.gray400 }}
          >
            <Filter size={14} />
            Trier par :
          </span>
          <div className="join">
            <button
              className={`btn btn-sm join-item ${tri === "igph" ? "btn-active" : ""}`}
              style={{
                backgroundColor:
                  tri === "igph"
                    ? EPHM_DARK.primary[600]
                    : EPHM_DARK.neutral.gray50,
                borderColor: EPHM_DARK.neutral.gray200,
                color: tri === "igph" ? "#fff" : EPHM_DARK.neutral.gray600,
              }}
              onClick={() => setTri("igph")}
            >
              <BarChart3 size={14} />
              IGPH
            </button>
            <button
              className={`btn btn-sm join-item ${tri === "risque" ? "btn-active" : ""}`}
              style={{
                backgroundColor:
                  tri === "risque"
                    ? EPHM_DARK.primary[600]
                    : EPHM_DARK.neutral.gray50,
                borderColor: EPHM_DARK.neutral.gray200,
                color: tri === "risque" ? "#fff" : EPHM_DARK.neutral.gray600,
              }}
              onClick={() => setTri("risque")}
            >
              <AlertTriangle size={14} />
              Risque
            </button>
            <button
              className={`btn btn-sm join-item ${tri === "mortalite" ? "btn-active" : ""}`}
              style={{
                backgroundColor:
                  tri === "mortalite"
                    ? EPHM_DARK.primary[600]
                    : EPHM_DARK.neutral.gray50,
                borderColor: EPHM_DARK.neutral.gray200,
                color: tri === "mortalite" ? "#fff" : EPHM_DARK.neutral.gray600,
              }}
              onClick={() => setTri("mortalite")}
            >
              <HeartPulse size={14} />
              Mortalité
            </button>
            <button
              className={`btn btn-sm join-item ${tri === "nom" ? "btn-active" : ""}`}
              style={{
                backgroundColor:
                  tri === "nom"
                    ? EPHM_DARK.primary[600]
                    : EPHM_DARK.neutral.gray50,
                borderColor: EPHM_DARK.neutral.gray200,
                color: tri === "nom" ? "#fff" : EPHM_DARK.neutral.gray600,
              }}
              onClick={() => setTri("nom")}
            >
              <ArrowUpDown size={14} />
              Nom
            </button>
          </div>
        </div>

        <span
          className="text-sm ml-auto"
          style={{ color: EPHM_DARK.neutral.gray400 }}
        >
          {classement.length} / {regions.length} régions
        </span>
      </div>

      {/* TABLEAU DES RÉGIONS */}
      <div
        className="overflow-x-auto rounded-xl border"
        style={{
          borderColor: EPHM_DARK.neutral.gray200,
          backgroundColor: EPHM_DARK.background.card,
        }}
      >
        <table className="table">
          <thead>
            <tr style={{ color: EPHM_DARK.neutral.gray400 }}>
              <th className="flex items-center gap-2">
                <MapPin size={14} />
                Région
              </th>
              <th>
                <Layers size={14} />
                Catégorie dominante
              </th>
              <th>
                <Building2 size={14} />
                Établissements
              </th>
              <th>
                <Gauge size={14} />
                IGPH moyen
              </th>
              <th>
                <AlertTriangle size={14} />% haut risque
              </th>
              <th>
                <HeartPulse size={14} />
                Mortalité moyenne
              </th>
            </tr>
          </thead>
          <tbody>
            {classement.map((r, index) => {
              const couleurCategorie = getCouleurCategorie(
                r.categorieDominante,
              );

              return (
                <tr
                  key={r.region}
                  className="hover"
                  style={{ color: EPHM_DARK.neutral.gray700 }}
                >
                  <td className="font-medium flex items-center gap-2">
                    <span
                      className="text-xs font-bold w-5"
                      style={{ color: EPHM_DARK.neutral.gray400 }}
                    >
                      #{index + 1}
                    </span>
                    {r.region}
                  </td>
                  <td>
                    {r.categorieDominante ? (
                      <span
                        className="badge badge-sm flex items-center gap-1"
                        style={{
                          color: couleurCategorie,
                          backgroundColor: `${couleurCategorie}18`,
                          borderColor: couleurCategorie,
                        }}
                      >
                        <Layers size={10} />
                        {r.categorieDominante}
                      </span>
                    ) : (
                      <span style={{ color: EPHM_DARK.neutral.gray400 }}>
                        —
                      </span>
                    )}
                  </td>
                  <td>{r.nbHopitaux}</td>
                  <td
                    style={{
                      color:
                        r.igphMoyen > 0.7
                          ? EPHM_DARK.status.success
                          : EPHM_DARK.neutral.gray700,
                    }}
                  >
                    {r.igphMoyen.toFixed(3)}
                  </td>
                  <td
                    style={{
                      color:
                        r.pctHautRisque > 0.3
                          ? EPHM_DARK.status.danger
                          : EPHM_DARK.neutral.gray700,
                    }}
                  >
                    {formaterPourcentage(r.pctHautRisque, 1)} %
                  </td>
                  <td
                    style={{
                      color:
                        r.tauxMortaliteMoyen > 0.05
                          ? EPHM_DARK.status.danger
                          : EPHM_DARK.neutral.gray700,
                    }}
                  >
                    {formaterPourcentage(r.tauxMortaliteMoyen, 2)} %
                  </td>
                </tr>
              );
            })}
            {classement.length === 0 && (
              <tr>
                <td
                  colSpan={6}
                  className="text-center py-8"
                  style={{ color: EPHM_DARK.neutral.gray400 }}
                >
                  <Search size={24} className="mx-auto mb-2" />
                  Aucune région ne correspond à votre recherche
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* RÉSUMÉ */}
      {statsGlobales && (
        <div
          className="rounded-xl border p-4 text-sm"
          style={{
            borderColor: EPHM_DARK.neutral.gray200,
            backgroundColor: EPHM_DARK.background.card,
          }}
        >
          <h3
            className="font-semibold flex items-center gap-2"
            style={{ color: EPHM_DARK.neutral.gray700 }}
          >
            <FileText size={16} />
            Synthèse régionale
          </h3>
          <div
            className="mt-2 grid gap-2 md:grid-cols-3"
            style={{ color: EPHM_DARK.neutral.gray500 }}
          >
            <div className="flex items-center gap-2">
              <Award size={14} style={{ color: EPHM_DARK.status.success }} />
              <span
                className="font-medium"
                style={{ color: EPHM_DARK.neutral.gray600 }}
              >
                Meilleure région :
              </span>
              <span style={{ color: EPHM_DARK.neutral.gray700 }}>
                {statsGlobales.meilleureRegion?.region || "—"}
              </span>
              <span
                className="text-xs"
                style={{ color: EPHM_DARK.primary[400] }}
              >
                (IGPH:{" "}
                {statsGlobales.meilleureRegion?.igphMoyen.toFixed(3) || "—"})
              </span>
            </div>
            <div className="flex items-center gap-2">
              <AlertTriangle
                size={14}
                style={{ color: EPHM_DARK.status.danger }}
              />
              <span
                className="font-medium"
                style={{ color: EPHM_DARK.neutral.gray600 }}
              >
                Région la plus risquée :
              </span>
              <span style={{ color: EPHM_DARK.neutral.gray700 }}>
                {statsGlobales.regionPlusRisquee?.region || "—"}
              </span>
              <span
                className="text-xs"
                style={{ color: EPHM_DARK.status.danger }}
              >
                (
                {formaterPourcentage(
                  statsGlobales.regionPlusRisquee?.pctHautRisque,
                  1,
                )}
                % risque)
              </span>
            </div>
            <div className="flex items-center gap-2">
              <HeartPulse
                size={14}
                style={{ color: EPHM_DARK.neutral.gray400 }}
              />
              <span
                className="font-medium"
                style={{ color: EPHM_DARK.neutral.gray600 }}
              >
                Mortalité moyenne :
              </span>
              <span style={{ color: EPHM_DARK.neutral.gray700 }}>
                {formaterPourcentage(statsGlobales.moyenneMortalite, 2)} %
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
