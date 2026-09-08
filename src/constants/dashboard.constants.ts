export const ORDRE_CATEGORIES = [
  "Performance élevée",
  "Performance satisfaisante",
  "Performance fragile",
  "Sous forte tension",
] as const;

export const COULEURS_CATEGORIES: Record<string, string> = {
  "Performance élevée": "#0F766E",
  "Performance satisfaisante": "#65A30D",
  "Performance fragile": "#F59E0B",
  "Sous forte tension": "#DC2626",
};

/** Centroïdes approximatifs des 23 régions (chef-lieu) — pour la carte. */
export const COORDONNEES_REGIONS: Record<string, [number, number]> = {
  Analamanga: [-18.8792, 47.5079],
  Vakinankaratra: [-19.8667, 47.0333],
  Itasy: [-19.0167, 46.7667],
  Bongolava: [-18.7667, 46.05],
  Matsiatra_Ambony: [-21.4547, 47.0857],
  Amoron_i_Mania: [-20.5333, 47.25],
  Vatovavy: [-21.2333, 48.3333],
  Fitovinany: [-22.15, 48.0167],
  Ihorombe: [-22.4, 46.1167],
  Atsimo_Atsinanana: [-22.8167, 47.8333],
  Atsinanana: [-18.15, 49.4],
  Analanjirofo: [-17.3833, 49.4],
  Alaotra_Mangoro: [-17.8333, 48.4167],
  Boeny: [-15.7167, 46.3167],
  Betsiboka: [-16.95, 46.8333],
  Melaky: [-18.0667, 44.0333],
  Sofia: [-14.8833, 47.9833],
  Sava: [-14.2667, 50.1667],
  Diana: [-12.2787, 49.2917],
  Atsimo_Andrefana: [-23.35, 43.6667],
  Androy: [-25.1667, 46.0833],
  Anosy: [-25.0333, 46.9833],
  Menabe: [-20.2833, 44.3167],
};

export const CENTRE_MADAGASCAR: [number, number] = [-19.0, 46.8];

/**
 * Correspondance entre les noms utilisés par l'API
 * et les noms NAME_2 du fichier GADM.
 */
export const MAPPING_REGIONS_GEOJSON: Record<string, string> = {
  Diana: "Diana",
  Sava: "Sava",

  Analanjirofo: "Analanjirofo",
  Atsinanana: "Atsinanana",
  Alaotra_Mangoro: "Alaotra-Mangoro",

  Analamanga: "Analamanga",
  Itasy: "Itasy",
  Vakinankaratra: "Vakinankaratra",

  Bongolava: "Bongolava",
  Betsiboka: "Betsiboka",
  Melaky: "Melaky",
  Boeny: "Boeny",
  Sofia: "Sofia",

  Amoron_i_Mania: "Amoron'imania",
  Matsiatra_Ambony: "Hautematsiatra",
  Ihorombe: "Ihorombe",

  Vatovavy: "Vatovavy",
  Fitovinany: "Fitovinany",
  Atsimo_Atsinanana: "Atsimo-Atsinana",

  Menabe: "Menabe",
  Atsimo_Andrefana: "Atsimo-Andrefana",
  Androy: "Androy",
  Anosy: "Anosy",
};
