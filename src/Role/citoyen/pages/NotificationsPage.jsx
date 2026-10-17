// Notifications du citoyen relatives au traitement de ses signalements.
import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Bell, BellOff, CheckCheck, Check } from "lucide-react";
import CitoyenLayout, { PageHeader } from "../components/CitoyenLayout";
import {
  CitoyenButton,
  CitoyenEmptyState,
  CitoyenLoading,
} from "../components/CitoyenUI";
import { useAsyncData } from "../hooks/useAsyncData";
import { citoyenService } from "../services/citoyenService";
import { formatDateTime } from "../utils/format";

const NotificationsPage = () => {
  const { data, loading, recharger } = useAsyncData(
    () => citoyenService.getNotifications(),
    []
  );
  const [enCours, setEnCours] = useState(false);

  const liste = data || [];
  const nonLues = liste.filter((n) => !n.lue).length;

  const marquerLue = async (id) => {
    setEnCours(true);
    try {
      await citoyenService.marquerNotificationLue(id);
      await recharger();
    } finally {
      setEnCours(false);
    }
  };

  const toutMarquerLues = async () => {
    setEnCours(true);
    try {
      await citoyenService.marquerToutesNotificationsLues();
      await recharger();
    } finally {
      setEnCours(false);
    }
  };

  return (
    <CitoyenLayout>
      <PageHeader
        title="Notifications"
        description="Suivez les mises à jour de vos signalements."
        actions={
          nonLues > 0 && (
            <CitoyenButton variant="secondary" onClick={toutMarquerLues} disabled={enCours}>
              <CheckCheck className="h-4 w-4" /> Tout marquer comme lu
            </CitoyenButton>
          )
        }
      />

      {loading ? (
        <CitoyenLoading />
      ) : liste.length === 0 ? (
        <div className="rounded-xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
          <CitoyenEmptyState
            icon={BellOff}
            title="Aucune notification"
            description="Vous serez averti lors de la prise en charge et du traitement de vos signalements."
          />
        </div>
      ) : (
        <div className="space-y-3">
          {liste.map((n) => (
            <div
              key={n.id_notification}
              className={`flex items-start gap-3 rounded-xl border p-4 shadow-sm ${
                n.lue
                  ? "border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800"
                  : "border-green-200 bg-green-50/60 dark:border-green-800 dark:bg-green-900/20"
              }`}
            >
              <div
                className={`rounded-lg p-2 ${
                  n.lue
                    ? "bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-300"
                    : "bg-green-100 text-green-600 dark:bg-green-900/40 dark:text-green-400"
                }`}
              >
                <Bell className="h-4 w-4" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white">{n.titre}</h3>
                  <span className="text-xs text-gray-400 dark:text-gray-500">
                    {formatDateTime(n.created_at)}
                  </span>
                </div>
                <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">{n.message}</p>
                <div className="mt-2 flex items-center gap-3">
                  {n.id_signal && (
                    <Link
                      to={`/citoyen/signalements/${n.id_signal}`}
                      className="text-xs font-medium text-green-600 hover:underline dark:text-green-400"
                    >
                      Voir le signalement
                    </Link>
                  )}
                  {!n.lue && (
                    <button
                      onClick={() => marquerLue(n.id_notification)}
                      disabled={enCours}
                      className="inline-flex items-center gap-1 text-xs text-gray-500 hover:text-green-600 dark:text-gray-400"
                    >
                      <Check className="h-3.5 w-3.5" /> Marquer comme lu
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </CitoyenLayout>
  );
};

export default NotificationsPage;
