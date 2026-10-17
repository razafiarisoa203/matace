// Critères & pondérations du score de priorité.
import React, { useEffect, useMemo, useState } from "react";
import { Calculator, Save, RotateCcw } from "lucide-react";
import AdminLayout from "../components/AdminLayout";
import AdminPage from "../components/AdminPage";
import { AdminButton, AdminLoading, AdminToast, AdminToggle } from "../components/AdminUI";
import { useAsyncData } from "../hooks/useAsyncData";
import { adminService } from "../services/adminService";

const NIVEAUX_SCORE = [
  { min: 80, label: "Très haute", tone: "text-red-400" },
  { min: 60, label: "Haute", tone: "text-amber-400" },
  { min: 40, label: "Moyenne", tone: "text-sky-400" },
  { min: 0, label: "Basse", tone: "text-emerald-400" },
];

const niveauDuScore = (score) => NIVEAUX_SCORE.find((n) => score >= n.min);

const ScoringPage = () => {
  const { data: criteresInitiaux, loading } = useAsyncData(() => adminService.getScoringConfig(), []);

  const [criteres, setCriteres] = useState(null);
  const [valeurs, setValeurs] = useState({});
  const [actionLoading, setActionLoading] = useState(false);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    if (criteresInitiaux) {
      setCriteres(JSON.parse(JSON.stringify(criteresInitiaux)));
      setValeurs(Object.fromEntries(criteresInitiaux.map((c) => [c.id, 50])));
    }
  }, [criteresInitiaux]);

  const modifie = useMemo(
    () => criteres && criteresInitiaux && JSON.stringify(criteres) !== JSON.stringify(criteresInitiaux),
    [criteres, criteresInitiaux]
  );

  const totalPoids = useMemo(
    () => (criteres || []).filter((c) => c.actif).reduce((s, c) => s + (Number(c.poids) || 0), 0),
    [criteres]
  );

  const score = useMemo(() => {
    if (!criteres) return 0;
    const actifs = criteres.filter((c) => c.actif);
    if (!actifs.length || totalPoids === 0) return 0;
    const somme = actifs.reduce(
      (s, c) => s + (Number(valeurs[c.id]) || 0) * (Number(c.poids) || 0),
      0
    );
    return Math.round(somme / totalPoids);
  }, [criteres, valeurs, totalPoids]);

  if (!criteres) {
    return (
      <AdminLayout>
        <AdminPage title="Critères & pondérations du score de priorité">
          <AdminLoading message="Chargement des critères..." />
        </AdminPage>
      </AdminLayout>
    );
  }

  const majCritere = (id, champ, valeur) =>
    setCriteres((prev) => prev.map((c) => (c.id === id ? { ...c, [champ]: valeur } : c)));

  const sauvegarder = async () => {
    setActionLoading(true);
    try {
      await adminService.saveScoringConfig(criteres);
      setToast({ message: "Pondérations du score de priorité enregistrées.", tone: "success" });
    } catch (err) {
      setToast({ message: err.message || "Erreur lors de l'enregistrement.", tone: "error" });
    } finally {
      setActionLoading(false);
    }
  };

  const reinitialiser = () => setCriteres(JSON.parse(JSON.stringify(criteresInitiaux)));

  return (
    <AdminLayout>
      <AdminPage
        title="Critères & pondérations du score de priorité"
        description="Configurer les critères et pondérations du score de priorité utilisé par le décideur."
        actions={
          <>
            <AdminButton variant="secondary" onClick={reinitialiser} disabled={!modifie || actionLoading}>
              <RotateCcw className="h-4 w-4" /> Réinitialiser
            </AdminButton>
            <AdminButton
              onClick={sauvegarder}
              disabled={!modifie || actionLoading || totalPoids !== 100}
            >
              <Save className="h-4 w-4" /> {actionLoading ? "..." : "Enregistrer"}
            </AdminButton>
          </>
        }
      >
        {toast && <AdminToast message={toast.message} tone={toast.tone} onClose={() => setToast(null)} />}

        <div className="mb-4 flex items-center justify-between rounded-lg border border-slate-700/60 bg-slate-800/40 px-4 py-3">
          <span className="text-sm text-slate-300">Somme des pondérations actives</span>
          <span
            className={`text-lg font-bold ${totalPoids === 100 ? "text-emerald-400" : "text-red-400"}`}
          >
            {totalPoids} / 100
          </span>
        </div>
        {totalPoids !== 100 && (
          <p className="mb-4 text-xs text-red-400">
            La somme des pondérations doit être égale à 100 pour pouvoir enregistrer.
          </p>
        )}

        <div className="space-y-3">
          {criteres.map((c) => (
            <div
              key={c.id}
              className="rounded-lg border border-slate-700/60 bg-slate-800/40 p-4 sm:flex sm:items-center sm:gap-6"
            >
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-white">{c.nom}</span>
                  <span className="font-mono text-xs text-slate-500">{c.code}</span>
                </div>
                <p className="mt-0.5 text-xs text-slate-400">{c.description}</p>
              </div>
              <div className="mt-3 flex items-center gap-4 sm:mt-0">
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min="0"
                    max="100"
                    step="5"
                    value={c.poids}
                    disabled={!c.actif}
                    onChange={(e) => majCritere(c.id, "poids", Number(e.target.value))}
                    className="w-36 accent-emerald-600"
                  />
                  <div className="flex w-16 items-center gap-1">
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={c.poids}
                      disabled={!c.actif}
                      onChange={(e) => majCritere(c.id, "poids", Number(e.target.value))}
                      className="w-full rounded-lg border border-slate-600 bg-slate-800 px-2 py-1 text-sm text-slate-100"
                    />
                    <span className="text-xs text-slate-500">%</span>
                  </div>
                </div>
                <AdminToggle
                  checked={c.actif}
                  onChange={(v) => majCritere(c.id, "actif", v)}
                  label={`Activer ${c.nom}`}
                />
              </div>
            </div>
          ))}
        </div>

        {/* Aperçu du calcul */}
        <div className="mt-8 rounded-lg border border-slate-700/60 bg-slate-800/40 p-5">
          <div className="mb-4 flex items-center gap-2">
            <Calculator className="h-5 w-5 text-emerald-400" />
            <h2 className="text-lg font-semibold text-white">Aperçu du calcul du score</h2>
          </div>
          <p className="mb-4 text-xs text-slate-400">
            Simulez une infrastructure en faisant varier la valeur de chaque critère (0 à 100) pour
            obtenir le score final pondéré.
          </p>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {criteres
              .filter((c) => c.actif)
              .map((c) => (
                <div key={c.id}>
                  <div className="mb-1 flex items-center justify-between text-xs text-slate-400">
                    <span>{c.nom}</span>
                    <span className="font-mono text-emerald-400">
                      {valeurs[c.id]} × {c.poids}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={valeurs[c.id] ?? 0}
                    onChange={(e) => setValeurs({ ...valeurs, [c.id]: Number(e.target.value) })}
                    className="w-full accent-emerald-600"
                  />
                </div>
              ))}
          </div>
          <div className="mt-6 flex items-center gap-4 rounded-lg border border-slate-700/60 bg-slate-900/60 px-5 py-4">
            <div>
              <div className="text-xs uppercase tracking-wide text-slate-400">Score final</div>
              <div className={`text-3xl font-bold ${niveauDuScore(score)?.tone || "text-white"}`}>
                {score} / 100
              </div>
            </div>
            <div className="ml-auto text-right">
              <div className="text-xs uppercase tracking-wide text-slate-400">Niveau de priorité</div>
              <div className={`text-lg font-semibold ${niveauDuScore(score)?.tone || "text-white"}`}>
                {niveauDuScore(score)?.label || "—"}
              </div>
            </div>
          </div>
        </div>

        {!loading && (
          <p className="mt-3 text-xs text-slate-500">
            Le score est utilisé par le rôle décideur pour arbitrer les priorités d'investissement.
          </p>
        )}
      </AdminPage>
    </AdminLayout>
  );
};

export default ScoringPage;
