import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Utilisateur } from "../types/auth.types";
import { seConnecter, sInscrire, type IdentifiantsConnexion, type IdentifiantsInscription } from "../api/auth.api";

interface AuthState {
  utilisateur: Utilisateur | null;
  token: string | null;
  chargement: boolean;
  erreur: string | null;

  connecter: (identifiants: IdentifiantsConnexion) => Promise<void>;
  inscrire: (identifiants: IdentifiantsInscription) => Promise<void>;
  deconnecter: () => void;
}

function extraireMessageErreur(err: unknown): string {
  const reponse = (err as { response?: { data?: { message?: string } } })?.response;
  return reponse?.data?.message || "Une erreur est survenue. Réessaie.";
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      utilisateur: null,
      token: null,
      chargement: false,
      erreur: null,

      connecter: async (identifiants) => {
        set({ chargement: true, erreur: null });
        try {
          const { utilisateur, token } = await seConnecter(identifiants);
          set({ utilisateur, token, chargement: false });
        } catch (err) {
          set({ chargement: false, erreur: extraireMessageErreur(err) });
          throw err;
        }
      },

      inscrire: async (identifiants) => {
        set({ chargement: true, erreur: null });
        try {
          const { utilisateur, token } = await sInscrire(identifiants);
          set({ utilisateur, token, chargement: false });
        } catch (err) {
          set({ chargement: false, erreur: extraireMessageErreur(err) });
          throw err;
        }
      },

      deconnecter: () => set({ utilisateur: null, token: null, erreur: null }),
    }),
    {
      name: "session-plateforme-hospitaliere",
      partialize: (state) => ({ utilisateur: state.utilisateur, token: state.token }),
    }
  )
);

export const useEstAuthentifie = () => useAuthStore((s) => !!s.token);
export const useRole = () => useAuthStore((s) => s.utilisateur?.role ?? null);
