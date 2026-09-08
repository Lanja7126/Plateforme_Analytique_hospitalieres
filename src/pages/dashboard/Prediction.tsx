import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { schemaRapportBrut, type FormRapportBrutInput, type FormRapportBrut } from "../../schemas/rapport.schema";
import { getMetaCategorielle } from "../../api/stats.api";
import { predire } from "../../api/predictions.api";
import { COULEURS_CATEGORIES } from "../../constants/dashboard.constants";
import ChampSelectOuTexte from "../../components/ChampSelectOuTexte";
import Jauge from "../../components/Jauge";

// ============================================================
// PALETTE EPHM DARK
// ============================================================
const EPHM_DARK = {
  primary: {
    50: "#e6f5f5",
    100: "#b3e0e0",
    200: "#80cccc",
    300: "#4db8b8",
    400: "#26a8a8",
    500: "#00a0a0",
    600: "#008080",
    700: "#006666",
    800: "#004d4d",
    900: "#003333",
  },
  accent: {
    teal: "#00a0a0",
    tealLight: "#4db8b8",
    tealDark: "#004d4d",
    gold: "#d4b85a",
    coral: "#e87461",
  },
  status: {
    success: "#3da68a",
    warning: "#dbb84d",
    danger: "#d96a5a",
    info: "#5a9fd4",
  },
  neutral: {
    white: "#ffffff",
    gray50: "#1a2a27",
    gray100: "#1f332f",
    gray200: "#2a3f3b",
    gray300: "#3d5a55",
    gray400: "#5a7a73",
    gray500: "#7a9a93",
    gray600: "#9abab2",
    gray700: "#b8d4cd",
    gray800: "#d8ece6",
    gray900: "#f0f8f5",
  },
  background: {
    page: "#0d1a18",
    card: "#152826",
    cardHover: "#1c3532",
    elevated: "#1f3a37",
  }
};

