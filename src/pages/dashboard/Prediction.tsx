import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { schemaRapportBrut, type FormRapportBrutInput, type FormRapportBrut } from "../../schemas/rapport.schema";
import { getMetaCategorielle } from "../../api/stats.api";
import { predire } from "../../api/predictions.api";
import ChampSelectOuTexte from "../../components/ChampSelectOuTexte";
import Jauge from "../../components/Jauge";

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
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Prédiction de risque</h1>
        <p className="text-base-content/60">
          Simule un rapport mensuel et estime le risque et le score IGPH via les modèles RandomForest.
        </p>
      </div>

      <form onSubmit={handleSubmit((d) => mutation.mutate(d))} className="space-y-6">
        <fieldset className="fieldset rounded-xl border border-base-300 p-4">
          <legend className="fieldset-legend">Contexte</legend>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div>
              <label className="label">Année</label>
              <input type="number" className="input w-full" {...register("annee")} />
            </div>
            <div>
              <label className="label">Mois</label>
              <input type="number" min={1} max={12} className="input w-full" {...register("mois")} />
            </div>
            <ChampSelectOuTexte label="Type d'établissement" name="type_etablissement" options={meta?.typesEtablissement ?? []} register={register} erreur={errors.type_etablissement?.message} />
            <ChampSelectOuTexte label="Région" name="region" options={meta?.regions ?? []} register={register} erreur={errors.region?.message} />
            <ChampSelectOuTexte label="Zone géographique" name="zone_geographique" options={meta?.zonesGeographiques ?? []} register={register} erreur={errors.zone_geographique?.message} />
            <ChampSelectOuTexte label="Source d'énergie" name="source_energie_principale" options={meta?.sourcesEnergie ?? []} register={register} erreur={errors.source_energie_principale?.message} />
          </div>
        </fieldset>

        <fieldset className="fieldset rounded-xl border border-base-300 p-4">
          <legend className="fieldset-legend">Capacité & effectifs</legend>
          <div className="grid gap-4 sm:grid-cols-3">
            <div><label className="label">Lits disponibles</label><input type="number" className="input w-full" {...register("lits_disponibles")} /></div>
            <div><label className="label">Médecins (ETP)</label><input type="number" step="0.1" className="input w-full" {...register("effectif_medecins_etp")} /></div>
            <div><label className="label">Paramédicaux (ETP)</label><input type="number" step="0.1" className="input w-full" {...register("effectif_paramedicaux_etp")} /></div>
          </div>
        </fieldset>

        <fieldset className="fieldset rounded-xl border border-base-300 p-4">
          <legend className="fieldset-legend">Activité du mois</legend>
          <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-4">
            <div><label className="label">Admissions totales</label><input type="number" className="input w-full" {...register("admissions_totales")} /></div>
            <div><label className="label">Journées d'hospitalisation</label><input type="number" className="input w-full" {...register("journees_hospitalisation")} /></div>
            <div><label className="label">Consultations externes</label><input type="number" className="input w-full" {...register("consultations_externes")} /></div>
            <div><label className="label">Passages aux urgences</label><input type="number" className="input w-full" {...register("passages_urgences")} /></div>
            <div><label className="label">Actes chirurgicaux</label><input type="number" className="input w-full" {...register("actes_chirurgicaux")} /></div>
            <div><label className="label">Accouchements totaux</label><input type="number" className="input w-full" {...register("accouchements_totaux")} /></div>
            <div><label className="label">Césariennes</label><input type="number" className="input w-full" {...register("cesariennes")} /></div>
          </div>
        </fieldset>

        <fieldset className="fieldset rounded-xl border border-base-300 p-4">
          <legend className="fieldset-legend">Épidémiologie & logistique</legend>
          <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-4">
            <div><label className="label">Cas MAS admis</label><input type="number" className="input w-full" {...register("cas_mas_admis")} /></div>
            <div><label className="label">Paludisme grave</label><input type="number" className="input w-full" {...register("cas_paludisme_grave")} /></div>
            <div><label className="label">Jours coupure électricité</label><input type="number" min={0} max={31} className="input w-full" {...register("jours_coupure_electricite")} /></div>
            <div><label className="label">Poches de sang (moy.)</label><input type="number" className="input w-full" {...register("poches_sang_disponibles_moy")} /></div>
            <div><label className="label">Jours rupture stock vitaux</label><input type="number" min={0} max={31} className="input w-full" {...register("jours_rupture_stock_vitaux")} /></div>
            <div><label className="label">Décès &lt; 24h</label><input type="number" className="input w-full" {...register("deces_moins_24h")} /></div>
            <div><label className="label">Décès &gt; 24h</label><input type="number" className="input w-full" {...register("deces_plus_24h")} /></div>
          </div>
        </fieldset>

        <fieldset className="fieldset rounded-xl border border-base-300 p-4">
          <legend className="fieldset-legend">Finances</legend>
          <div className="max-w-xs">
            <label className="label">Recettes FANOME (MGA)</label>
            <input type="number" className="input w-full" {...register("recettes_fanome_mga")} />
          </div>
        </fieldset>

        <button type="submit" className="btn btn-neutral w-full" disabled={mutation.isPending}>
          {mutation.isPending ? <span className="loading loading-spinner loading-sm" /> : "🔮 Estimer le risque et le score IGPH"}
        </button>
      </form>

      {mutation.data && (
        <div className="card border border-base-300 bg-base-100">
          <div className="card-body flex-row flex-wrap justify-around gap-8">
            <Jauge
              valeur={mutation.data.proba_haut_risque * 100}
              label={mutation.data.proba_haut_risque >= 0.5 ? "Haut risque" : "Risque maîtrisé"}
              couleur={mutation.data.proba_haut_risque >= 0.5 ? "#DC2626" : "#0F766E"}
            />
            <Jauge
              valeur={mutation.data.igph * 100}
              label="Score IGPH estimé"
              couleur="#0F766E"
              afficheValeur={mutation.data.igph.toFixed(3)}
            />
          </div>
        </div>
      )}
    </div>
  );
}
