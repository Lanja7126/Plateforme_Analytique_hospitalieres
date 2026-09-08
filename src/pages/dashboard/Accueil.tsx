import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import {
  Map as MapIcon,
  Building2,
  AlertTriangle,
  BookOpen,
  TriangleAlert,
  CircleCheck,
  Activity,
  BarChart3,
  HeartPulse,
  Database,
  ArrowRight,
} from "lucide-react";

import { getKpisNationaux, getRegions } from "../../api/stats.api";
import { COULEURS_CATEGORIES } from "../../constants/dashboard.constants";

// ============================================================
// PALETTE DE COULEURS EPHM DARK
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
// UTILITAIRE
// ============================================================
const formaterPourcentage = (
  valeur: number | undefined | null,
  decimals: number = 2,
): string => {
  if (valeur === undefined || valeur === null || isNaN(valeur)) return "N/A";
  if (valeur > 1) return valeur.toFixed(decimals);
  return (valeur * 100).toFixed(decimals);
};

export default function Accueil() {
  const { data: kpis, isLoading: chargementKpis } = useQuery({
    queryKey: ["kpis"],
    queryFn: () => getKpisNationaux(),
  });

  const { data: regions, isLoading: chargementRegions } = useQuery({
    queryKey: ["regions"],
    queryFn: () => getRegions(),
  });

  /* ================================
     CLASSEMENT DES RÉGIONS
  ================================= */

  const regionsARisque = useMemo(() => {
    return [...(regions ?? [])]
      .sort((a, b) => b.pctHautRisque - a.pctHautRisque)
      .slice(0, 5);
  }, [regions]);

  const regionsPerformantes = useMemo(() => {
    return [...(regions ?? [])]
      .sort((a, b) => b.igphMoyen - a.igphMoyen)
      .slice(0, 5);
  }, [regions]);

  /* ================================
     CATÉGORIES - AVEC TYPAGE CORRECT ✅
  ================================= */

  const categories = useMemo<Record<string, number>>(() => {
    if (!regions) return {};

    const compteur: Record<string, number> = {};

    regions.forEach((region) => {
      if (region.categorieDominante) {
        compteur[region.categorieDominante] =
          (compteur[region.categorieDominante] || 0) + 1;
      }
    });

    return compteur;
  }, [regions]);

  /* ================================
     MORTALITÉ
  ================================= */

  const regionMortaliteElevee = useMemo(() => {
    if (!regions || regions.length === 0) return null;

    return [...regions].sort(
      (a, b) => b.tauxMortaliteMoyen - a.tauxMortaliteMoyen,
    )[0];
  }, [regions]);

  /* ================================
     LOADING
  ================================= */

  if (chargementKpis) {
    return (
      <div className="space-y-4">
        <div
          className="h-32 animate-pulse rounded-xl"
          style={{ backgroundColor: EPHM_DARK.background.card }}
        />

        <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="h-24 animate-pulse rounded-xl"
              style={{ backgroundColor: EPHM_DARK.background.card }}
            />
          ))}
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          <div
            className="h-72 animate-pulse rounded-xl"
            style={{ backgroundColor: EPHM_DARK.background.card }}
          />
          <div
            className="h-72 animate-pulse rounded-xl"
            style={{ backgroundColor: EPHM_DARK.background.card }}
          />
        </div>
      </div>
    );
  }

  return (
    <div
      className="space-y-4"
      style={{ backgroundColor: EPHM_DARK.background.page }}
    >
      {/* =====================================
          HEADER - Dégradé inspiré du logo (version dark)
      ====================================== */}

      <section
        className="rounded-xl px-5 py-4 shadow-sm"
        style={{
          background: `linear-gradient(135deg, ${EPHM_DARK.primary[800]} 0%, ${EPHM_DARK.primary[600]} 40%, ${EPHM_DARK.primary[400]} 100%)`,
        }}
      >
        <div className="flex items-center justify-between gap-4">
          <div>
            <div
              className="mb-1 flex items-center gap-2 text-xs font-medium"
              style={{ color: EPHM_DARK.primary[200] }}
            >
              <Activity size={16} />
              Plateforme analytique hospitalière
            </div>

            <h1 className="text-xl font-bold text-white md:text-2xl">
              Vue d'ensemble nationale
            </h1>

            <p
              className="mt-1 max-w-3xl text-sm"
              style={{ color: EPHM_DARK.primary[100] }}
            >
              Synthèse de la performance des établissements hospitaliers
              malgaches et identification des situations à risque.
            </p>
          </div>

          <div
            className="hidden rounded-xl p-3 md:block"
            style={{ backgroundColor: "rgba(255,255,255,0.08)" }}
          >
            <BarChart3 size={34} className="text-white/80" />
          </div>
        </div>
      </section>

      {/* =====================================
          KPI NATIONAUX
      ====================================== */}

      {kpis && (
        <section className="grid grid-cols-2 gap-3 md:grid-cols-5">
          {/* Rapports */}
          <div
            className="rounded-xl border p-3 shadow-sm"
            style={{
              borderColor: EPHM_DARK.neutral.gray200,
              backgroundColor: EPHM_DARK.background.card,
            }}
          >
            <div className="flex items-center gap-3">
              <div
                className="rounded-lg p-2"
                style={{
                  backgroundColor: EPHM_DARK.primary[800] + "60",
                  color: EPHM_DARK.primary[300],
                }}
              >
                <Database size={18} />
              </div>

              <div>
                <p
                  className="text-xs"
                  style={{ color: EPHM_DARK.neutral.gray400 }}
                >
                  Rapports
                </p>

                <p
                  className="text-xl font-bold"
                  style={{ color: EPHM_DARK.neutral.gray800 }}
                >
                  {kpis.nbRapports.toLocaleString("fr-FR")}
                </p>
              </div>
            </div>
          </div>

          {/* Hôpitaux */}
          <div
            className="rounded-xl border p-3 shadow-sm"
            style={{
              borderColor: EPHM_DARK.neutral.gray200,
              backgroundColor: EPHM_DARK.background.card,
            }}
          >
            <div className="flex items-center gap-3">
              <div
                className="rounded-lg p-2"
                style={{
                  backgroundColor: EPHM_DARK.primary[800] + "60",
                  color: EPHM_DARK.primary[300],
                }}
              >
                <Building2 size={18} />
              </div>

              <div>
                <p
                  className="text-xs"
                  style={{ color: EPHM_DARK.neutral.gray400 }}
                >
                  Établissements
                </p>

                <p
                  className="text-xl font-bold"
                  style={{ color: EPHM_DARK.neutral.gray800 }}
                >
                  {kpis.nbHopitaux.toLocaleString("fr-FR")}
                </p>
              </div>
            </div>
          </div>

          {/* Régions */}
          <div
            className="rounded-xl border p-3 shadow-sm"
            style={{
              borderColor: EPHM_DARK.neutral.gray200,
              backgroundColor: EPHM_DARK.background.card,
            }}
          >
            <div className="flex items-center gap-3">
              <div
                className="rounded-lg p-2"
                style={{
                  backgroundColor: EPHM_DARK.primary[800] + "60",
                  color: EPHM_DARK.primary[300],
                }}
              >
                <MapIcon size={18} />
              </div>

              <div>
                <p
                  className="text-xs"
                  style={{ color: EPHM_DARK.neutral.gray400 }}
                >
                  Régions
                </p>

                <p
                  className="text-xl font-bold"
                  style={{ color: EPHM_DARK.neutral.gray800 }}
                >
                  {kpis.nbRegions}
                </p>
              </div>
            </div>
          </div>

          {/* IGPH */}
          <div
            className="rounded-xl border p-3 shadow-sm"
            style={{
              borderColor: EPHM_DARK.primary[700] + "60",
              backgroundColor: EPHM_DARK.background.card,
            }}
          >
            <div className="flex items-center gap-3">
              <div
                className="rounded-lg p-2"
                style={{
                  backgroundColor: EPHM_DARK.primary[800] + "60",
                  color: EPHM_DARK.primary[300],
                }}
              >
                <BarChart3 size={18} />
              </div>

              <div>
                <p
                  className="text-xs"
                  style={{ color: EPHM_DARK.neutral.gray400 }}
                >
                  IGPH moyen
                </p>

                <p
                  className="text-xl font-bold"
                  style={{ color: EPHM_DARK.primary[300] }}
                >
                  {kpis.igphMoyen.toFixed(3)}
                </p>
              </div>
            </div>
          </div>

          {/* Risque */}
          <div
            className="rounded-xl border p-3 shadow-sm"
            style={{
              borderColor: EPHM_DARK.status.danger + "50",
              backgroundColor: EPHM_DARK.background.card,
            }}
          >
            <div className="flex items-center gap-3">
              <div
                className="rounded-lg p-2"
                style={{
                  backgroundColor: EPHM_DARK.status.danger + "30",
                  color: EPHM_DARK.status.danger,
                }}
              >
                <AlertTriangle size={18} />
              </div>

              <div>
                <p
                  className="text-xs"
                  style={{ color: EPHM_DARK.neutral.gray400 }}
                >
                  Haut risque
                </p>

                <p
                  className="text-xl font-bold"
                  style={{ color: EPHM_DARK.status.danger }}
                >
                  {formaterPourcentage(kpis.pctHautRisque, 1)} %
                </p>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* =====================================
          SYNTHÈSE RAPIDE
      ====================================== */}

      {!chargementRegions && regions && regions.length > 0 && (
        <section className="grid grid-cols-1 gap-3 md:grid-cols-3">
          {/* Catégorie dominante */}
          <div
            className="rounded-xl border p-4 shadow-sm"
            style={{
              borderColor: EPHM_DARK.neutral.gray200,
              backgroundColor: EPHM_DARK.background.card,
            }}
          >
            <div className="flex items-center gap-3">
              <div
                className="rounded-lg p-2"
                style={{
                  backgroundColor: EPHM_DARK.primary[800] + "60",
                  color: EPHM_DARK.primary[300],
                }}
              >
                <BarChart3 size={20} />
              </div>

              <div>
                <p
                  className="text-xs"
                  style={{ color: EPHM_DARK.neutral.gray400 }}
                >
                  Catégorie la plus représentée
                </p>

                <p
                  className="text-sm font-bold"
                  style={{ color: EPHM_DARK.neutral.gray800 }}
                >
                  {Object.entries(categories).sort(
                    ([, a], [, b]) => b - a,
                  )[0]?.[0] ?? "Non disponible"}
                </p>
              </div>
            </div>
          </div>

          {/* Région à risque */}
          <div
            className="rounded-xl border p-4 shadow-sm"
            style={{
              borderColor: EPHM_DARK.status.danger + "50",
              backgroundColor: EPHM_DARK.background.card,
            }}
          >
            <div className="flex items-center gap-3">
              <div
                className="rounded-lg p-2"
                style={{
                  backgroundColor: EPHM_DARK.status.danger + "30",
                  color: EPHM_DARK.status.danger,
                }}
              >
                <TriangleAlert size={20} />
              </div>

              <div>
                <p
                  className="text-xs"
                  style={{ color: EPHM_DARK.neutral.gray400 }}
                >
                  Région la plus exposée
                </p>

                <p
                  className="text-sm font-bold"
                  style={{ color: EPHM_DARK.neutral.gray800 }}
                >
                  {regionsARisque[0]?.region ?? "Non disponible"}
                </p>

                {regionsARisque[0] && (
                  <p
                    className="text-xs"
                    style={{ color: EPHM_DARK.status.danger }}
                  >
                    {formaterPourcentage(regionsARisque[0].pctHautRisque, 1)} %
                    haut risque
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Mortalité */}
          <div
            className="rounded-xl border p-4 shadow-sm"
            style={{
              borderColor: EPHM_DARK.accent.gold + "50",
              backgroundColor: EPHM_DARK.background.card,
            }}
          >
            <div className="flex items-center gap-3">
              <div
                className="rounded-lg p-2"
                style={{
                  backgroundColor: EPHM_DARK.accent.gold + "30",
                  color: EPHM_DARK.accent.gold,
                }}
              >
                <HeartPulse size={20} />
              </div>

              <div>
                <p
                  className="text-xs"
                  style={{ color: EPHM_DARK.neutral.gray400 }}
                >
                  Mortalité moyenne la plus élevée
                </p>

                <p
                  className="text-sm font-bold"
                  style={{ color: EPHM_DARK.neutral.gray800 }}
                >
                  {regionMortaliteElevee?.region ?? "Non disponible"}
                </p>

                {regionMortaliteElevee && (
                  <p
                    className="text-xs"
                    style={{ color: EPHM_DARK.accent.gold }}
                  >
                    {formaterPourcentage(
                      regionMortaliteElevee.tauxMortaliteMoyen,
                      2,
                    )}{" "}
                    %
                  </p>
                )}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* =====================================
          RISQUE + PERFORMANCE
      ====================================== */}

      {!chargementRegions && regions && regions.length > 0 && (
        <section className="grid gap-3 md:grid-cols-2">
          {/* RISQUE */}
          <div
            className="rounded-xl border shadow-sm"
            style={{
              borderColor: EPHM_DARK.neutral.gray200,
              backgroundColor: EPHM_DARK.background.card,
            }}
          >
            <div
              className="flex items-center justify-between border-b px-4 py-3"
              style={{ borderColor: EPHM_DARK.neutral.gray100 }}
            >
              <div>
                <h2
                  className="text-sm font-bold"
                  style={{ color: EPHM_DARK.neutral.gray800 }}
                >
                  Régions à surveiller
                </h2>

                <p
                  className="text-xs"
                  style={{ color: EPHM_DARK.neutral.gray400 }}
                >
                  Taux d'établissements à haut risque
                </p>
              </div>

              <TriangleAlert
                size={19}
                style={{ color: EPHM_DARK.status.danger }}
              />
            </div>

            <div className="space-y-2 p-3">
              {regionsARisque.map((region, index) => (
                <div
                  key={region.region}
                  className="flex items-center gap-3 rounded-lg px-3 py-2"
                  style={{ backgroundColor: EPHM_DARK.neutral.gray50 }}
                >
                  <span
                    className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white"
                    style={{ backgroundColor: EPHM_DARK.status.danger }}
                  >
                    {index + 1}
                  </span>

                  <div className="min-w-0 flex-1">
                    <div className="flex justify-between gap-2">
                      <span
                        className="truncate text-xs font-semibold"
                        style={{ color: EPHM_DARK.neutral.gray700 }}
                      >
                        {region.region}
                      </span>

                      <span
                        className="text-xs font-bold"
                        style={{ color: EPHM_DARK.status.danger }}
                      >
                        {formaterPourcentage(region.pctHautRisque, 1)} %
                      </span>
                    </div>

                    <div
                      className="mt-1 h-1.5 overflow-hidden rounded-full"
                      style={{ backgroundColor: EPHM_DARK.neutral.gray200 }}
                    >
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${Math.min(region.pctHautRisque * 100, 100)}%`,
                          backgroundColor: EPHM_DARK.status.danger,
                        }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* PERFORMANCE */}
          <div
            className="rounded-xl border shadow-sm"
            style={{
              borderColor: EPHM_DARK.neutral.gray200,
              backgroundColor: EPHM_DARK.background.card,
            }}
          >
            <div
              className="flex items-center justify-between border-b px-4 py-3"
              style={{ borderColor: EPHM_DARK.neutral.gray100 }}
            >
              <div>
                <h2
                  className="text-sm font-bold"
                  style={{ color: EPHM_DARK.neutral.gray800 }}
                >
                  Régions les plus performantes
                </h2>

                <p
                  className="text-xs"
                  style={{ color: EPHM_DARK.neutral.gray400 }}
                >
                  Classement selon l'IGPH moyen
                </p>
              </div>

              <CircleCheck
                size={19}
                style={{ color: EPHM_DARK.primary[400] }}
              />
            </div>

            <div className="space-y-2 p-3">
              {regionsPerformantes.map((region, index) => (
                <div
                  key={region.region}
                  className="flex items-center gap-3 rounded-lg px-3 py-2"
                  style={{ backgroundColor: EPHM_DARK.neutral.gray50 }}
                >
                  <span
                    className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white"
                    style={{ backgroundColor: EPHM_DARK.primary[500] }}
                  >
                    {index + 1}
                  </span>

                  <div className="min-w-0 flex-1">
                    <div className="flex justify-between gap-2">
                      <span
                        className="truncate text-xs font-semibold"
                        style={{ color: EPHM_DARK.neutral.gray700 }}
                      >
                        {region.region}
                      </span>

                      <span
                        className="text-xs font-bold"
                        style={{ color: EPHM_DARK.primary[300] }}
                      >
                        {region.igphMoyen.toFixed(3)}
                      </span>
                    </div>

                    <div
                      className="mt-1 h-1.5 overflow-hidden rounded-full"
                      style={{ backgroundColor: EPHM_DARK.neutral.gray200 }}
                    >
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${Math.min(Math.max(region.igphMoyen * 100, 0), 100)}%`,
                          backgroundColor: EPHM_DARK.primary[500],
                        }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* =====================================
          CATÉGORIES - AVEC TYPAGE CORRECT ✅
      ====================================== */}

      {!chargementRegions && regions && regions.length > 0 && (
        <section
          className="rounded-xl border p-4 shadow-sm"
          style={{
            borderColor: EPHM_DARK.neutral.gray200,
            backgroundColor: EPHM_DARK.background.card,
          }}
        >
          <div className="mb-3 flex items-center justify-between">
            <div>
              <h2
                className="text-sm font-bold"
                style={{ color: EPHM_DARK.neutral.gray800 }}
              >
                Répartition des catégories
              </h2>

              <p
                className="text-xs"
                style={{ color: EPHM_DARK.neutral.gray400 }}
              >
                Classification issue du clustering
              </p>
            </div>

            <BarChart3 size={18} style={{ color: EPHM_DARK.neutral.gray400 }} />
          </div>

          <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
            {[
              "Performance élevée",
              "Performance satisfaisante",
              "Performance fragile",
              "Sous forte tension",
            ].map((categorie) => {
              const nombre = categories[categorie] ?? 0;

              return (
                <div
                  key={categorie}
                  className="flex items-center gap-2 rounded-lg px-3 py-2"
                  style={{ backgroundColor: EPHM_DARK.neutral.gray50 }}
                >
                  <span
                    className="h-3 w-3 shrink-0 rounded-full"
                    style={{
                      backgroundColor:
                        COULEURS_CATEGORIES[categorie] ??
                        EPHM_DARK.neutral.gray300,
                    }}
                  />

                  <div className="min-w-0 flex-1">
                    <p
                      className="truncate text-xs"
                      style={{ color: EPHM_DARK.neutral.gray600 }}
                    >
                      {categorie}
                    </p>
                  </div>

                  <span
                    className="text-sm font-bold"
                    style={{ color: EPHM_DARK.neutral.gray800 }}
                  >
                    {nombre}
                  </span>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* =====================================
          ACCÈS RAPIDES
      ====================================== */}

      <section>
        <div className="mb-2 flex items-center justify-between">
          <div>
            <h2
              className="text-sm font-bold"
              style={{ color: EPHM_DARK.neutral.gray800 }}
            >
              Accès rapides
            </h2>

            <p className="text-xs" style={{ color: EPHM_DARK.neutral.gray400 }}>
              Explorer les différents modules
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 lg:grid-cols-4">
          <Link
            to="/dashboard/regional"
            className="group flex items-center justify-between rounded-xl border px-3 py-3 shadow-sm transition hover:shadow-md"
            style={{
              borderColor: EPHM_DARK.neutral.gray200,
              backgroundColor: EPHM_DARK.background.card,
            }}
          >
            <div className="flex items-center gap-2">
              <div
                className="rounded-lg p-2"
                style={{
                  backgroundColor: EPHM_DARK.primary[800] + "60",
                  color: EPHM_DARK.primary[300],
                }}
              >
                <MapIcon size={17} />
              </div>

              <div>
                <p
                  className="text-xs font-semibold"
                  style={{ color: EPHM_DARK.neutral.gray800 }}
                >
                  Vue régionale
                </p>

                <p
                  className="hidden text-[11px] sm:block"
                  style={{ color: EPHM_DARK.neutral.gray400 }}
                >
                  Comparer les régions
                </p>
              </div>
            </div>

            <ArrowRight
              size={16}
              className="transition group-hover:translate-x-1"
              style={{ color: EPHM_DARK.neutral.gray400 }}
            />
          </Link>

          <Link
            to="/dashboard/etablissement"
            className="group flex items-center justify-between rounded-xl border px-3 py-3 shadow-sm transition hover:shadow-md"
            style={{
              borderColor: EPHM_DARK.neutral.gray200,
              backgroundColor: EPHM_DARK.background.card,
            }}
          >
            <div className="flex items-center gap-2">
              <div
                className="rounded-lg p-2"
                style={{
                  backgroundColor: EPHM_DARK.primary[800] + "60",
                  color: EPHM_DARK.primary[300],
                }}
              >
                <Building2 size={17} />
              </div>

              <div>
                <p
                  className="text-xs font-semibold"
                  style={{ color: EPHM_DARK.neutral.gray800 }}
                >
                  Établissements
                </p>

                <p
                  className="hidden text-[11px] sm:block"
                  style={{ color: EPHM_DARK.neutral.gray400 }}
                >
                  Consulter les hôpitaux
                </p>
              </div>
            </div>

            <ArrowRight
              size={16}
              className="transition group-hover:translate-x-1"
              style={{ color: EPHM_DARK.neutral.gray400 }}
            />
          </Link>

          <Link
            to="/dashboard/prediction"
            className="group flex items-center justify-between rounded-xl border px-3 py-3 shadow-sm transition hover:shadow-md"
            style={{
              borderColor: EPHM_DARK.neutral.gray200,
              backgroundColor: EPHM_DARK.background.card,
            }}
          >
            <div className="flex items-center gap-2">
              <div
                className="rounded-lg p-2"
                style={{
                  backgroundColor: EPHM_DARK.status.danger + "30",
                  color: EPHM_DARK.status.danger,
                }}
              >
                <AlertTriangle size={17} />
              </div>

              <div>
                <p
                  className="text-xs font-semibold"
                  style={{ color: EPHM_DARK.neutral.gray800 }}
                >
                  Prédictions
                </p>

                <p
                  className="hidden text-[11px] sm:block"
                  style={{ color: EPHM_DARK.neutral.gray400 }}
                >
                  Analyser les risques
                </p>
              </div>
            </div>

            <ArrowRight
              size={16}
              className="transition group-hover:translate-x-1"
              style={{ color: EPHM_DARK.neutral.gray400 }}
            />
          </Link>

          <Link
            to="/dashboard/methodologie"
            className="group flex items-center justify-between rounded-xl border px-3 py-3 shadow-sm transition hover:shadow-md"
            style={{
              borderColor: EPHM_DARK.neutral.gray200,
              backgroundColor: EPHM_DARK.background.card,
            }}
          >
            <div className="flex items-center gap-2">
              <div
                className="rounded-lg p-2"
                style={{
                  backgroundColor: EPHM_DARK.primary[800] + "60",
                  color: EPHM_DARK.primary[300],
                }}
              >
                <BookOpen size={17} />
              </div>

              <div>
                <p
                  className="text-xs font-semibold"
                  style={{ color: EPHM_DARK.neutral.gray800 }}
                >
                  Méthodologie
                </p>

                <p
                  className="hidden text-[11px] sm:block"
                  style={{ color: EPHM_DARK.neutral.gray400 }}
                >
                  Comprendre les modèles
                </p>
              </div>
            </div>

            <ArrowRight
              size={16}
              className="transition group-hover:translate-x-1"
              style={{ color: EPHM_DARK.neutral.gray400 }}
            />
          </Link>
        </div>
      </section>
    </div>
  );
}
