import { z } from "zod";

export const schemaConnexion = z.object({
  email: z.string().email("Email invalide"),
  motDePasse: z.string().min(1, "Le mot de passe est requis"),
});

export const schemaInscription = z.object({
  nom: z.string().min(2, "2 caractères minimum"),
  email: z.string().email("Email invalide"),
  motDePasse: z.string().min(8, "8 caractères minimum"),
});

export type FormConnexion = z.infer<typeof schemaConnexion>;
export type FormInscription = z.infer<typeof schemaInscription>;
