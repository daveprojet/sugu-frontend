import { NavLink, useLocation } from "react-router-dom";
import { Building2, Inbox, Plus, Search, User, Users, Wallet } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useDemandes } from "@/hooks/useDemandes";
import { useMissions } from "@/hooks/useEntreprises";
import { useCommissions } from "@/hooks/usePaiements";

// Menu propre à chaque rôle : les pages de travail de l'utilisateur, avec un compteur
// sur ce qui attend une action. Utilisé par la barre du haut (ordinateur) et par la
// barre d'onglets en bas de l'écran (téléphone).

const nombre = (liste, test) => liste.filter(test).length;

/** Compteurs de l'artisan (requêtes partagées avec son tableau de bord). */
function useCompteursArtisan(user) {
  const artisan = user?.role === "artisan";
  const independant = artisan && user.independant !== false;
  const { data: demandes = [] } = useDemandes(
    { artisan: user?.artisan_uid },
    { enabled: independant && !!user?.artisan_uid },
  );
  const { data: missions = [] } = useMissions("en_cours", { enabled: artisan && !!user?.partenaire });
  const { data: commissionsPage } = useCommissions({ enabled: independant });
  const commissions = commissionsPage?.results || [];
  return {
    demandes: nombre(demandes, (d) => d.statut === "EN_ATTENTE"),
    missions: nombre(missions, (m) => m.statut === "PROPOSEE"),
    commissions: nombre(commissions, (c) => c.statut === "EN_ATTENTE" || c.statut === "EN_RETARD"),
  };
}

/** Liens du rôle connecté : [{ to, label, court, Icon, compteur, exact }]. */
export function useLiensRole() {
  const { user } = useAuth();
  const compteurs = useCompteursArtisan(user);
  if (!user) return [];
  const profil = { to: "/mon-profil", label: "Mon profil", court: "Profil", Icon: User };

  if (user.role === "artisan") {
    const missions = {
      to: "/dashboard-artisan/missions-entreprises", label: "Missions entreprises", court: "Missions",
      Icon: Building2, compteur: compteurs.missions,
    };
    // Uniquement partenaire : il ne travaille que pour les entreprises.
    if (user.independant === false) return [missions, profil];
    return [
      { to: "/dashboard-artisan", label: "Mes demandes", court: "Demandes", Icon: Inbox, compteur: compteurs.demandes, exact: true },
      ...(user.partenaire ? [missions] : []),
      { to: "/dashboard-artisan/commissions", label: "Commissions", court: "Commissions", Icon: Wallet, compteur: compteurs.commissions },
      profil,
    ];
  }
  if (user.role === "entreprise") {
    return [
      { to: "/espace-entreprise", label: "Nos demandes", court: "Demandes", Icon: Inbox, exact: true },
      { to: "/espace-entreprise/nouvelle-demande", label: "Nouvelle demande", court: "Nouvelle", Icon: Plus },
      { to: "/espace-entreprise/equipe", label: "Équipe", court: "Équipe", Icon: Users },
      profil,
    ];
  }
  return [
    { to: "/artisans", label: "Trouver un artisan", court: "Trouver", Icon: Search },
    { to: "/dashboard-client", label: "Mes demandes", court: "Demandes", Icon: Inbox },
    profil,
  ];
}

function Compteur({ valeur, className = "" }) {
  if (!valeur) return null;
  return (
    <span className={`min-w-[18px] h-[18px] px-1 rounded-full bg-red-500 text-white text-[10px] font-bold leading-[18px] text-center ${className}`}>
      {valeur > 9 ? "9+" : valeur}
    </span>
  );
}

/** Liens du rôle dans la barre du haut, sur ordinateur. */
export function LiensRoleBureau({ liens }) {
  return liens.filter((l) => l.to !== "/mon-profil").map(({ to, label, compteur, exact }) => (
    <NavLink
      key={to} to={to} end={exact}
      className={({ isActive }) => `inline-flex items-center gap-1.5 font-medium transition-colors duration-200 ${
        isActive ? "text-indigo-600" : "text-gray-600 hover:text-indigo-600"
      }`}
    >
      {label}
      <Compteur valeur={compteur} />
    </NavLink>
  ));
}

// Pages qui ont déjà leur propre barre d'actions en bas de l'écran.
const PAGES_SANS_ONGLETS = [/^\/dashboard-artisan\/missions-entreprises\/[^/]+$/];

export function avecBarreOnglets(user, pathname) {
  return !!user && !PAGES_SANS_ONGLETS.some((motif) => motif.test(pathname));
}

/** Barre d'onglets fixée en bas de l'écran, sur téléphone. */
export function BarreOnglets() {
  const { user } = useAuth();
  const { pathname } = useLocation();
  const liens = useLiensRole();
  if (!avecBarreOnglets(user, pathname) || !liens.length) return null;
  return (
    <nav
      aria-label="Navigation principale"
      className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur border-t border-gray-200 pb-[env(safe-area-inset-bottom)]"
    >
      <ul className="flex">
        {liens.map(({ to, court, Icon, compteur, exact }) => (
          <li key={to} className="flex-1">
            <NavLink
              to={to} end={exact}
              className={({ isActive }) => `flex flex-col items-center justify-center gap-0.5 h-16 text-[11px] font-semibold transition-colors ${
                isActive ? "text-indigo-600" : "text-gray-500"
              }`}
            >
              <span className="relative">
                <Icon className="w-6 h-6" />
                <Compteur valeur={compteur} className="absolute -top-1.5 -right-2.5" />
              </span>
              {court}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}
