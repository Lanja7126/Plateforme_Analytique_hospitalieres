import { z } from "zod";

/** Mêmes règles que le backend (services/validationSchemas.js) — gardées synchronisées à la main. */
export const schemaRapportBrut = z.object({
  annee: z.coerce.number().int().min(2000).max(2100),
  mois: z.coerce.number().int().min(1).max(12),
  type_etablissement: z.string().min(1, "Requis"),
  region: z.string().min(1, "Requis"),
  zone_geographique: z.string().min(1, "Requis"),
  source_energie_principale: z.string().min(1, "Requis"),

  lits_disponibles: z.coerce.number().positive("Doit être > 0"),
  effectif_medecins_etp: z.coerce.number().positive("Doit être > 0"),
  effectif_paramedicaux_etp: z.coerce.number().positive("Doit être > 0"),

  admissions_totales: z.coerce.number().nonnegative(),
  journees_hospitalisation: z.coerce.number().nonnegative(),
  consultations_externes: z.coerce.number().nonnegative(),
  passages_urgences: z.coerce.number().nonnegative(),
  actes_chirurgicaux: z.coerce.number().nonnegative(),
  accouchements_totaux: z.coerce.number().nonnegative(),
  cesariennes: z.coerce.number().nonnegative(),

  cas_mas_admis: z.coerce.number().nonnegative().default(0),
  cas_paludisme_grave: z.coerce.number().nonnegative().default(0),
  jours_coupure_electricite: z.coerce.number().min(0).max(31).default(0),
  poches_sang_disponibles_moy: z.coerce.number().nonnegative().default(0),
  jours_rupture_stock_vitaux: z.coerce.number().min(0).max(31).default(0),
  deces_moins_24h: z.coerce.number().nonnegative().default(0),
  deces_plus_24h: z.coerce.number().nonnegative().default(0),

  recettes_fanome_mga: z.coerce.number().nonnegative(),
});

export const schemaRapportComplet = schemaRapportBrut.extend({
  code_hopital: z.string().min(1, "Requis"),
  nom_hopital: z.string().min(1, "Requis"),
  district: z.string().optional(),
});

// Zod v4 distingue le type "entrée" (avant coercion — ce que react-hook-form
// manipule dans les <input>) et le type "sortie" (après coercion — ce que
// l'API reçoit). z.infer<> pointe vers la sortie, donc on nomme les deux
// explicitement pour que useForm() et handleSubmit() restent cohérents.
export type FormRapportBrutInput = z.input<typeof schemaRapportBrut>;
export type FormRapportBrut = z.output<typeof schemaRapportBrut>;

export type FormRapportCompletInput = z.input<typeof schemaRapportComplet>;
export type FormRapportComplet = z.output<typeof schemaRapportComplet>;

/**
 * Groupement des champs par étape du formulaire progressif — utilisé à la fois
 * pour l'affichage (ImportDonnees.tsx) et pour valider uniquement l'étape
 * courante avant d'autoriser le bouton "Suivant" (trigger(champs)).
 */
export const ETAPES_RAPPORT: { titre: string; champs: (keyof FormRapportComplet)[] }[] = [
  {
    titre: "Identité & contexte",
    champs: [
      "code_hopital", "nom_hopital", "type_etablissement", "region", "district",
      "zone_geographique", "source_energie_principale", "annee", "mois",
    ],
  },
  {
    titre: "Capacité & effectifs",
    champs: ["lits_disponibles", "effectif_medecins_etp", "effectif_paramedicaux_etp"],
  },
  {
    titre: "Activité du mois",
    champs: [
      "admissions_totales", "journees_hospitalisation", "consultations_externes",
      "passages_urgences", "actes_chirurgicaux", "accouchements_totaux", "cesariennes",
    ],
  },
  {
    titre: "Épidémiologie & logistique",
    champs: [
      "cas_mas_admis", "cas_paludisme_grave", "jours_coupure_electricite",
      "poches_sang_disponibles_moy", "jours_rupture_stock_vitaux", "deces_moins_24h", "deces_plus_24h",
    ],
  },
  {
    titre: "Finances & récapitulatif",
    champs: ["recettes_fanome_mga"],
  },
];
