// Formulaire de planification d'une intervention / maintenance.
import React, { useState } from "react";
import { TextField, TextAreaField, SelectField } from "./Field";
import Button from "./Buttons";
import { PRIORITES, EQUIPES } from "../constants";

const vide = {
  titre: "",
  type: "maintenance",
  id_infra: "",
  id_signal: "",
  priorite: "moyenne",
  equipe: "",
  agent: "",
  date_planifiee: "",
  cout_prevu: "",
  observations: "",
};

const toOptions = (dict) => Object.values(dict).map((o) => ({ value: o.value, label: o.label }));

const InterventionForm = ({
  infrastructures = [],
  signalements = [],
  agents = [],
  initialValues,
  onSubmit,
  onCancel,
  loading,
}) => {
  const [form, setForm] = useState({ ...vide, ...(initialValues || {}) });

  const set = (champ) => (e) => setForm((prev) => ({ ...prev, [champ]: e.target.value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      ...form,
      id_infra: form.id_infra || null,
      id_signal: form.id_signal || null,
      equipe: form.equipe || null,
      agent: form.agent || null,
      cout_prevu: form.cout_prevu === "" ? 0 : Number(form.cout_prevu),
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <TextField
        label="Intitulé de l'intervention"
        required
        value={form.titre}
        onChange={set("titre")}
        placeholder="Ex : Réfection de la chaussée"
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <SelectField label="Type" value={form.type} onChange={set("type")}>
          <option value="maintenance">Maintenance</option>
          <option value="inspection">Inspection</option>
          <option value="construction">Construction</option>
          <option value="reparation">Réparation</option>
        </SelectField>
        <SelectField
          label="Priorité"
          value={form.priorite}
          onChange={set("priorite")}
          options={toOptions(PRIORITES)}
        />
        <SelectField
          label="Infrastructure concernée"
          required
          value={form.id_infra}
          onChange={set("id_infra")}
        >
          <option value="">— Sélectionner —</option>
          {infrastructures.map((i) => (
            <option key={i.id_infra} value={i.id_infra}>
              {i.id_infra} — {i.nom}
            </option>
          ))}
        </SelectField>
        <SelectField
          label="Signalement lié (optionnel)"
          value={form.id_signal}
          onChange={set("id_signal")}
        >
          <option value="">— Aucun —</option>
          {signalements.map((s) => (
            <option key={s.id_signal} value={s.id_signal}>
              {s.id_signal} — {s.titre}
            </option>
          ))}
        </SelectField>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <SelectField
          label="Équipe affectée (optionnel)"
          value={form.equipe}
          onChange={set("equipe")}
        >
          <option value="">— Non affectée —</option>
          {EQUIPES.map((e) => (
            <option key={e.id} value={e.id}>
              {e.nom}
            </option>
          ))}
        </SelectField>
        <SelectField label="Agent affecté (optionnel)" value={form.agent} onChange={set("agent")}>
          <option value="">— Non affecté —</option>
          {agents.map((a) => (
            <option key={a.id} value={a.id}>
              {a.nom}
            </option>
          ))}
        </SelectField>
        <TextField
          label="Date planifiée"
          type="date"
          value={form.date_planifiee ? form.date_planifiee.slice(0, 10) : ""}
          onChange={set("date_planifiee")}
        />
        <TextField
          label="Coût prévu (Ar)"
          type="number"
          value={form.cout_prevu}
          onChange={set("cout_prevu")}
        />
      </div>

      <TextAreaField
        label="Observations"
        value={form.observations}
        onChange={set("observations")}
      />

      <div className="flex justify-end gap-3 pt-2">
        <Button type="button" variant="secondary" onClick={onCancel}>
          Annuler
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? "Enregistrement..." : "Planifier"}
        </Button>
      </div>
    </form>
  );
};

export default InterventionForm;
