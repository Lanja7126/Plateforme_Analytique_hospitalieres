import type { FieldValues, Path, UseFormRegister } from "react-hook-form";

interface Props<T extends FieldValues> {
  label: string;
  name: Path<T>;
  options: string[];
  register: UseFormRegister<T>;
  erreur?: string;
}

/**
 * Rend un <select> si des options existent déjà en base (via /stats/meta),
 * sinon un champ texte libre — utile tant que la base est vide (avant le tout
 * premier import CSV, aucune valeur catégorielle n'est encore connue).
 */
export default function ChampSelectOuTexte<T extends FieldValues>({ label, name, options, register, erreur }: Props<T>) {
  return (
    <div>
      <label className="label">{label}</label>
      {options.length > 0 ? (
        <select className={`select w-full ${erreur ? "select-error" : ""}`} {...register(name)}>
          <option value="">— Choisir —</option>
          {options.map((o) => (
            <option key={o} value={o}>{o}</option>
          ))}
        </select>
      ) : (
        <input type="text" className={`input w-full ${erreur ? "input-error" : ""}`} placeholder={label} {...register(name)} />
      )}
      {erreur && <p className="text-error text-xs mt-1">{erreur}</p>}
    </div>
  );
}
