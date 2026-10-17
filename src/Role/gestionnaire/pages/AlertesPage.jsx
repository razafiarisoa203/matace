// Consultation des alertes et notifications du gestionnaire.
import React, { useMemo, useState } from "react";
import { BellRing, AlertTriangle, Info, CheckCheck, Check } from "lucide-react";
import GestionnaireLayout, { PageHeader } from "../components/GestionnaireLayout";
import Button from "../components/Buttons";
import EmptyState from "../components/EmptyState";
import { useAsyncData } from "../hooks/useAsyncData";
import { gestionnaireService } from "../services/gestionnaireService";
import { formatDateTime } from "../utils/format";

const niveaux = {
  critique: {
    label: "Critique",
    icon: AlertTriangle,
    ring: "border-red-400 bg-red-50/60 dark:bg-red-900/20",
    text: "text-red-600 dark:text-red-400",
  },
  haute: {
    label: "Haute",
    icon: AlertTriangle,
    ring: "border-orange-400 bg-orange-50/60 dark:bg-orange-900/20",
    text: "text-orange-600 dark:text-orange-400",
  },
  info: {
    label: "Info",
    icon: Info,
    ring: "border-blue-400 bg-blue-50/60 dark:bg-blue-900/20",
    text: "text-blue-600 dark:text-blue-400",
  },
};

const AlertesPage = () => {
  const [filtreNiveau, setFiltreNiveau] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const { data: alertes, loading, recharger } = useAsyncData(
    () => gestionnaireService.getAlertes(),
    []
  );

  const liste = useMemo(() => alertes || [], [alertes]);

  const filtrees = useMemo(
    () => liste.filter((a) => !filtreNiveau || a.niveau === filtreNiveau),
    [liste, filtreNiveau]
  );

  const nonLues = liste.filter((a) => !a.lue).length;

  const marquerLue = async (id) => {
    setActionLoading(true);
    try {
      await gestionnaireService.marquerAlerteLue(id);
      await recharger();
    } finally {
      setActionLoading(false);
    }
  };

  const toutMarquer = async () => {
    setActionLoading(true);
    try {
      await gestionnaireService.marquerToutesAlertesLues();
      await recharger();
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <GestionnaireLayout>
      <PageHeader
        title="Alertes & notifications"
        description="Consulter les alertes générées par les infrastructures critiques et les signalements."
        actions={
          nonLues > 0 && (
            <Button variant="secondary" onClick={toutMarquer} disabled={actionLoading}>
              <CheckCheck className="h-4 w-4" /> Tout marquer comme lu ({nonLues})
            </Button>
          )
        }
      />

      <div className="mb-5 flex items-center gap-3">
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Filtrer par niveau :
        </span>
        <select
          value={filtreNiveau}
          onChange={(e) => setFiltreNiveau(e.target.value)}
          className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-900 dark:text-white"
        >
          <option value="">Tous les niveaux</option>
          <option value="critique">Critique</option>
          <option value="haute">Haute</option>
          <option value="info">Info</option>
        </select>
      </div>

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
        {loading ? (
          <div className="flex h-40 items-center justify-center text-sm text-gray-500 dark:text-gray-400">
            Chargement...
          </div>
        ) : filtrees.length === 0 ? (
          <EmptyState icon={BellRing} title="Aucune alerte" description="Tout est sous contrôle." />
        ) : (
          <ul className="divide-y divide-gray-100 dark:divide-gray-700/50">
            {filtrees.map((a) => {
              const cfg = niveaux[a.niveau] || niveaux.info;
              const Icon = cfg.icon;
              return (
                <li
                  key={a.id_alerte}
                  className={`flex items-start justify-between gap-3 border-l-4 p-4 ${cfg.ring} ${
                    a.lue ? "opacity-60" : ""
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <Icon className={`mt-0.5 h-5 w-5 flex-shrink-0 ${cfg.text}`} />
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold text-gray-900 dark:text-white">
                          {a.titre}
                        </p>
                        {!a.lue && (
                          <span className="inline-block h-2 w-2 rounded-full bg-red-500" />
                        )}
                      </div>
                      <p className="mt-0.5 text-sm text-gray-600 dark:text-gray-300">{a.message}</p>
                      <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">
                        {cfg.label} · {formatDateTime(a.created_at)}
                        {a.id_infra ? ` · ${a.id_infra}` : ""}
                      </p>
                    </div>
                  </div>
                  {!a.lue && (
                    <button
                      onClick={() => marquerLue(a.id_alerte)}
                      disabled={actionLoading}
                      className="flex-shrink-0 rounded-md p-1.5 text-green-600 hover:bg-green-100 dark:hover:bg-green-900/30"
                      title="Marquer comme lu"
                    >
                      <Check className="h-4 w-4" />
                    </button>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </GestionnaireLayout>
  );
};

export default AlertesPage;
