// Formulaire de création d'un signalement.
import React, { useState } from "react";
import { TextField, TextAreaField, SelectField } from "./Field";
import Button from "./Buttons";
import { PRIORITES, PERIMETRES, TYPES_INFRASTRUCTURE } from "../constants";

const vide = {
  titre: "",
  description: "",
  source: "agent",
  declarant: "",
  contact: "",
  priorite_proposee: "moyenne",
  perimetre: "antananarivo-1",
  latitude: "",
  longitude: "",
};

const toOptions = (dict) => Object.values(dict).map((o) => ({ value: o.value, label: o.label }));

const SignalementForm = ({ infrastructures = [], onSubmit, onCancel, loading }) => {
  const [form, setForm] = useState(vide);

  const set = (champ) => (e) => setForm((prev) => ({ ...prev, [champ]: e.target.value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      ...form,
      latitude: form.latitude === "" ? null : Number(form.latitude),
      longitude: form.longitude === "" ? null : Number(form.longitude),
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <TextField
        label="Titre du signalement"
        required
        value={form.titre}
        onChange={set("titre")}
        placeholder="Ex : Nid-de-poule dangereux"
      />

      <TextAreaField
        label="Description"
        required
        value={form.description}
        onChange={set("description")}
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <SelectField label="Source" value={form.source} onChange={set("source")}>
          <option value="agent">Agent / Gestionnaire</option>
          <option value="citoyen">Citoyen</option>
        </SelectField>
        <SelectField
          label="Priorité proposée"
          value={form.priorite_proposee}
          onChange={set("priorite_proposee")}
          options={toOptions(PRIORITES)}
          help="Sera soumise à validation du décideur."
        />
        <TextField label="Déclarant" value={form.declarant} onChange={set("declarant")} />
        <TextField label="Contact" value={form.contact} onChange={set("contact")} />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <SelectField
          label="Périmètre"
          value={form.perimetre}
          onChange={set("perimetre")}
          options={PERIMETRES}
        />
        <TextField
          label="Latitude"
          type="number"
          step="any"
          value={form.latitude}
          onChange={set("latitude")}
        />
        <TextField
          label="Longitude"
          type="number"
          step="any"
          value={form.longitude}
          onChange={set("longitude")}
        />
      </div>

      <SelectField
        label="Infrastructure concernée (optionnel)"
        value={form.id_infra || ""}
        onChange={(e) => setForm((p) => ({ ...p, id_infra: e.target.value || null }))}
      >
        <option value="">— Aucune (à rattacher plus tard) —</option>
        {infrastructures.map((i) => (
          <option key={i.id_infra} value={i.id_infra}>
            {i.id_infra} — {i.nom}
          </option>
        ))}
      </SelectField>

      <p className="text-xs text-gray-500 dark:text-gray-400">
        Types disponibles : {TYPES_INFRASTRUCTURE.map((t) => t.label).join(", ")}.
      </p>

      <div className="flex justify-end gap-3 pt-2">
        <Button type="button" variant="secondary" onClick={onCancel}>
          Annuler
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? "Enregistrement..." : "Créer le signalement"}
        </Button>
      </div>
    </form>
  );
};

export default SignalementForm;
