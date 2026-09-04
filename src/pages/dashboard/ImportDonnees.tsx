import { useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { UploadCloud, FileSpreadsheet, ChevronLeft, ChevronRight, Check } from "lucide-react";
import { schemaRapportComplet, ETAPES_RAPPORT, type FormRapportCompletInput, type FormRapportComplet } from "../../schemas/rapport.schema";
import { getMetaCategorielle } from "../../api/stats.api";
import { importerCSV, creerRapportManuel, type ResultatImportCSV } from "../../api/rapports.api";
import ChampSelectOuTexte from "../../components/ChampSelectOuTexte";

type Mode = "csv" | "manuel";

export default function ImportDonnees() {
  const [mode, setMode] = useState<Mode>("csv");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Import de données</h1>
        <p className="text-base-content/60">
          Ajoute des rapports mensuels par lot (CSV) ou saisis-en un manuellement via le formulaire guidé.
        </p>
      </div>

      <div role="tablist" className="tabs tabs-box w-fit">
        <button role="tab" className={`tab gap-2 ${mode === "csv" ? "tab-active" : ""}`} onClick={() => setMode("csv")}>
          <FileSpreadsheet className="size-4" /> Importer un CSV
        </button>
        <button role="tab" className={`tab gap-2 ${mode === "manuel" ? "tab-active" : ""}`} onClick={() => setMode("manuel")}>
          <UploadCloud className="size-4" /> Saisir manuellement
        </button>
      </div>

      {mode === "csv" ? <ImportCSV /> : <FormulaireProgressif />}
    </div>
  );
}

