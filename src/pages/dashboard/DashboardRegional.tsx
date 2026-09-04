import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { MapContainer, TileLayer, CircleMarker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { getRegions } from "../../api/stats.api";
import { COULEURS_CATEGORIES, COORDONNEES_REGIONS, CENTRE_MADAGASCAR } from "../../constants/dashboard.constants";

type Tri = "igph" | "risque" | "nom";

export default function DashboardRegional() {
  const { data: regions, isLoading } = useQuery({ queryKey: ["regions"], queryFn: () => getRegions() });
  const [tri, setTri] = useState<Tri>("igph");

  const classement = useMemo(() => {
    const liste = [...(regions ?? [])];
    if (tri === "igph") liste.sort((a, b) => b.igphMoyen - a.igphMoyen);
    if (tri === "risque") liste.sort((a, b) => b.pctHautRisque - a.pctHautRisque);
    if (tri === "nom") liste.sort((a, b) => a.region.localeCompare(b.region));
    return liste;
  }, [regions, tri]);

  if (isLoading) {
    return <div className="flex justify-center py-10"><span className="loading loading-spinner loading-lg" /></div>;
  }

  if (!regions || regions.length === 0) {
    return (
      <div className="alert">
        <span>Aucune donnée régionale pour l'instant — importe un CSV pour commencer.</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Dashboard régional</h1>
        <p className="text-base-content/60">Carte de Madagascar et classement des 23 régions.</p>
      </div>

      <div className="overflow-hidden rounded-2xl border border-base-300">
        <MapContainer center={CENTRE_MADAGASCAR} zoom={5.3} scrollWheelZoom style={{ height: "480px", width: "100%" }}>
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {regions.map((r) => {
            const coord = COORDONNEES_REGIONS[r.region];
            if (!coord) return null;
            const couleur = COULEURS_CATEGORIES[r.categorieDominante ?? ""] ?? "#64748B";
            return (
              <CircleMarker
                key={r.region}
                center={coord}
                radius={6 + Math.sqrt(r.nbHopitaux) * 3}
                pathOptions={{ color: couleur, fillColor: couleur, fillOpacity: 0.55, weight: 1 }}
              >
                <Popup>
                  <div className="space-y-1">
                    <p className="font-semibold">{r.region}</p>
                    <p>{r.nbHopitaux} établissement(s)</p>
                    <p>IGPH moyen : {r.igphMoyen.toFixed(3)}</p>
                    <p>% haut risque : {(r.pctHautRisque * 100).toFixed(1)} %</p>
                    <p>Catégorie dominante : {r.categorieDominante ?? "—"}</p>
                  </div>
                </Popup>
              </CircleMarker>
            );
          })}
        </MapContainer>
      </div>
      <p className="text-xs text-base-content/50">
        Taille des bulles = nombre d'établissements. Couleur = catégorie de performance dominante (K-Means).
      </p>

      <div className="flex flex-wrap items-center gap-3">
        <span className="text-sm font-medium">Trier par :</span>
        <div className="join">
          <button className={`btn btn-sm join-item ${tri === "igph" ? "btn-active" : ""}`} onClick={() => setTri("igph")}>IGPH</button>
          <button className={`btn btn-sm join-item ${tri === "risque" ? "btn-active" : ""}`} onClick={() => setTri("risque")}>% haut risque</button>
          <button className={`btn btn-sm join-item ${tri === "nom" ? "btn-active" : ""}`} onClick={() => setTri("nom")}>Nom</button>
        </div>
      </div>

      <div className="overflow-x-auto rounded-xl border border-base-300">
        <table className="table">
          <thead>
            <tr>
              <th>Région</th>
              <th>Catégorie dominante</th>
              <th>Établissements</th>
              <th>IGPH moyen</th>
              <th>% haut risque</th>
              <th>Mortalité moyenne</th>
            </tr>
          </thead>
          <tbody>
            {classement.map((r) => (
              <tr key={r.region}>
                <td className="font-medium">{r.region}</td>
                <td>
                  {r.categorieDominante && (
                    <span
                      className="badge badge-outline"
                      style={{ color: COULEURS_CATEGORIES[r.categorieDominante], borderColor: COULEURS_CATEGORIES[r.categorieDominante] }}
                    >
                      {r.categorieDominante}
                    </span>
                  )}
                </td>
                <td>{r.nbHopitaux}</td>
                <td>{r.igphMoyen.toFixed(3)}</td>
                <td>{(r.pctHautRisque * 100).toFixed(1)} %</td>
                <td>{r.tauxMortaliteMoyen.toFixed(2)} %</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
