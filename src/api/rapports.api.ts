import { api } from "./client";
import type { RapportBrut } from "../types/rapport.types";

export interface ResultatImportCSV {
  lignesLues: number;
  inseres: number;
  misAJour: number;
}

export async function importerCSV(fichier: File): Promise<ResultatImportCSV> {
  const formData = new FormData();
  formData.append("fichier", fichier);
  const { data } = await api.post<ResultatImportCSV>("/rapports/import", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data;
}

export async function creerRapportManuel(rapport: RapportBrut) {
  const { data } = await api.post("/rapports", rapport);
  return data;
}