// ============================================================================
// Mode 1 — import direct d'un fichier CSV
// ============================================================================
function ImportCSV() {
  const queryClient = useQueryClient();
  const inputRef = useRef<HTMLInputElement>(null);
  const [fichier, setFichier] = useState<File | null>(null);
  const [survole, setSurvole] = useState(false);

  const mutation = useMutation({
    mutationFn: importerCSV,
    onSuccess: () => {
      toast.success("Import réussi.");
      queryClient.invalidateQueries({ queryKey: ["kpis"] });
      queryClient.invalidateQueries({ queryKey: ["regions"] });
      queryClient.invalidateQueries({ queryKey: ["etablissements"] });
      queryClient.invalidateQueries({ queryKey: ["meta"] });
    },
    onError: (err: unknown) => {
      const details = (err as { response?: { data?: { message?: string; details?: string[] } } })?.response?.data;
      toast.error(details?.message || "Échec de l'import.");
    },
  });

  function choisirFichier(f: File | undefined) {
    if (!f) return;
    if (!f.name.toLowerCase().endsWith(".csv")) {
      toast.error("Seuls les fichiers .csv sont acceptés.");
      return;
    }
    setFichier(f);
    mutation.reset();
  }

  const erreur = mutation.error as { response?: { data?: { message?: string; details?: string[] } } } | undefined;
  const resultat = mutation.data as ResultatImportCSV | undefined;

  return (
    <div className="max-w-xl space-y-4">
      <div
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setSurvole(true); }}
        onDragLeave={() => setSurvole(false)}
        onDrop={(e) => {
          e.preventDefault();
          setSurvole(false);
          choisirFichier(e.dataTransfer.files?.[0]);
        }}
        className={`flex cursor-pointer flex-col items-center gap-2 rounded-2xl border-2 border-dashed p-10 text-center transition-colors ${
          survole ? "border-primary bg-primary/5" : "border-base-300"
        }`}
      >
        <UploadCloud className="size-8 text-base-content/50" />
        <p className="font-medium">Glisse-dépose ton CSV ici, ou clique pour parcourir</p>
        <p className="text-xs text-base-content/50">Un rapport mensuel par ligne — 20 Mo maximum</p>
        <input
          ref={inputRef}
          type="file"
          accept=".csv"
          className="hidden"
          onChange={(e) => choisirFichier(e.target.files?.[0])}
        />
      </div>

      {fichier && (
        <div className="flex items-center justify-between rounded-xl border border-base-300 p-3">
          <div className="flex items-center gap-2">
            <FileSpreadsheet className="size-5 text-primary" />
            <span className="text-sm">{fichier.name}</span>
            <span className="text-xs text-base-content/50">({(fichier.size / 1024).toFixed(0)} Ko)</span>
          </div>
          <button
            className="btn btn-primary btn-sm"
            disabled={mutation.isPending}
            onClick={() => mutation.mutate(fichier)}
          >
            {mutation.isPending ? <span className="loading loading-spinner loading-xs" /> : "Importer"}
          </button>
        </div>
      )}

      {resultat && (
        <div className="alert alert-success">
          <Check className="size-5" />
          <span>
            {resultat.lignesLues} ligne(s) lue(s) — {resultat.inseres} créée(s), {resultat.misAJour} mise(s) à jour.
          </span>
        </div>
      )}

      {erreur && (
        <div className="alert alert-error flex-col items-start">
          <span className="font-medium">{erreur.response?.data?.message}</span>
          {erreur.response?.data?.details && (
            <ul className="list-disc pl-5 text-sm">
              {erreur.response.data.details.slice(0, 10).map((d, i) => <li key={i}>{d}</li>)}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}

// ============================================================================
// Mode 2 — formulaire progressif (Précédent / Suivant)
// ============================================================================
function FormulaireProgressif() {
  const queryClient = useQueryClient();
  const { data: meta } = useQuery({ queryKey: ["meta"], queryFn: getMetaCategorielle });
  const [etape, setEtape] = useState(0);
  const derniereEtape = etape === ETAPES_RAPPORT.length - 1;

  const {
    register,
    handleSubmit,
    trigger,
    reset,
    formState: { errors },
  } = useForm<FormRapportCompletInput, unknown, FormRapportComplet>({
    resolver: zodResolver(schemaRapportComplet),
    defaultValues: {
      annee: new Date().getFullYear(), mois: new Date().getMonth() + 1,
      cas_mas_admis: 0, cas_paludisme_grave: 0, jours_coupure_electricite: 0,
      poches_sang_disponibles_moy: 0, jours_rupture_stock_vitaux: 0,
      deces_moins_24h: 0, deces_plus_24h: 0,
    },
  });

  const mutation = useMutation({
    mutationFn: creerRapportManuel,
    onSuccess: () => {
      toast.success("Rapport enregistré.");
      queryClient.invalidateQueries({ queryKey: ["kpis"] });
      queryClient.invalidateQueries({ queryKey: ["regions"] });
      queryClient.invalidateQueries({ queryKey: ["etablissements"] });
      reset();
      setEtape(0);
    },
    onError: (err: unknown) => {
      const message = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      toast.error(message || "Échec de l'enregistrement.");
    },
  });

  async function suivant() {
    const champsEtape = ETAPES_RAPPORT[etape].champs;
    const valide = await trigger(champsEtape);
    if (valide) setEtape((e) => Math.min(e + 1, ETAPES_RAPPORT.length - 1));
  }

  function precedent() {
    setEtape((e) => Math.max(e - 1, 0));
  }

  return (
    <div className="max-w-3xl">
      <ul className="steps w-full mb-6">
        {ETAPES_RAPPORT.map((e, i) => (
          <li key={e.titre} className={`step ${i <= etape ? "step-primary" : ""}`}>{e.titre}</li>
        ))}
      </ul>

      <form onSubmit={handleSubmit((d) => mutation.mutate(d))}>
        {etape === 0 && (
          <fieldset className="fieldset rounded-xl border border-base-300 p-4">
            <legend className="fieldset-legend">Identité & contexte</legend>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <div>
                <label className="label">Code hôpital</label>
                <input className={`input w-full ${errors.code_hopital ? "input-error" : ""}`} {...register("code_hopital")} />
                {errors.code_hopital && <p className="text-error text-xs mt-1">{errors.code_hopital.message}</p>}
              </div>
              <div>
                <label className="label">Nom de l'hôpital</label>
                <input className={`input w-full ${errors.nom_hopital ? "input-error" : ""}`} {...register("nom_hopital")} />
                {errors.nom_hopital && <p className="text-error text-xs mt-1">{errors.nom_hopital.message}</p>}
              </div>
              <div>
                <label className="label">District (optionnel)</label>
                <input className="input w-full" {...register("district")} />
              </div>
              <ChampSelectOuTexte label="Type d'établissement" name="type_etablissement" options={meta?.typesEtablissement ?? []} register={register} erreur={errors.type_etablissement?.message} />
              <ChampSelectOuTexte label="Région" name="region" options={meta?.regions ?? []} register={register} erreur={errors.region?.message} />
              <ChampSelectOuTexte label="Zone géographique" name="zone_geographique" options={meta?.zonesGeographiques ?? []} register={register} erreur={errors.zone_geographique?.message} />
              <ChampSelectOuTexte label="Source d'énergie" name="source_energie_principale" options={meta?.sourcesEnergie ?? []} register={register} erreur={errors.source_energie_principale?.message} />
              <div>
                <label className="label">Année</label>
                <input type="number" className="input w-full" {...register("annee")} />
              </div>
              <div>
                <label className="label">Mois</label>
                <input type="number" min={1} max={12} className="input w-full" {...register("mois")} />
              </div>
            </div>
          </fieldset>
        )}

        {etape === 1 && (
          <fieldset className="fieldset rounded-xl border border-base-300 p-4">
            <legend className="fieldset-legend">Capacité & effectifs</legend>
            <div className="grid gap-4 sm:grid-cols-3">
              <div>
                <label className="label">Lits disponibles</label>
                <input type="number" className={`input w-full ${errors.lits_disponibles ? "input-error" : ""}`} {...register("lits_disponibles")} />
                {errors.lits_disponibles && <p className="text-error text-xs mt-1">{errors.lits_disponibles.message}</p>}
              </div>
              <div>
                <label className="label">Médecins (ETP)</label>
                <input type="number" step="0.1" className={`input w-full ${errors.effectif_medecins_etp ? "input-error" : ""}`} {...register("effectif_medecins_etp")} />
                {errors.effectif_medecins_etp && <p className="text-error text-xs mt-1">{errors.effectif_medecins_etp.message}</p>}
              </div>
              <div>
                <label className="label">Paramédicaux (ETP)</label>
                <input type="number" step="0.1" className={`input w-full ${errors.effectif_paramedicaux_etp ? "input-error" : ""}`} {...register("effectif_paramedicaux_etp")} />
                {errors.effectif_paramedicaux_etp && <p className="text-error text-xs mt-1">{errors.effectif_paramedicaux_etp.message}</p>}
              </div>
            </div>
          </fieldset>
        )}

        {etape === 2 && (
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
        )}

        {etape === 3 && (
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
        )}

        {etape === 4 && (
          <fieldset className="fieldset rounded-xl border border-base-300 p-4">
            <legend className="fieldset-legend">Finances & récapitulatif</legend>
            <div className="max-w-xs">
              <label className="label">Recettes FANOME (MGA)</label>
              <input type="number" className={`input w-full ${errors.recettes_fanome_mga ? "input-error" : ""}`} {...register("recettes_fanome_mga")} />
              {errors.recettes_fanome_mga && <p className="text-error text-xs mt-1">{errors.recettes_fanome_mga.message}</p>}
            </div>
            <p className="mt-3 text-sm text-base-content/60">
              Les variables dérivées (TOM, DMS, taux de mortalité, IGPH...) sont calculées automatiquement
              côté serveur à l'enregistrement.
            </p>
          </fieldset>
        )}

        <div className="mt-6 flex justify-between">
          <button type="button" className="btn btn-ghost" onClick={precedent} disabled={etape === 0}>
            <ChevronLeft className="size-4" /> Précédent
          </button>

          {derniereEtape ? (
            <button type="submit" className="btn btn-primary" disabled={mutation.isPending}>
              {mutation.isPending ? <span className="loading loading-spinner loading-sm" /> : <><Check className="size-4" /> Enregistrer le rapport</>}
            </button>
          ) : (
            <button type="button" className="btn btn-primary" onClick={suivant}>
              Suivant <ChevronRight className="size-4" />
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
