// Journaux d'activité & tentatives de connexion.
import React, { useState } from "react";
import { Activity, KeyRound, Search } from "lucide-react";
import AdminLayout from "../components/AdminLayout";
import AdminPage from "../components/AdminPage";
import {
  AdminBadge,
  AdminEmptyState,
  AdminLoading,
  AdminTable,
  AdminTabs,
  AdminToast,
} from "../components/AdminUI";
import { useAsyncData } from "../hooks/useAsyncData";
import { adminService } from "../services/adminService";
import { formatDateTime } from "../utils/format";

const NIVEAU_TONES = { info: "blue", warning: "yellow", error: "red" };
const NIVEAU_LABELS = { info: "Info", warning: "Attention", error: "Erreur" };

const JournauxPage = () => {
  const [onglet, setOnglet] = useState("activite");
  const [recherche, setRecherche] = useState("");
  const [filtreNiveau, setFiltreNiveau] = useState("");
  const [filtreResultat, setFiltreResultat] = useState("");
  const [toast, setToast] = useState("");

  const { data: activite, loading: chargementActivite } = useAsyncData(
    () => adminService.getActivityLogs({ recherche, niveau: filtreNiveau }),
    [recherche, filtreNiveau]
  );

  const { data: tentatives, loading: chargementConnexions } = useAsyncData(
    () => adminService.getLoginAttempts({ recherche, resultat: filtreResultat }),
    [recherche, filtreResultat]
  );

  const exporter = (lignes, nomFichier) => {
    if (!lignes?.length) {
      setToast("Aucune donnée à exporter.");
      return;
    }
    const colonnes = Object.keys(lignes[0]);
    const echapper = (v) => `"${String(v ?? "").replace(/"/g, '""')}"`;
    const csv = [colonnes.map(echapper).join(";"), ...lignes.map((l) => colonnes.map((c) => echapper(l[c])).join(";"))].join("\n");
    const blob = new Blob(["\ufeff" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = nomFichier;
    a.click();
    URL.revokeObjectURL(url);
    setToast(`${lignes.length} ligne(s) exportée(s).`);
  };

  return (
    <AdminLayout>
      <AdminPage
        title="Journaux d'activité & tentatives de connexion"
        description="Consulter les journaux d'activité de la plateforme et l'historique des tentatives de connexion."
        actions={
          <AdminButtonExport onClick={() => exporter(onglet === "activite" ? activite : tentatives, onglet === "activite" ? "journal-activite.csv" : "tentatives-connexion.csv")} />
        }
      >
        {toast && <AdminToast message={toast} onClose={() => setToast("")} />}

        <AdminTabs
          active={onglet}
          onChange={setOnglet}
          tabs={[
            { id: "activite", label: "Journal d'activité" },
            { id: "connexions", label: "Tentatives de connexion" },
          ]}
        />

        <div className="mb-5 flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
            <input
              value={recherche}
              onChange={(e) => setRecherche(e.target.value)}
              placeholder={onglet === "activite" ? "Rechercher une action, un utilisateur..." : "Rechercher un e-mail ou une IP..."}
              className="w-full rounded-lg border border-slate-600 bg-slate-800 py-2 pl-9 pr-3 text-sm text-slate-100 placeholder-slate-500 focus:border-emerald-500 focus:outline-none"
            />
          </div>
          {onglet === "activite" ? (
            <select
              value={filtreNiveau}
              onChange={(e) => setFiltreNiveau(e.target.value)}
              className="rounded-lg border border-slate-600 bg-slate-800 px-3 py-2 text-sm text-slate-100"
            >
              <option value="">Tous les niveaux</option>
              <option value="info">Info</option>
              <option value="warning">Attention</option>
              <option value="error">Erreur</option>
            </select>
          ) : (
            <select
              value={filtreResultat}
              onChange={(e) => setFiltreResultat(e.target.value)}
              className="rounded-lg border border-slate-600 bg-slate-800 px-3 py-2 text-sm text-slate-100"
            >
              <option value="">Tous les résultats</option>
              <option value="succes">Succès</option>
              <option value="echec">Échec</option>
            </select>
          )}
        </div>

        {onglet === "activite" ? (
          chargementActivite ? (
            <AdminLoading message="Chargement du journal..." />
          ) : !activite?.length ? (
            <AdminEmptyState icon={Activity} title="Aucune activité" description="Aucune entrée ne correspond aux filtres." />
          ) : (
            <AdminTable headers={["ID", "Date", "Utilisateur", "Action", "Cible", "Niveau"]}>
              {activite.map((l) => (
                <tr key={l.id} className="hover:bg-slate-800/40">
                  <td className="px-4 py-3 text-sm text-slate-400">{l.id}</td>
                  <td className="px-4 py-3 text-sm text-slate-300">{formatDateTime(l.date)}</td>
                  <td className="px-4 py-3 text-sm text-slate-300">{l.utilisateur}</td>
                  <td className="px-4 py-3 text-sm text-slate-200">{l.action}</td>
                  <td className="px-4 py-3 text-xs text-slate-500">{l.cible}</td>
                  <td className="px-4 py-3">
                    <AdminBadge tone={NIVEAU_TONES[l.niveau] || "slate"}>
                      {NIVEAU_LABELS[l.niveau] || l.niveau}
                    </AdminBadge>
                  </td>
                </tr>
              ))}
            </AdminTable>
          )
        ) : chargementConnexions ? (
          <AdminLoading message="Chargement des tentatives..." />
        ) : !tentatives?.length ? (
          <AdminEmptyState icon={KeyRound} title="Aucune tentative" description="Aucune tentative ne correspond aux filtres." />
        ) : (
          <AdminTable headers={["ID", "Date", "E-mail", "Adresse IP", "Résultat", "Détail"]}>
            {tentatives.map((t) => (
              <tr key={t.id} className="hover:bg-slate-800/40">
                <td className="px-4 py-3 text-sm text-slate-400">{t.id}</td>
                <td className="px-4 py-3 text-sm text-slate-300">{formatDateTime(t.date)}</td>
                <td className="px-4 py-3 text-sm text-slate-300">{t.email}</td>
                <td className="px-4 py-3 text-sm text-slate-400">{t.ip}</td>
                <td className="px-4 py-3">
                  <AdminBadge tone={t.resultat === "succes" ? "green" : "red"}>
                    {t.resultat === "succes" ? "Succès" : "Échec"}
                  </AdminBadge>
                </td>
                <td className="px-4 py-3 text-sm text-slate-400">{t.detail}</td>
              </tr>
            ))}
          </AdminTable>
        )}
      </AdminPage>
    </AdminLayout>
  );
};

// Petit bouton d'export local (évite une boucle d'imports dans le JSX ci-dessus).
const AdminButtonExport = ({ onClick }) => (
  <button
    onClick={onClick}
    className="inline-flex items-center gap-2 rounded-lg border border-slate-600 bg-slate-800 px-3.5 py-2 text-sm font-medium text-slate-200 transition-colors hover:bg-slate-700"
  >
    Exporter CSV
  </button>
);

export default JournauxPage;
