import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { Map as MapIcon, Building2, AlertTriangle, BookOpen } from "lucide-react";
import { getKpisNationaux, getRegions } from "../../api/stats.api";
import { COULEURS_CATEGORIES } from "../../constants/dashboard.constants";

export default function Accueil() {
  const { data: kpis, isLoading: chargementKpis } = useQuery({
    queryKey: ["kpis"],
    queryFn: () => getKpisNationaux(),
  });

  const { data: regions, isLoading: chargementRegions } = useQuery({
    queryKey: ["regions"],
    queryFn: () => getRegions(),
  });

  const regionsARisque = [...(regions ?? [])].sort((a, b) => b.pctHautRisque - a.pctHautRisque).slice(0, 5);
  const regionsPerformantes = [...(regions ?? [])].sort((a, b) => b.igphMoyen - a.igphMoyen).slice(0, 5);

  return (
    <div className="space-y-6">
      <div className="rounded-2xl bg-gradient-to-r from-teal-700 to-teal-900 p-7 text-white">
        <h1 className="text-2xl font-bold">Vue d'ensemble nationale</h1>
        <p className="mt-1 text-teal-100">
          Centraliser, analyser et visualiser la performance des hôpitaux malgaches pour mieux piloter
          le système de santé et optimiser l'allocation des ressources.
        </p>
      </div>

      {chargementKpis ? (
        <div className="flex justify-center py-8"><span className="loading loading-spinner loading-lg" /></div>
      ) : (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          <div className="stat rounded-xl border border-base-300 bg-base-100">
            <div className="stat-title">Rapports</div>
            <div className="stat-value text-2xl">{kpis?.nbRapports ?? 0}</div>
          </div>
          <div className="stat rounded-xl border border-base-300 bg-base-100">
            <div className="stat-title">Établissements</div>
            <div className="stat-value text-2xl">{kpis?.nbHopitaux ?? 0}</div>
          </div>
          <div className="stat rounded-xl border border-base-300 bg-base-100">
            <div className="stat-title">IGPH moyen</div>
            <div className="stat-value text-2xl">{kpis?.igphMoyen?.toFixed(3) ?? "—"}</div>
          </div>
          <div className="stat rounded-xl border border-base-300 bg-base-100">
            <div className="stat-title">% haut risque</div>
            <div className="stat-value text-2xl text-error">
              {kpis ? `${(kpis.pctHautRisque * 100).toFixed(1)} %` : "—"}
            </div>
          </div>
        </div>
      )}

      {!chargementRegions && regions && regions.length > 0 && (
        <div className="grid gap-4 md:grid-cols-2">
          <div className="card border border-base-300 bg-base-100">
            <div className="card-body">
              <h2 className="card-title text-base">🚨 Régions à surveiller en priorité</h2>
              <ul className="space-y-2">
                {regionsARisque.map((r) => (
                  <li key={r.region} className="flex items-center justify-between">
                    <span className="font-medium">{r.region}</span>
                    <span className="badge badge-error badge-outline">{(r.pctHautRisque * 100).toFixed(0)}% haut risque</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <div className="card border border-base-300 bg-base-100">
            <div className="card-body">
              <h2 className="card-title text-base">✅ Régions les plus performantes</h2>
              <ul className="space-y-2">
                {regionsPerformantes.map((r) => (
                  <li key={r.region} className="flex items-center justify-between">
                    <span className="font-medium">{r.region}</span>
                    <span
                      className="badge badge-outline"
                      style={{ color: COULEURS_CATEGORIES["Performance élevée"], borderColor: COULEURS_CATEGORIES["Performance élevée"] }}
                    >
                      IGPH {r.igphMoyen.toFixed(2)}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {!chargementRegions && (!regions || regions.length === 0) && (
        <div className="alert">
          <span>Aucune donnée pour l'instant — importe un CSV depuis la page Import de données pour commencer.</span>
        </div>
      )}

      <div>
        <h2 className="mb-2 text-lg font-semibold">Accéder directement à…</h2>
        <div className="grid gap-3 sm:grid-cols-3">
          <Link to="/dashboard/regional" className="btn btn-outline justify-start"><MapIcon className="size-4" /> Dashboard régional</Link>
          <Link to="/dashboard/etablissement" className="btn btn-outline justify-start"><Building2 className="size-4" /> Fiche établissement</Link>
          <Link to="/dashboard/prediction" className="btn btn-outline justify-start"><AlertTriangle className="size-4" /> Prédiction de risque</Link>
          <Link to="/dashboard/methodologie" className="btn btn-outline justify-start"><BookOpen className="size-4" /> Méthodologie</Link>
        </div>
      </div>
    </div>
  );
}