export default function Prediction() {
  const { data: meta } = useQuery({ queryKey: ["meta"], queryFn: getMetaCategorielle });

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormRapportBrutInput, unknown, FormRapportBrut>({
    resolver: zodResolver(schemaRapportBrut),
    defaultValues: {
      annee: new Date().getFullYear(), mois: new Date().getMonth() + 1,
      cas_mas_admis: 0, cas_paludisme_grave: 0, jours_coupure_electricite: 0,
      poches_sang_disponibles_moy: 0, jours_rupture_stock_vitaux: 0,
      deces_moins_24h: 0, deces_plus_24h: 0,
    },
  });

  const mutation = useMutation({
    mutationFn: predire,
    onError: () => toast.error("La prédiction a échoué — le service ML est peut-être injoignable."),
  });

  return (
    <div className="space-y-6" style={{ backgroundColor: EPHM_DARK.background.page, minHeight: "100vh", padding: "1.5rem" }}>
      <div>
        <h1 className="text-2xl font-bold" style={{ color: EPHM_DARK.neutral.gray800 }}>
          Prédiction de risque
        </h1>
        <p style={{ color: EPHM_DARK.neutral.gray400 }}>
          Simule un rapport mensuel et estime le risque et le score IGPH via les modèles RandomForest.
        </p>
      </div>

      <form onSubmit={handleSubmit((d) => mutation.mutate(d))} className="space-y-6">
        <fieldset 
          className="fieldset rounded-xl border p-4"
          style={{ 
            borderColor: EPHM_DARK.neutral.gray200,
            backgroundColor: EPHM_DARK.background.card 
          }}
        >
          <legend className="fieldset-legend" style={{ color: EPHM_DARK.neutral.gray700 }}>
            Contexte
          </legend>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div>
              <label className="label" style={{ color: EPHM_DARK.neutral.gray500 }}>Année</label>
              <input 
                type="number" 
                className="input w-full" 
                style={{ 
                  backgroundColor: EPHM_DARK.neutral.gray50,
                  borderColor: EPHM_DARK.neutral.gray200,
                  color: EPHM_DARK.neutral.gray800
                }}
                {...register("annee")} 
              />
            </div>
            <div>
              <label className="label" style={{ color: EPHM_DARK.neutral.gray500 }}>Mois</label>
              <input 
                type="number" 
                min={1} 
                max={12} 
                className="input w-full" 
                style={{ 
                  backgroundColor: EPHM_DARK.neutral.gray50,
                  borderColor: EPHM_DARK.neutral.gray200,
                  color: EPHM_DARK.neutral.gray800
                }}
                {...register("mois")} 
              />
            </div>
            <ChampSelectOuTexte 
              label="Type d'établissement" 
              name="type_etablissement" 
              options={meta?.typesEtablissement ?? []} 
              register={register} 
              erreur={errors.type_etablissement?.message} 
            />
            <ChampSelectOuTexte 
              label="Région" 
              name="region" 
              options={meta?.regions ?? []} 
              register={register} 
              erreur={errors.region?.message} 
            />
            <ChampSelectOuTexte 
              label="Zone géographique" 
              name="zone_geographique" 
              options={meta?.zonesGeographiques ?? []} 
              register={register} 
              erreur={errors.zone_geographique?.message} 
            />
            <ChampSelectOuTexte 
              label="Source d'énergie" 
              name="source_energie_principale" 
              options={meta?.sourcesEnergie ?? []} 
              register={register} 
              erreur={errors.source_energie_principale?.message} 
            />
          </div>
        </fieldset>

        <fieldset 
          className="fieldset rounded-xl border p-4"
          style={{ 
            borderColor: EPHM_DARK.neutral.gray200,
            backgroundColor: EPHM_DARK.background.card 
          }}
        >
          <legend className="fieldset-legend" style={{ color: EPHM_DARK.neutral.gray700 }}>
            Capacité & effectifs
          </legend>
          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <label className="label" style={{ color: EPHM_DARK.neutral.gray500 }}>Lits disponibles</label>
              <input 
                type="number" 
                className="input w-full" 
                style={{ 
                  backgroundColor: EPHM_DARK.neutral.gray50,
                  borderColor: EPHM_DARK.neutral.gray200,
                  color: EPHM_DARK.neutral.gray800
                }}
                {...register("lits_disponibles")} 
              />
            </div>
            <div>
              <label className="label" style={{ color: EPHM_DARK.neutral.gray500 }}>Médecins (ETP)</label>
              <input 
                type="number" 
                step="0.1" 
                className="input w-full" 
                style={{ 
                  backgroundColor: EPHM_DARK.neutral.gray50,
                  borderColor: EPHM_DARK.neutral.gray200,
                  color: EPHM_DARK.neutral.gray800
                }}
                {...register("effectif_medecins_etp")} 
              />
            </div>
            <div>
              <label className="label" style={{ color: EPHM_DARK.neutral.gray500 }}>Paramédicaux (ETP)</label>
              <input 
                type="number" 
                step="0.1" 
                className="input w-full" 
                style={{ 
                  backgroundColor: EPHM_DARK.neutral.gray50,
                  borderColor: EPHM_DARK.neutral.gray200,
                  color: EPHM_DARK.neutral.gray800
                }}
                {...register("effectif_paramedicaux_etp")} 
              />
            </div>
          </div>
        </fieldset>

        <fieldset 
          className="fieldset rounded-xl border p-4"
          style={{ 
            borderColor: EPHM_DARK.neutral.gray200,
            backgroundColor: EPHM_DARK.background.card 
          }}
        >
          <legend className="fieldset-legend" style={{ color: EPHM_DARK.neutral.gray700 }}>
            Activité du mois
          </legend>
          <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-4">
            <div>
              <label className="label" style={{ color: EPHM_DARK.neutral.gray500 }}>Admissions totales</label>
              <input 
                type="number" 
                className="input w-full" 
                style={{ 
                  backgroundColor: EPHM_DARK.neutral.gray50,
                  borderColor: EPHM_DARK.neutral.gray200,
                  color: EPHM_DARK.neutral.gray800
                }}
                {...register("admissions_totales")} 
              />
            </div>
            <div>
              <label className="label" style={{ color: EPHM_DARK.neutral.gray500 }}>Journées d'hospitalisation</label>
              <input 
                type="number" 
                className="input w-full" 
                style={{ 
                  backgroundColor: EPHM_DARK.neutral.gray50,
                  borderColor: EPHM_DARK.neutral.gray200,
                  color: EPHM_DARK.neutral.gray800
                }}
                {...register("journees_hospitalisation")} 
              />
            </div>
            <div>
              <label className="label" style={{ color: EPHM_DARK.neutral.gray500 }}>Consultations externes</label>
              <input 
                type="number" 
                className="input w-full" 
                style={{ 
                  backgroundColor: EPHM_DARK.neutral.gray50,
                  borderColor: EPHM_DARK.neutral.gray200,
                  color: EPHM_DARK.neutral.gray800
                }}
                {...register("consultations_externes")} 
              />
            </div>
            <div>
              <label className="label" style={{ color: EPHM_DARK.neutral.gray500 }}>Passages aux urgences</label>
              <input 
                type="number" 
                className="input w-full" 
                style={{ 
                  backgroundColor: EPHM_DARK.neutral.gray50,
                  borderColor: EPHM_DARK.neutral.gray200,
                  color: EPHM_DARK.neutral.gray800
                }}
                {...register("passages_urgences")} 
              />
            </div>
            <div>
              <label className="label" style={{ color: EPHM_DARK.neutral.gray500 }}>Actes chirurgicaux</label>
              <input 
                type="number" 
                className="input w-full" 
                style={{ 
                  backgroundColor: EPHM_DARK.neutral.gray50,
                  borderColor: EPHM_DARK.neutral.gray200,
                  color: EPHM_DARK.neutral.gray800
                }}
                {...register("actes_chirurgicaux")} 
              />
            </div>
            <div>
              <label className="label" style={{ color: EPHM_DARK.neutral.gray500 }}>Accouchements totaux</label>
              <input 
                type="number" 
                className="input w-full" 
                style={{ 
                  backgroundColor: EPHM_DARK.neutral.gray50,
                  borderColor: EPHM_DARK.neutral.gray200,
                  color: EPHM_DARK.neutral.gray800
                }}
                {...register("accouchements_totaux")} 
              />
            </div>
            <div>
              <label className="label" style={{ color: EPHM_DARK.neutral.gray500 }}>Césariennes</label>
              <input 
                type="number" 
                className="input w-full" 
                style={{ 
                  backgroundColor: EPHM_DARK.neutral.gray50,
                  borderColor: EPHM_DARK.neutral.gray200,
                  color: EPHM_DARK.neutral.gray800
                }}
                {...register("cesariennes")} 
              />
            </div>
          </div>
        </fieldset>

        <fieldset 
          className="fieldset rounded-xl border p-4"
          style={{ 
            borderColor: EPHM_DARK.neutral.gray200,
            backgroundColor: EPHM_DARK.background.card 
          }}
        >
          <legend className="fieldset-legend" style={{ color: EPHM_DARK.neutral.gray700 }}>
            Épidémiologie & logistique
          </legend>
          <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-4">
            <div>
              <label className="label" style={{ color: EPHM_DARK.neutral.gray500 }}>Cas MAS admis</label>
              <input 
                type="number" 
                className="input w-full" 
                style={{ 
                  backgroundColor: EPHM_DARK.neutral.gray50,
                  borderColor: EPHM_DARK.neutral.gray200,
                  color: EPHM_DARK.neutral.gray800
                }}
                {...register("cas_mas_admis")} 
              />
            </div>
            <div>
              <label className="label" style={{ color: EPHM_DARK.neutral.gray500 }}>Paludisme grave</label>
              <input 
                type="number" 
                className="input w-full" 
                style={{ 
                  backgroundColor: EPHM_DARK.neutral.gray50,
                  borderColor: EPHM_DARK.neutral.gray200,
                  color: EPHM_DARK.neutral.gray800
                }}
                {...register("cas_paludisme_grave")} 
              />
            </div>
            <div>
              <label className="label" style={{ color: EPHM_DARK.neutral.gray500 }}>Jours coupure électricité</label>
              <input 
                type="number" 
                min={0} 
                max={31} 
                className="input w-full" 
                style={{ 
                  backgroundColor: EPHM_DARK.neutral.gray50,
                  borderColor: EPHM_DARK.neutral.gray200,
                  color: EPHM_DARK.neutral.gray800
                }}
                {...register("jours_coupure_electricite")} 
              />
            </div>
            <div>
              <label className="label" style={{ color: EPHM_DARK.neutral.gray500 }}>Poches de sang (moy.)</label>
              <input 
                type="number" 
                className="input w-full" 
                style={{ 
                  backgroundColor: EPHM_DARK.neutral.gray50,
                  borderColor: EPHM_DARK.neutral.gray200,
                  color: EPHM_DARK.neutral.gray800
                }}
                {...register("poches_sang_disponibles_moy")} 
              />
            </div>
            <div>
              <label className="label" style={{ color: EPHM_DARK.neutral.gray500 }}>Jours rupture stock vitaux</label>
              <input 
                type="number" 
                min={0} 
                max={31} 
                className="input w-full" 
                style={{ 
                  backgroundColor: EPHM_DARK.neutral.gray50,
                  borderColor: EPHM_DARK.neutral.gray200,
                  color: EPHM_DARK.neutral.gray800
                }}
                {...register("jours_rupture_stock_vitaux")} 
              />
            </div>
            <div>
              <label className="label" style={{ color: EPHM_DARK.neutral.gray500 }}>Décès &lt; 24h</label>
              <input 
                type="number" 
                className="input w-full" 
                style={{ 
                  backgroundColor: EPHM_DARK.neutral.gray50,
                  borderColor: EPHM_DARK.neutral.gray200,
                  color: EPHM_DARK.neutral.gray800
                }}
                {...register("deces_moins_24h")} 
              />
            </div>
            <div>
              <label className="label" style={{ color: EPHM_DARK.neutral.gray500 }}>Décès &gt; 24h</label>
              <input 
                type="number" 
                className="input w-full" 
                style={{ 
                  backgroundColor: EPHM_DARK.neutral.gray50,
                  borderColor: EPHM_DARK.neutral.gray200,
                  color: EPHM_DARK.neutral.gray800
                }}
                {...register("deces_plus_24h")} 
              />
            </div>
          </div>
        </fieldset>

        <fieldset 
          className="fieldset rounded-xl border p-4"
          style={{ 
            borderColor: EPHM_DARK.neutral.gray200,
            backgroundColor: EPHM_DARK.background.card 
          }}
        >
          <legend className="fieldset-legend" style={{ color: EPHM_DARK.neutral.gray700 }}>
            Finances
          </legend>
          <div className="max-w-xs">
            <label className="label" style={{ color: EPHM_DARK.neutral.gray500 }}>Recettes FANOME (MGA)</label>
            <input 
              type="number" 
              className="input w-full" 
              style={{ 
                backgroundColor: EPHM_DARK.neutral.gray50,
                borderColor: EPHM_DARK.neutral.gray200,
                color: EPHM_DARK.neutral.gray800
              }}
              {...register("recettes_fanome_mga")} 
            />
          </div>
        </fieldset>

        <button 
          type="submit" 
          className="btn w-full text-white"
          style={{
            backgroundColor: EPHM_DARK.primary[600],
            borderColor: EPHM_DARK.primary[600],
          }}
          disabled={mutation.isPending}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = EPHM_DARK.primary[500];
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = EPHM_DARK.primary[600];
          }}
        >
          {mutation.isPending ? <span className="loading loading-spinner loading-sm" /> : "🔮 Estimer le risque et le score IGPH"}
        </button>
      </form>

      {mutation.data && (
        <div 
          className="card border p-6"
          style={{ 
            borderColor: EPHM_DARK.neutral.gray200,
            backgroundColor: EPHM_DARK.background.card 
          }}
        >
          <div className="card-body flex-row flex-wrap items-center justify-around gap-8">
            <Jauge
              valeur={mutation.data.proba_haut_risque * 100}
              label={mutation.data.proba_haut_risque >= 0.5 ? "Haut risque" : "Risque maîtrisé"}
              couleur={mutation.data.proba_haut_risque >= 0.5 ? EPHM_DARK.status.danger : EPHM_DARK.primary[500]}
            />
            <Jauge
              valeur={mutation.data.igph * 100}
              label="Score IGPH estimé"
              couleur={EPHM_DARK.primary[500]}
              afficheValeur={mutation.data.igph.toFixed(3)}
            />
            <div className="flex flex-col items-center gap-2">
              <span
                className="badge badge-lg px-4 py-3 text-sm font-semibold"
                style={{
                  color: COULEURS_CATEGORIES[mutation.data.categorie],
                  backgroundColor: `${COULEURS_CATEGORIES[mutation.data.categorie]}18`,
                  borderColor: COULEURS_CATEGORIES[mutation.data.categorie],
                }}
              >
                {mutation.data.categorie}
              </span>
              <p className="text-sm font-medium" style={{ color: EPHM_DARK.neutral.gray500 }}>
                Catégorie K-Means (cluster {mutation.data.cluster})
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}