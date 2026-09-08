import { z } from "zod";

// ============================================================
// SCHÉMA DE CONNEXION
// ============================================================
export const schemaConnexion = z.object({
  email: z.string().email("Email invalide"),
  motDePasse: z.string().min(1, "Le mot de passe est requis"),
});

export type FormConnexion = z.infer<typeof schemaConnexion>;

// ============================================================
// SCHÉMA D'INSCRIPTION
// ============================================================
export const schemaInscription = z
  .object({
    nom: z.string().min(2, "Le nom doit contenir au moins 2 caractères"),
    email: z.string().email("Email invalide"),
    motDePasse: z.string()
      .min(8, "Le mot de passe doit contenir au moins 8 caractères")
      .regex(/[a-z]/, "Doit contenir au moins une minuscule")
      .regex(/[A-Z]/, "Doit contenir au moins une majuscule")
      .regex(/[0-9]/, "Doit contenir au moins un chiffre"),
    confirmMotDePasse: z.string().min(1, "Veuillez confirmer le mot de passe"),
    conditions: z.boolean().refine(val => val === true, {
      message: "Vous devez accepter les conditions d'utilisation",
    }),
  })
  .refine((data) => data.motDePasse === data.confirmMotDePasse, {
    message: "Les mots de passe ne correspondent pas",
    path: ["confirmMotDePasse"],
  });

export type FormInscription = z.infer<typeof schemaInscription>;

// ============================================================
// TYPE POUR L'API (sans les champs de validation)
// ============================================================
export type InscriptionApi = Omit<FormInscription, "confirmMotDePasse" | "conditions">;