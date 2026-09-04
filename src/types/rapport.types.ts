export interface RapportBrut {
  code_hopital: string;
  nom_hopital: string;
  type_etablissement: string;
  region: string;
  district?: string;
  zone_geographique: string;
  source_energie_principale: string;

  annee: number;
  mois: number;

  lits_disponibles: number;
  effectif_medecins_etp: number;
  effectif_paramedicaux_etp: number;

  admissions_totales: number;
  journees_hospitalisation: number;
  consultations_externes: number;
  passages_urgences: number;
  actes_chirurgicaux: number;
  accouchements_totaux: number;
  cesariennes: number;

  cas_mas_admis: number;
  cas_paludisme_grave: number;
  jours_coupure_electricite: number;
  poches_sang_disponibles_moy: number;
  jours_rupture_stock_vitaux: number;
  deces_moins_24h: number;
  deces_plus_24h: number;

  recettes_fanome_mga: number;
}

export interface Rapport extends RapportBrut {
  _id: string;
  IGPH: number | null;
  haut_risque: boolean | null;
  categorie: string | null;
  TOM: number;
  DMS: number;
  taux_mortalite: number;
  taux_cesarienne: number;
  createdAt: string;
}

export interface KpiNationaux {
  nbRapports: number;
  nbHopitaux: number;
  nbRegions: number;
  igphMoyen: number;
  pctHautRisque: number;
}

export interface RegionAgregee {
  region: string;
  nbHopitaux: number;
  igphMoyen: number;
  tauxMortaliteMoyen: number;
  pctHautRisque: number;
  categorieDominante: string | null;
}

export interface EtablissementResume {
  code_hopital: string;
  nom_hopital: string;
  region: string;
}

export interface MetaCategorielle {
  regions: string[];
  typesEtablissement: string[];
  zonesGeographiques: string[];
  sourcesEnergie: string[];
}

export interface ResultatPrediction {
  proba_haut_risque: number;
  igph: number;
}
