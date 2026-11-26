import { Zap, Clock, CalendarDays } from "lucide-react";

// Créneaux proposés : de 7h à 21h, toutes les 30 minutes.
const PREMIERE_HEURE = 7;
const DERNIERE_HEURE = 21;
// Pour « aujourd'hui », on laisse à l'artisan au moins ce délai.
const DELAI_MIN_MINUTES = 30;
// Même limite que le serveur pour « un autre jour ».
const JOURS_MAX = 60;

// L'intervention a lieu au Sénégal : jours et heures sont ceux de Dakar (UTC+0, sans heure
// d'été), quel que soit le fuseau de l'appareil du client. On lit donc l'heure en UTC.
const deuxChiffres = (n) => String(n).padStart(2, "0");
const jourDakar = (d) => d.toISOString().slice(0, 10);
const plusJours = (n) => new Date(Date.now() + n * 24 * 60 * 60 * 1000);

function creneaux() {
  const liste = [];
  for (let h = PREMIERE_HEURE; h <= DERNIERE_HEURE; h += 1) {
    liste.push(`${deuxChiffres(h)}:00`);
    if (h < DERNIERE_HEURE) liste.push(`${deuxChiffres(h)}:30`);
  }
  return liste;
}

function creneauxRestantsAujourdhui() {
  const limite = new Date(Date.now() + DELAI_MIN_MINUTES * 60 * 1000);
  const minutesLimite = jourDakar(limite) === jourDakar(new Date()) ? limite.getUTCHours() * 60 + limite.getUTCMinutes() : 24 * 60;
  return creneaux().filter((c) => {
    const [h, m] = c.split(":").map(Number);
    return h * 60 + m >= minutesLimite;
  });
}

const libelleHeure = (c) => c.replace(":", "h");

export const MOMENT_INITIAL = { moment: "DES_QUE_POSSIBLE", jour: "", heure: "" };

/** Champs à envoyer à l'API ; `erreur` si le choix est incomplet. */
export function momentPourApi({ moment, jour, heure }) {
  if (moment === "DES_QUE_POSSIBLE") return { moment_souhaite: moment };
  const date = moment === "AUJOURDHUI" ? jourDakar(new Date()) : jour;
  if (!date) return { erreur: "Choisissez le jour de l’intervention." };
  if (!heure) return { erreur: "Choisissez l’heure de l’intervention." };
  return { moment_souhaite: moment, date_souhaitee: `${date}T${heure}:00+00:00` };
}

/** « Quand souhaitez-vous l'intervention ? » : dès que possible, aujourd'hui ou un autre jour. */
export default function ChoixMoment({ valeur, onChange }) {
  const restants = creneauxRestantsAujourdhui();
  const tropTard = restants.length === 0;
  const options = [
    { cle: "DES_QUE_POSSIBLE", titre: "Dès que possible", icon: Zap },
    { cle: "AUJOURDHUI", titre: "Aujourd’hui", icon: Clock, desactive: tropTard },
    { cle: "AUTRE_JOUR", titre: "Un autre jour", icon: CalendarDays },
  ];
  const choisir = (moment) => onChange({ ...valeur, moment, heure: "" });
  const champ =
    "w-full px-4 py-3 bg-canvas-soft border border-line rounded-lg text-ink text-sm focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-colors duration-150";

  return (
    <fieldset>
      <legend className="block text-xs font-semibold text-muted mb-1.5">Quand souhaitez-vous l’intervention ?</legend>
      <div className="grid grid-cols-3 gap-2">
        {options.map(({ cle, titre, icon: Icon, desactive }) => {
          const actif = valeur.moment === cle;
          return (
            <label
              key={cle}
              className={`flex flex-col items-center justify-center gap-1.5 rounded-lg border px-2 py-3 text-center transition-colors duration-150 ${
                desactive
                  ? "cursor-not-allowed border-line bg-canvas-soft opacity-50"
                  : actif
                    ? "cursor-pointer border-indigo-500 bg-indigo-50"
                    : "cursor-pointer border-line bg-canvas-soft hover:border-indigo-300"
              }`}
            >
              <input
                type="radio"
                name="moment_souhaite"
                value={cle}
                checked={actif}
                disabled={desactive}
                onChange={() => choisir(cle)}
                className="sr-only"
              />
              <Icon className={`w-5 h-5 ${actif ? "text-indigo-600" : "text-muted"}`} aria-hidden="true" />
              <span className={`text-xs sm:text-sm font-bold leading-tight ${actif ? "text-indigo-700" : "text-ink"}`}>{titre}</span>
            </label>
          );
        })}
      </div>
      {tropTard && (
        <p className="mt-1.5 text-xs text-muted">Il est trop tard pour une intervention aujourd’hui : choisissez un autre jour.</p>
      )}

      {valeur.moment === "AUJOURDHUI" && (
        <div className="mt-3">
          <label htmlFor="heure-aujourdhui" className="block text-xs font-semibold text-muted mb-1.5">À quelle heure ?</label>
          <select
            id="heure-aujourdhui"
            value={valeur.heure}
            onChange={(e) => onChange({ ...valeur, heure: e.target.value })}
            required
            className={champ}
          >
            <option value="">Choisir l’heure</option>
            {restants.map((c) => <option key={c} value={c}>{libelleHeure(c)}</option>)}
          </select>
        </div>
      )}

      {valeur.moment === "AUTRE_JOUR" && (
        <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label htmlFor="jour-intervention" className="block text-xs font-semibold text-muted mb-1.5">Quel jour ?</label>
            <input
              id="jour-intervention"
              type="date"
              value={valeur.jour}
              min={jourDakar(plusJours(1))}
              max={jourDakar(plusJours(JOURS_MAX))}
              onChange={(e) => onChange({ ...valeur, jour: e.target.value })}
              required
              className={champ}
            />
          </div>
          <div>
            <label htmlFor="heure-intervention" className="block text-xs font-semibold text-muted mb-1.5">À quelle heure ?</label>
            <select
              id="heure-intervention"
              value={valeur.heure}
              onChange={(e) => onChange({ ...valeur, heure: e.target.value })}
              required
              className={champ}
            >
              <option value="">Choisir l’heure</option>
              {creneaux().map((c) => <option key={c} value={c}>{libelleHeure(c)}</option>)}
            </select>
          </div>
        </div>
      )}
    </fieldset>
  );
}
