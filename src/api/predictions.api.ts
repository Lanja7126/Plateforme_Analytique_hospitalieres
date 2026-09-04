import { api } from "./client";
import type { RapportBrut, ResultatPrediction } from "../types/rapport.types";

type PayloadPrediction = Omit<RapportBrut, "code_hopital" | "nom_hopital" | "district">;

export async function predire(payload: PayloadPrediction): Promise<ResultatPrediction> {
  const { data } = await api.post<ResultatPrediction>("/predictions", payload);
  return data;
}
