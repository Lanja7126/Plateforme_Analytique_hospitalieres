import { api } from "./client";
import type { KpiNationaux, RegionAgregee, EtablissementResume, MetaCategorielle, Rapport } from "../types/rapport.types";

export interface FiltresDashboard {
  annee?: number[];
  type_etablissement?: string[];
  zone_geographique?: string[];
}

function versParametres(filtres: FiltresDashboard = {}) {
  const params = new URLSearchParams();
  filtres.annee?.forEach((a) => params.append("annee", String(a)));
  filtres.type_etablissement?.forEach((t) => params.append("type_etablissement", t));
  filtres.zone_geographique?.forEach((z) => params.append("zone_geographique", z));
  return params;
}

export async function getKpisNationaux(filtres?: FiltresDashboard): Promise<KpiNationaux> {
  const { data } = await api.get<KpiNationaux>("/stats/kpis", { params: versParametres(filtres) });
  return data;
}

export async function getRegions(filtres?: FiltresDashboard): Promise<RegionAgregee[]> {
  const { data } = await api.get<{ regions: RegionAgregee[] }>("/stats/regions", { params: versParametres(filtres) });
  return data.regions;
}

export async function getEtablissements(): Promise<EtablissementResume[]> {
  const { data } = await api.get<{ etablissements: EtablissementResume[] }>("/stats/etablissements");
  return data.etablissements;
}

export async function getHistoriqueEtablissement(codeHopital: string): Promise<Rapport[]> {
  const { data } = await api.get<{ historique: Rapport[] }>(`/stats/etablissements/${codeHopital}/historique`);
  return data.historique;
}

export async function getMetaCategorielle(): Promise<MetaCategorielle> {
  const { data } = await api.get<MetaCategorielle>("/stats/meta");
  return data;
}
