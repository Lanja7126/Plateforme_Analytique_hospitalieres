interface Props {
  valeur: number; // 0-100
  label: string;
  couleur: string;
  afficheValeur?: string;
}

export default function Jauge({ valeur, label, couleur, afficheValeur }: Props) {
  return (
    <div className="flex flex-col items-center gap-2">
      <div
        className="radial-progress"
        style={{ "--value": valeur, "--size": "9rem", "--thickness": "0.9rem", color: couleur } as React.CSSProperties}
        role="progressbar"
        aria-valuenow={valeur}
      >
        <span className="text-lg font-semibold" style={{ color: "var(--color-base-content)" }}>
          {afficheValeur ?? `${valeur.toFixed(0)}%`}
        </span>
      </div>
      <p className="text-sm font-medium">{label}</p>
    </div>
  );
}
