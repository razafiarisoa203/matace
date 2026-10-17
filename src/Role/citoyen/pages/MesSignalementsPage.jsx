// Liste des signalements du citoyen avec filtres et suivi de statut.
import React, { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { FilePlus, Search, MessageSquareWarning, ThumbsUp, Star } from "lucide-react";
import CitoyenLayout, { PageHeader } from "../components/CitoyenLayout";
import {
  CitoyenBadge,
  CitoyenButton,
  CitoyenEmptyState,
  CitoyenLoading,
  inputClass,
} from "../components/CitoyenUI";
import { useAsyncData } from "../hooks/useAsyncData";
import { citoyenService } from "../services/citoyenService";
import {
  CATEGORIES_SIGNALEMENT,
  STATUTS_SIGNALEMENT,
  NIVEAUX_URGENCE,
  getConstant,
  labelForCategorie,
} from "../constants";
import { formatDate } from "../utils/format";

// Regroupe les couleurs de constantes en tons de badge.
const tonesParStatut = {
  nouveau: "blue",
  pris_en_charge: "violet",
  en_cours: "yellow",
  resolu: "green",
  rejete: "red",
};

const MesSignalementsPage = () => {
  const [recherche, setRecherche] = useState("");
  const [filtreStatut, setFiltreStatut] = useState("");
  const [filtreCategorie, setFiltreCategorie] = useState("");

  const { data, loading } = useAsyncData(
    () => citoyenService.getMesSignalements(),
    []
  );

  const liste = useMemo(() => data || [], [data]);

  const filtres = useMemo(() => {
    const q = recherche.toLowerCase();
    return liste.filter((s) => {
      const matchRecherche =
        !q ||
        s.titre?.toLowerCase().includes(q) ||
        s.id_suivi?.toLowerCase().includes(q);
      const matchStatut = !filtreStatut || s.statut === filtreStatut;
      const matchCategorie = !filtreCategorie || s.categorie === filtreCategorie;
      return matchRecherche && matchStatut && matchCategorie;
    });
  }, [liste, recherche, filtreStatut, filtreCategorie]);

  return (
    <CitoyenLayout>
      <PageHeader
        title="Mes signalements"
        description="Consultez, suivez et gérez vos signalements."
        actions={
          <Link to="/citoyen/signalements/nouveau">
            <CitoyenButton>
              <FilePlus className="h-4 w-4" /> Nouveau signalement
            </CitoyenButton>
          </Link>
        }
      />

      <div className="mb-5 grid grid-cols-1 gap-3 rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800 sm:grid-cols-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            value={recherche}
            onChange={(e) => setRecherche(e.target.value)}
            placeholder="Rechercher (titre, identifiant de suivi)"
            className={`${inputClass} pl-9`}
          />
        </div>
        <select value={filtreStatut} onChange={(e) => setFiltreStatut(e.target.value)} className={inputClass}>
          <option value="">Tous les statuts</option>
          {Object.values(STATUTS_SIGNALEMENT).map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>
        <select
          value={filtreCategorie}
          onChange={(e) => setFiltreCategorie(e.target.value)}
          className={inputClass}
        >
          <option value="">Toutes les catégories</option>
          {Object.values(CATEGORIES_SIGNALEMENT).map((c) => (
            <option key={c.value} value={c.value}>
              {c.label}
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <CitoyenLoading />
      ) : filtres.length === 0 ? (
        <div className="rounded-xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
          <CitoyenEmptyState
            icon={MessageSquareWarning}
            title="Aucun signalement"
            description="Vous n'avez aucun signalement correspondant à ces critères."
            action={
              <Link to="/citoyen/signalements/nouveau">
                <CitoyenButton>
                  <FilePlus className="h-4 w-4" /> Créer un signalement
                </CitoyenButton>
              </Link>
            }
          />
        </div>
      ) : (
        <div className="space-y-3">
          {filtres.map((s) => (
            <Link
              key={s.id_signal}
              to={`/citoyen/signalements/${s.id_signal}`}
              className="block rounded-xl border border-gray-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md dark:border-gray-700 dark:bg-gray-800"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                      {s.titre}
                    </h3>
                    <CitoyenBadge tone={tonesParStatut[s.statut]}>
                      {getConstant(STATUTS_SIGNALEMENT, s.statut).label}
                    </CitoyenBadge>
                  </div>
                  <p className="mt-1 line-clamp-2 text-sm text-gray-600 dark:text-gray-400">
                    {s.description}
                  </p>
                  <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-500 dark:text-gray-400">
                    <span className="font-mono">{s.id_suivi}</span>
                    <span>{labelForCategorie(s.categorie)}</span>
                    <span>Urgence : {getConstant(NIVEAUX_URGENCE, s.urgence).label}</span>
                    <span>Déposé le {formatDate(s.date_signalement)}</span>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1 text-xs text-gray-500 dark:text-gray-400">
                  <span className="inline-flex items-center gap-1">
                    <ThumbsUp className="h-3.5 w-3.5" /> {s.confirmations || 0}
                  </span>
                  {s.evaluation?.note ? (
                    <span className="inline-flex items-center gap-1 text-amber-500">
                      <Star className="h-3.5 w-3.5 fill-amber-500" /> {s.evaluation.note}/5
                    </span>
                  ) : (
                    <span className="text-gray-400">non évalué</span>
                  )}
                </div>
              </div>
            </Link>
          ))}
          <p className="text-xs text-gray-400 dark:text-gray-500">
            {filtres.length} signalement(s) affiché(s).
          </p>
        </div>
      )}
    </CitoyenLayout>
  );
};

export default MesSignalementsPage;
