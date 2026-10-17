// Formulaire de création / modification d'un signalement citoyen.
import React, { useState } from "react";
import { ImagePlus, X, Send } from "lucide-react";
import {
  CitoyenTextField,
  CitoyenTextareaField,
  CitoyenSelectField,
  CitoyenButton,
} from "./CitoyenUI";
import SelecteurLocalisation from "./SelecteurLocalisation";
import { CATEGORIES_SIGNALEMENT, NIVEAUX_URGENCE } from "../constants";

const vide = {
  titre: "",
  description: "",
  categorie: "voirie",
  urgence: "moyenne",
  latitude: null,
  longitude: null,
  photo: null,
  public: true,
};

const toOptions = (dict) =>
  Object.values(dict).map((o) => ({ value: o.value, label: o.label }));

const SignalementForm = ({ initial = null, onSubmit, onCancel, loading, submitLabel = "Envoyer le signalement" }) => {
  const [form, setForm] = useState({ ...vide, ...(initial || {}) });
  const [photoErreur, setPhotoErreur] = useState("");

  const set = (champ) => (e) =>
    setForm((prev) => ({ ...prev, [champ]: e.target.value }));

  const setLocalisation = (lat, lng) =>
    setForm((prev) => ({ ...prev, latitude: lat, longitude: lng }));

  // Photo : prise de vue (mobile) ou téléversement, convertie en aperçu.
  const handlePhoto = (e) => {
    const fichier = e.target.files?.[0];
    if (!fichier) return;
    if (!fichier.type.startsWith("image/")) {
      setPhotoErreur("Le fichier doit être une image.");
      return;
    }
    if (fichier.size > 5 * 1024 * 1024) {
      setPhotoErreur("L'image ne doit pas dépasser 5 Mo.");
      return;
    }
    setPhotoErreur("");
    const lecteur = new FileReader();
    lecteur.onload = () => setForm((prev) => ({ ...prev, photo: lecteur.result }));
    lecteur.readAsDataURL(fichier);
  };

  const retirerPhoto = () => setForm((prev) => ({ ...prev, photo: null }));

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      ...form,
      latitude: form.latitude === "" ? null : form.latitude,
      longitude: form.longitude === "" ? null : form.longitude,
    });
  };

  const categorieInfo = CATEGORIES_SIGNALEMENT[form.categorie];

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <CitoyenTextField
        label="Titre du signalement"
        required
        value={form.titre}
        onChange={set("titre")}
        placeholder="Ex : Nid-de-poule dangereux"
      />

      <CitoyenTextareaField
        label="Description"
        required
        value={form.description}
        onChange={set("description")}
        rows={4}
        placeholder="Décrivez précisément le problème observé..."
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <CitoyenSelectField
          label="Catégorie du problème"
          required
          value={form.categorie}
          onChange={set("categorie")}
          options={toOptions(CATEGORIES_SIGNALEMENT)}
          help={categorieInfo ? `Orientation : ${categorieInfo.service}` : ""}
        />
        <CitoyenSelectField
          label="Niveau d'urgence"
          required
          value={form.urgence}
          onChange={set("urgence")}
          options={toOptions(NIVEAUX_URGENCE)}
        />
      </div>

      {/* Photo */}
      <div>
        <span className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
          Photo (documenter le problème)
        </span>
        {form.photo ? (
          <div className="relative inline-block">
            <img
              src={form.photo}
              alt="Aperçu du signalement"
              className="h-40 w-40 rounded-lg border border-gray-200 object-cover dark:border-gray-700"
            />
            <button
              type="button"
              onClick={retirerPhoto}
              className="absolute -right-2 -top-2 rounded-full bg-red-600 p-1 text-white hover:bg-red-700"
              aria-label="Retirer la photo"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        ) : (
          <label className="flex h-32 w-full cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 text-gray-500 hover:border-green-400 hover:bg-green-50/40 dark:border-gray-600 dark:bg-gray-900/40 dark:text-gray-400">
            <ImagePlus className="h-6 w-6" />
            <span className="text-sm">Prendre ou téléverser une photo</span>
            <input
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handlePhoto}
              className="hidden"
            />
          </label>
        )}
        {photoErreur && <p className="mt-1 text-xs text-red-600 dark:text-red-400">{photoErreur}</p>}
      </div>

      {/* Localisation */}
      <div>
        <span className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
          Localisation du problème
        </span>
        <SelecteurLocalisation
          latitude={form.latitude}
          longitude={form.longitude}
          onChange={setLocalisation}
        />
      </div>

      <label className="flex cursor-pointer items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
        <input
          type="checkbox"
          checked={form.public}
          onChange={(e) => setForm((prev) => ({ ...prev, public: e.target.checked }))}
          className="h-4 w-4 rounded border-gray-300 text-green-600 focus:ring-green-500 dark:border-gray-600 dark:bg-gray-800"
        />
        Rendre ce signalement visible sur la carte publique
      </label>

      <div className="flex justify-end gap-3 pt-2">
        <CitoyenButton type="button" variant="secondary" onClick={onCancel}>
          Annuler
        </CitoyenButton>
        <CitoyenButton type="submit" disabled={loading}>
          <Send className="h-4 w-4" />
          {loading ? "Envoi..." : submitLabel}
        </CitoyenButton>
      </div>
    </form>
  );
};

export default SignalementForm;
