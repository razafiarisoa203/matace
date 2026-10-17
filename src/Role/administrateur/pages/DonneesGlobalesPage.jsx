// Accès à toutes les données & tableaux de bord.
import React, { useState } from "react";
import { Globe, Search } from "lucide-react";
import AdminLayout from "../components/AdminLayout";
import AdminPage from "../components/AdminPage";
import {
  AdminBadge,
  AdminButton,
  AdminEmptyState,
  AdminLoading,
  AdminTable,
  AdminTabs,
  AdminToast,
  AdminStatCard,
} from "../components/AdminUI";
import { useAsyncData } from "../hooks/useAsyncData";
import { adminService } from "../services/adminService";
import { versCsv, telechargerContenu } from "../utils/format";

const DonneesGlobalesPage = () => {
  const [onglet, setOnglet] = useState("dashboards");
  const [ressource, setRessource] = useState("infrastructures");
  const [recherche, setRecherche] = useState("");
  const [toast, setToast] = useState(null);

  const { data: dashboards, loading: lD } = useAsyncData(() => adminService.getAllDashboards(), [onglet]);
  const { data: ressourcesList } = useAsyncData(() => adminService.listGlobalResources(), []);
  const { data: donnees, loading: lData } = useAsyncData(
    () => adminService.getGlobalData(ressource),
    [onglet, ressource]
  );

  const filtreData = donnees?.filter((d) =>
    !recherche
      ? true
      : Object.values(d).some((v) => String(v || "").toLowerCase().includes(recherche.toLowerCase()))
  );

  const exporterDonnees = () => {
    if (!filtreData?.length) {
      setToast({ message: "Aucune donnée à exporter.", tone: "error" });
      return;
    }
    telechargerContenu(versCsv(filtreData), `donnees-${ressource}.csv`);
    setToast({ message: `${filtreData.length} ligne(s) exportée(s).`, tone: "success" });
  };

  return (
    <AdminLayout>
      <AdminPage
        title="Accès à toutes les données & tableaux de bord"
        description="Accéder à toutes les données et à tous les tableaux de bord de la plateforme."
        actions={
          onglet === "donnees" && (
            <AdminButton variant="secondary" onClick={exporterDonnees}>
              Exporter CSV
            </AdminButton>
          )
        }
      >
        {toast && <AdminToast message={toast.message} tone={toast.tone} onClose={() => setToast(null)} />}

        <AdminTabs
          active={onglet}
          onChange={setOnglet}
          tabs={[
            { id: "dashboards", label: "Tableaux de bord globaux" },
            { id: "donnees", label: "Accès global aux données" },
          ]}
        />

        {onglet === "dashboards" ? (
          lD ? (
            <AdminLoading message="Chargement des tableaux de bord..." />
          ) : !dashboards?.length ? (
            <AdminEmptyState icon={Globe} title="Aucun tableau de bord" />
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {dashboards.map((db) => (
                <div key={db.id} className="rounded-lg border border-slate-700/60 bg-slate-800/40 p-5">
                  <div className="mb-2 flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-white capitalize">{db.nom}</h3>
                    <AdminBadge tone="blue">{db.id}</AdminBadge>
                  </div>
                  <p className="mb-4 text-sm text-slate-400">{db.description}</p>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {db.indicateurs.map((i, idx) => (
                      <AdminStatCard key={idx} label={i.label} value={i.valeur} />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )
        ) : (
          <>
            <div className="mb-5 flex flex-col gap-3 sm:flex-row">
              <select
                value={ressource}
                onChange={(e) => setRessource(e.target.value)}
                className="rounded-lg border border-slate-600 bg-slate-800 px-3 py-2 text-sm text-slate-100"
              >
                {ressourcesList?.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                <input
                  value={recherche}
                  onChange={(e) => setRecherche(e.target.value)}
                  placeholder="Rechercher dans la ressource sélectionnée..."
                  className="w-full rounded-lg border border-slate-600 bg-slate-800 py-2 pl-9 pr-3 text-sm text-slate-100 placeholder-slate-500"
                />
              </div>
            </div>
            {lData ? (
              <AdminLoading message="Chargement des données..." />
            ) : !filtreData?.length ? (
              <AdminEmptyState icon={Globe} title="Aucune donnée" />
            ) : (
              <AdminTable headers={Object.keys(filtreData[0])}>
                {filtreData.map((d, idx) => (
                  <tr key={d.id || idx} className="hover:bg-slate-800/40">
                    {Object.keys(filtreData[0]).map((k) => (
                      <td key={k} className="max-w-xs truncate px-4 py-3 text-sm text-slate-300">
                        {String(d[k] ?? "—")}
                      </td>
                    ))}
                  </tr>
                ))}
              </AdminTable>
            )}
            <p className="mt-3 text-xs text-slate-500">
              Vue globale de toutes les données de la plateforme (lecture seule, à des fins de supervision).
            </p>
          </>
        )}
      </AdminPage>
    </AdminLayout>
  );
};

export default DonneesGlobalesPage;
