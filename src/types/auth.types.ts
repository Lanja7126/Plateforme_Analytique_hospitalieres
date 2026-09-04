export type Role = "admin" | "analyste";

export interface Utilisateur {
  id: string;
  nom: string;
  email: string;
  role: Role;
}

export interface ReponseAuth {
  utilisateur: Utilisateur;
  token: string;
}
