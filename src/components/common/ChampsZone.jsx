import { useZones } from "@/hooks/useZones";

/**
 * Choix de la ville puis du quartier dans le référentiel. Si le quartier n'est pas dans la
 * liste, la position placée sur la carte suffit : l'équipe rattache ensuite l'artisan.
 */
export default function ChampsZone({
  zoneVille,
  zoneQuartier,
  onChange,
  labelClass,
  champClass,
}) {
  const { data: villes = [] } = useZones();
  const ville = villes.find((v) => v.id === zoneVille);

  const choisirVille = (e) => {
    onChange({ zone_ville: e.target.value ? Number(e.target.value) : null, zone_quartier: null });
  };
  const choisirQuartier = (e) => {
    onChange({ zone_ville: zoneVille, zone_quartier: e.target.value ? Number(e.target.value) : null });
  };

  return (
    <>
      <div>
        <label className={labelClass}>Ville</label>
        <select value={zoneVille || ""} onChange={choisirVille} className={champClass}>
          <option value="">Choisir une ville</option>
          {villes.map((v) => (
            <option key={v.id} value={v.id}>{v.nom}</option>
          ))}
        </select>
      </div>
      <div>
        <label className={labelClass}>Quartier</label>
        <select value={zoneQuartier || ""} onChange={choisirQuartier} disabled={!ville} className={champClass}>
          <option value="">{ville ? "Mon quartier n'est pas dans la liste" : "Choisissez d'abord une ville"}</option>
          {ville?.quartiers.map((q) => (
            <option key={q.id} value={q.id}>{q.nom}</option>
          ))}
        </select>
      </div>
    </>
  );
}
