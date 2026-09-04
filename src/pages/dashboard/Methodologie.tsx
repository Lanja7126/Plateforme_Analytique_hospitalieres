const SECTIONS = [
  {
    titre: "Indice IGPH (Indice Global de Performance Hospitalière)",
    contenu:
      "Moyenne de 5 indicateurs normalisés en min-max : TOM, disponibilité de stock, recette par patient " +
      "(favorables) et taux de mortalité, consultations par médecin (défavorables, inversés). Score continu entre 0 et 1.",
  },
  {
    titre: "Clusters K-Means (4 profils)",
    contenu:
      "Clustering sur 7 indicateurs standardisés (TOM, DMS, consultations/médecin, taux de mortalité, taux de " +
      "césarienne, disponibilité de stock, recette/patient). Nombre de clusters choisi par méthode du coude + " +
      "silhouette score, validé par ANOVA et tests de Tukey.",
  },
  {
    titre: "RandomForestClassifier — établissement à haut risque",
    contenu:
      "Cible binaire : dépassement du 75ᵉ percentile national sur le taux de mortalité ou sur les jours de " +
      "rupture de stock. Les variables utilisées pour construire cette cible sont exclues des features, pour " +
      "éviter que le modèle ne « redécouvre » simplement la règle de définition.",
  },
  {
    titre: "RandomForestRegressor — score IGPH",
    contenu:
      "Cible continue : le score IGPH lui-même. Les composantes exactes de l'indice (et leurs numérateurs " +
      "quasi-exacts) sont exclues des features, pour forcer le modèle à généraliser à partir de variables de " +
      "capacité, d'effectifs, d'activité et de contexte.",
  },
];

export default function Methodologie() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Méthodologie</h1>
        <p className="text-base-content/60">Comment sont construits les indicateurs, clusters et modèles de cette plateforme.</p>
      </div>

      {SECTIONS.map((s) => (
        <div key={s.titre} className="card border border-base-300 bg-base-100">
          <div className="card-body">
            <h2 className="card-title text-base">{s.titre}</h2>
            <p className="text-sm text-base-content/80">{s.contenu}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
