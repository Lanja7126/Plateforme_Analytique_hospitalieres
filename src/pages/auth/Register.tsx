import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { schemaInscription, type FormInscription } from "../../schemas/auth.schema";
import { useAuthStore } from "../../store/authStore";

export default function Register() {
  const navigate = useNavigate();
  const inscrire = useAuthStore((s) => s.inscrire);
  const chargement = useAuthStore((s) => s.chargement);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormInscription>({ resolver: zodResolver(schemaInscription) });

  async function onSubmit(donnees: FormInscription) {
    try {
      await inscrire(donnees);
      navigate("/dashboard", { replace: true });
    } catch (err) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        "Impossible de créer le compte.";
      toast.error(message);
    }
  }

  return (
    <div className="hero bg-base-200 min-h-screen">
      <div className="hero-content flex-col lg:flex-row-reverse">
        <div className="text-center lg:text-left">
          <h1 className="text-5xl font-bold">Créer un compte</h1>
          <p className="py-6">
            Accès réservé au personnel autorisé à consulter et analyser les performances
            hospitalières régionales.
          </p>
        </div>
        <div className="card bg-base-100 w-full max-w-sm shrink-0 shadow-2xl">
          <div className="card-body">
            <form onSubmit={handleSubmit(onSubmit)} noValidate>
              <fieldset className="fieldset">
                <label className="label">Nom complet</label>
                <input
                  type="text"
                  className={`input w-full ${errors.nom ? "input-error" : ""}`}
                  placeholder="Nom complet"
                  {...register("nom")}
                />
                {errors.nom && <p className="text-error text-xs mt-1">{errors.nom.message}</p>}

                <label className="label mt-2">Email</label>
                <input
                  type="email"
                  className={`input w-full ${errors.email ? "input-error" : ""}`}
                  placeholder="Email"
                  {...register("email")}
                />
                {errors.email && <p className="text-error text-xs mt-1">{errors.email.message}</p>}

                <label className="label mt-2">Mot de passe</label>
                <input
                  type="password"
                  className={`input w-full ${errors.motDePasse ? "input-error" : ""}`}
                  placeholder="8 caractères minimum"
                  {...register("motDePasse")}
                />
                {errors.motDePasse && <p className="text-error text-xs mt-1">{errors.motDePasse.message}</p>}

                <button type="submit" className="btn btn-neutral mt-4" disabled={chargement}>
                  {chargement ? <span className="loading loading-spinner loading-sm" /> : "Créer mon compte"}
                </button>
              </fieldset>
            </form>
            <p className="text-center text-sm mt-2">
              Déjà un compte ? <Link to="/login" className="link link-hover font-medium">Se connecter</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
