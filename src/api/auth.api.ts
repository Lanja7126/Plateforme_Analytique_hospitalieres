import { api } from "./client";
import type { ReponseAuth } from "../types/auth.types";

export interface IdentifiantsConnexion {
  email: string;
  motDePasse: string;
}

export interface IdentifiantsInscription extends IdentifiantsConnexion {
  nom: string;
}

export async function seConnecter(identifiants: IdentifiantsConnexion): Promise<ReponseAuth> {
  const { data } = await api.post<ReponseAuth>("/auth/connexion", identifiants);
  return data;
}

export async function sInscrire(identifiants: IdentifiantsInscription): Promise<ReponseAuth> {
  const { data } = await api.post<ReponseAuth>("/auth/inscription", identifiants);
  return data;
}
