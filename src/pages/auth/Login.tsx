import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useLocation, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { schemaConnexion, type FormConnexion } from "../../schemas/auth.schema";
import { useAuthStore } from "../../store/authStore";

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const connecter = useAuthStore((s) => s.connecter);
  const chargement = useAuthStore((s) => s.chargement);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormConnexion>({ resolver: zodResolver(schemaConnexion) });

  async function onSubmit(donnees: FormConnexion) {
    try {
      await connecter(donnees);
      const destination = (location.state as { from?: Location })?.from?.pathname || "/dashboard";
      navigate(destination, { replace: true });
    } catch {
      toast.error("Email ou mot de passe incorrect.");
    }
  }

  return (
    <div className="hero bg-base-200 min-h-screen">
      <div className="hero-content flex-col lg:flex-row-reverse">
        <div className="text-center lg:text-left">
          <h1 className="text-5xl font-bold">Bienvenue !</h1>
          <p className="py-6">
            Plateforme analytique des performances hospitalières régionales de Madagascar —
            connecte-toi pour accéder au tableau de bord.
          </p>
        </div>
        <div className="card bg-base-100 w-full max-w-sm shrink-0 shadow-2xl">
          <div className="card-body">
            <form onSubmit={handleSubmit(onSubmit)} noValidate>
              <fieldset className="fieldset">
                <label className="label">Email</label>
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
                  placeholder="Mot de passe"
                  {...register("motDePasse")}
                />
                {errors.motDePasse && <p className="text-error text-xs mt-1">{errors.motDePasse.message}</p>}

                <button type="submit" className="btn btn-neutral mt-4" disabled={chargement}>
                  {chargement ? <span className="loading loading-spinner loading-sm" /> : "Se connecter"}
                </button>
              </fieldset>
            </form>
            <p className="text-center text-sm mt-2">
              Pas encore de compte ? <Link to="/inscription" className="link link-hover font-medium">S'inscrire</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
