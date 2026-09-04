import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { getEtablissements, getHistoriqueEtablissement } from "../../api/stats.api";
import { COULEURS_CATEGORIES } from "../../constants/dashboard.constants";

export default function FicheEtablissement() {
  const { data: etablissements, isLoading: chargementListe } = useQuery({
    queryKey: ["etablissements"],
    queryFn: getEtablissements,
  });

  const [codeSelectionne, setCodeSelectionne] = useState<string>("");
  const [recherche, setRecherche] = useState("");

  const etablissementsFiltres = useMemo(() => {
    if (!etablissements) return [];
    const q = recherche.toLowerCase();
    return etablissements.filter((e) => e.nom_hopital.toLowerCase().includes(q) || e.region.toLowerCase().includes(q));
  }, [etablissements, recherche]);

  const { data: historique, isLoading: chargementHistorique } = useQuery({
    queryKey: ["historique", codeSelectionne],
    queryFn: () => getHistoriqueEtablissement(codeSelectionne),
    enabled: !!codeSelectionne,
  });

  const donneesGraphique = (historique ?? []).map((r) => ({
    periode: `${String(r.mois).padStart(2, "0")}/${r.annee}`,
    IGPH: r.IGPH ?? 0,
    "Taux mortalité (%)": r.taux_mortalite,
    "TOM (%)": r.TOM,
  }));

  const derniereEntree = historique?.[historique.length - 1];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Fiche établissement</h1>
        <p className="text-base-content/60">Historique et profil détaillé d'un hôpital.</p>
      </div>

      <div className="max-w-md">
        <label className="label">🔎 Rechercher un établissement</label>
        <input
          type="text"
          placeholder="Nom ou région..."
          className="input w-full"
          value={recherche}
          onChange={(e) => setRecherche(e.target.value)}
        />
        {chargementListe ? (
          <div className="mt-2"><span className="loading loading-spinner loading-sm" /></div>
        ) : (
          recherche && (
            <ul className="menu bg-base-100 border border-base-300 rounded-box mt-1 max-h-56 overflow-y-auto">
              {etablissementsFiltres.slice(0, 15).map((e) => (
                <li key={e.code_hopital}>
                  <button onClick={() => { setCodeSelectionne(e.code_hopital); setRecherche(""); }}>
                    {e.nom_hopital} <span className="text-xs opacity-60">· {e.region}</span>
                  </button>
                </li>
              ))}
              {etablissementsFiltres.length === 0 && <li className="px-3 py-2 text-sm opacity-60">Aucun résultat</li>}
            </ul>
          )
        )}
      </div>

      {!codeSelectionne && (
        <div className="alert">
          <span>Sélectionne un établissement ci-dessus pour afficher sa fiche.</span>
        </div>
      )}

      {codeSelectionne && chargementHistorique && (
        <div className="flex justify-center py-8"><span className="loading loading-spinner loading-lg" /></div>
      )}

      {derniereEntree && (
        <>
          <div className="card border border-base-300 bg-base-100">
            <div className="card-body">
              <h2 className="card-title">{derniereEntree.nom_hopital}</h2>
              <div className="grid grid-cols-2 gap-3 text-sm md:grid-cols-4">
                <p><span className="opacity-60">Type :</span> {derniereEntree.type_etablissement}</p>
                <p><span className="opacity-60">Région :</span> {derniereEntree.region} ({derniereEntree.zone_geographique})</p>
                <p><span className="opacity-60">Énergie :</span> {derniereEntree.source_energie_principale}</p>
                <p>
                  <span className="opacity-60">Catégorie :</span>{" "}
                  {derniereEntree.categorie && (
                    <span
                      className="badge badge-outline"
                      style={{ color: COULEURS_CATEGORIES[derniereEntree.categorie], borderColor: COULEURS_CATEGORIES[derniereEntree.categorie] }}
                    >
                      {derniereEntree.categorie}
                    </span>
                  )}
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            <div className="stat rounded-xl border border-base-300 bg-base-100">
              <div className="stat-title">IGPH (dernier mois)</div>
              <div className="stat-value text-xl">{derniereEntree.IGPH?.toFixed(3) ?? "—"}</div>
            </div>
            <div className="stat rounded-xl border border-base-300 bg-base-100">
              <div className="stat-title">Mortalité</div>
              <div className="stat-value text-xl">{derniereEntree.taux_mortalite.toFixed(2)} %</div>
            </div>
            <div className="stat rounded-xl border border-base-300 bg-base-100">
              <div className="stat-title">TOM</div>
              <div className="stat-value text-xl">{derniereEntree.TOM.toFixed(1)} %</div>
            </div>
            <div className="stat rounded-xl border border-base-300 bg-base-100">
              <div className="stat-title">Mois en haut risque</div>
              <div className="stat-value text-xl">{historique?.filter((r) => r.haut_risque).length ?? 0} / {historique?.length ?? 0}</div>
            </div>
          </div>

          <div className="card border border-base-300 bg-base-100">
            <div className="card-body">
              <h2 className="card-title text-base">Évolution mensuelle</h2>
              <div style={{ width: "100%", height: 320 }}>
                <ResponsiveContainer>
                  <LineChart data={donneesGraphique}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="periode" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="IGPH" stroke="#0F766E" strokeWidth={2} />
                    <Line type="monotone" dataKey="Taux mortalité (%)" stroke="#DC2626" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto rounded-xl border border-base-300">
            <table className="table table-sm">
              <thead>
                <tr>
                  <th>Année</th><th>Mois</th><th>Catégorie</th><th>IGPH</th><th>TOM</th><th>Mortalité</th><th>Haut risque</th>
                </tr>
              </thead>
              <tbody>
                {[...(historique ?? [])].reverse().map((r) => (
                  <tr key={r._id}>
                    <td>{r.annee}</td>
                    <td>{r.mois}</td>
                    <td>{r.categorie ?? "—"}</td>
                    <td>{r.IGPH?.toFixed(3) ?? "—"}</td>
                    <td>{r.TOM.toFixed(1)} %</td>
                    <td>{r.taux_mortalite.toFixed(2)} %</td>
                    <td>{r.haut_risque ? <span className="badge badge-error badge-sm">Oui</span> : "Non"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
