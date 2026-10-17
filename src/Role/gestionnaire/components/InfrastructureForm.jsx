// Formulaire de création / modification d'une infrastructure.
import React, { useEffect, useState } from "react";
import { TextField, TextAreaField, SelectField } from "./Field";
import Button from "./Buttons";
import {
  TYPES_INFRASTRUCTURE,
  STATUTS_INFRASTRUCTURE,
  ETATS_INFRASTRUCTURE,
  PRIORITES,
  PERIMETRES,
} from "../constants";

const vide = {
  nom: "",
  type: "route",
  statut: "actif",
  etat: "bon",
  priorite: "moyenne",
  perimetre: "antananarivo-1",
  commune: "",
  fokontany: "",
  latitude: "",
  longitude: "",
  annee_construction: "",
  longueur_m: "",
  cout_estime: "",
  description: "",
};

const toOptions = (dict) =>
  Object.values(dict).map((o) => ({ value: o.value, label: o.label }));

const InfrastructureForm = ({ initialValues, onSubmit, onCancel, loading }) => {
  const [form, setForm] = useState(vide);

  useEffect(() => {
    if (initialValues) {
      setForm({ ...vide, ...initialValues });
    } else {
      setForm(vide);
    }
  }, [initialValues]);

  const set = (champ) => (e) => setForm((prev) => ({ ...prev, [champ]: e.target.value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      ...form,
      latitude: form.latitude === "" ? null : Number(form.latitude),
      longitude: form.longitude === "" ? null : Number(form.longitude),
      annee_construction: form.annee_construction === "" ? null : Number(form.annee_construction),
      longueur_m: form.longueur_m === "" ? null : Number(form.longueur_m),
      cout_estime: form.cout_estime === "" ? 0 : Number(form.cout_estime),
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <TextField
        label="Nom de l'infrastructure"
        required
        value={form.nom}
        onChange={set("nom")}
        placeholder="Ex : Route RN7 - PK 12"
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <SelectField
          label="Type"
          required
          value={form.type}
          onChange={set("type")}
          options={TYPES_INFRASTRUCTURE}
        />
        <SelectField
          label="Statut administratif"
          value={form.statut}
          onChange={set("statut")}
          options={toOptions(STATUTS_INFRASTRUCTURE)}
        />
        <SelectField
          label="État après inspection"
          value={form.etat}
          onChange={set("etat")}
          options={toOptions(ETATS_INFRASTRUCTURE)}
        />
        <SelectField
          label="Priorité proposée"
          value={form.priorite}
          onChange={set("priorite")}
          options={toOptions(PRIORITES)}
          help="Le décideur valide la priorité finale."
        />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <SelectField
          label="Périmètre"
          value={form.perimetre}
          onChange={set("perimetre")}
          options={PERIMETRES}
        />
        <TextField label="Commune" value={form.commune} onChange={set("commune")} />
        <TextField label="Fokontany" value={form.fokontany} onChange={set("fokontany")} />
        <TextField
          label="Année de construction"
          type="number"
          value={form.annee_construction}
          onChange={set("annee_construction")}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <TextField
          label="Latitude"
          type="number"
          step="any"
          value={form.latitude}
          onChange={set("latitude")}
          placeholder="-18.9089"
        />
        <TextField
          label="Longitude"
          type="number"
          step="any"
          value={form.longitude}
          onChange={set("longitude")}
          placeholder="47.5253"
        />
        <TextField
          label="Longueur (m)"
          type="number"
          value={form.longueur_m}
          onChange={set("longueur_m")}
        />
        <TextField
          label="Coût estimé (Ar)"
          type="number"
          value={form.cout_estime}
          onChange={set("cout_estime")}
        />
      </div>

      <TextAreaField
        label="Description / caractéristiques"
        value={form.description}
        onChange={set("description")}
      />

      <div className="flex justify-end gap-3 pt-2">
        <Button type="button" variant="secondary" onClick={onCancel}>
          Annuler
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? "Enregistrement..." : initialValues ? "Mettre à jour" : "Créer"}
        </Button>
      </div>
    </form>
  );
};

export default InfrastructureForm;
