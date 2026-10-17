// Cartographie : couches, styles et fonds de carte.
import React, { useState } from "react";
import { Layers, Plus, Pencil, Trash2 } from "lucide-react";
import AdminLayout from "../components/AdminLayout";
import AdminPage from "../components/AdminPage";
import {
  AdminButton,
  AdminCheckbox,
  AdminConfirmModal,
  AdminEmptyState,
  AdminLoading,
  AdminModal,
  AdminTable,
  AdminTabs,
  AdminTextField,
  AdminToast,
  AdminToggle,
} from "../components/AdminUI";
import { useAsyncData } from "../hooks/useAsyncData";
import { adminService } from "../services/adminService";

const ONGLETS = [
  { id: "couches", label: "Couches cartographiques" },
  { id: "styles", label: "Styles" },
  { id: "basemaps", label: "Fonds de carte" },
];

const FORM_LAYER = { nom: "", type: "WFS", source: "", style: "STY-001", ordre: 1, visible: true };
const FORM_STYLE = { nom: "", couleur: "#10b981", taille_symbole: 8, opacite: 0.85 };
const FORM_BAS = { nom: "", url: "", attribution: "", actif: true };

const CartographiePage = () => {
  const [onglet, setOnglet] = useState("couches");
  const { data: couches, loading: lC, recharger: rC } = useAsyncData(() => adminService.listLayers(), [onglet]);
  const { data: styles, loading: lS, recharger: rS } = useAsyncData(() => adminService.listStyles(), [onglet]);
  const { data: basemaps, loading: lB, recharger: rB } = useAsyncData(() => adminService.getBasemaps(), [onglet]);

  const [modal, setModal] = useState(false);
  const [edition, setEdition] = useState(null);
  const [form, setForm] = useState(FORM_LAYER);
  const [aSupprimer, setASupprimer] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [toast, setToast] = useState(null);

  const chargerForm = (o) => {
    if (onglet === "couches") setForm({ nom: o.nom, type: o.type, source: o.source, style: o.style, ordre: o.ordre, visible: o.visible });
    if (onglet === "styles") setForm({ nom: o.nom, couleur: o.couleur, taille_symbole: o.taille_symbole, opacite: o.opacite });
    if (onglet === "basemaps") setForm({ nom: o.nom, url: o.url, attribution: o.attribution || "", actif: o.actif });
  };

  const ouvrirCreation = () => {
    setEdition(null);
    setForm(onglet === "couches" ? FORM_LAYER : onglet === "styles" ? FORM_STYLE : FORM_BAS);
    setModal(true);
  };

  const ouvrirEdition = (o) => {
    setEdition(o);
    chargerForm(o);
    setModal(true);
  };

  const getRecharger = () => (onglet === "couches" ? rC() : onglet === "styles" ? rS() : rB());
  const getSupp = (id) => (onglet === "couches" ? adminService.deleteLayer(id) : onglet === "styles" ? adminService.deleteStyle(id) : adminService.deleteBasemap(id));
  const getSave = (data) =>
    onglet === "couches"
      ? adminService.saveLayer({ ...(edition ? { id: edition.id } : {}), ...data })
      : onglet === "styles"
      ? adminService.saveStyle({ ...(edition ? { id: edition.id } : {}), ...data })
      : adminService.saveBasemap({ ...(edition ? { id: edition.id } : {}), ...data });

  const enregistrer = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      const payload = onglet === "couches"
        ? { ...form, ordre: Number(form.ordre) }
        : onglet === "styles"
        ? { ...form, taille_symbole: Number(form.taille_symbole), opacite: Number(form.opacite) }
        : { ...form };
      await getSave(payload);
      setToast({ message: edition ? "Enregistrement effectué." : "Création effectuée.", tone: "success" });
      setModal(false);
      setEdition(null);
      await getRecharger();
    } catch (err) {
      setToast({ message: err.message || "Erreur.", tone: "error" });
    } finally {
      setActionLoading(false);
    }
  };

  const supprimer = async () => {
    if (!aSupprimer) return;
    setActionLoading(true);
    try {
      await getSupp(aSupprimer.id);
      setToast({ message: "Suppression effectuée.", tone: "success" });
      setASupprimer(null);
      await getRecharger();
    } finally {
      setActionLoading(false);
    }
  };

  const loading = onglet === "couches" ? lC : onglet === "styles" ? lS : lB;
  const liste = onglet === "couches" ? couches : onglet === "styles" ? styles : basemaps;

  return (
    <AdminLayout>
      <AdminPage
        title="Cartographie : couches, styles & fonds de carte"
        description="Gérer les couches cartographiques, les styles et les fonds de carte utilisés sur l'application cartographique."
        actions={
          <AdminButton onClick={ouvrirCreation}>
            <Plus className="h-4 w-4" /> Ajouter
          </AdminButton>
        }
      >
        {toast && <AdminToast message={toast.message} tone={toast.tone} onClose={() => setToast(null)} />}

        <AdminTabs active={onglet} onChange={setOnglet} tabs={ONGLETS} />

        {loading ? (
          <AdminLoading message="Chargement des éléments cartographiques..." />
        ) : !liste?.length ? (
          <AdminEmptyState
            icon={Layers}
            title="Aucun élément"
            description={`Aucun élément dans la section « ${ONGLETS.find((t) => t.id === onglet)?.label} ».`}
            action={
              <AdminButton onClick={ouvrirCreation}>
                <Plus className="h-4 w-4" /> Créer un élément
              </AdminButton>
            }
          />
        ) : onglet === "couches" ? (
          <AdminTable headers={["ID", "Nom", "Type", "Source", "Style", "Ordre", "Visible", "Actions"]}>
            {couches.map((c) => (
              <tr key={c.id} className="hover:bg-slate-800/40">
                <td className="px-4 py-3 text-sm text-slate-400">{c.id}</td>
                <td className="px-4 py-3 text-sm font-medium text-white">{c.nom}</td>
                <td className="px-4 py-3 text-xs text-slate-400">{c.type}</td>
                <td className="px-4 py-3 text-xs text-slate-500">{c.source}</td>
                <td className="px-4 py-3 font-mono text-xs text-emerald-400">{c.style}</td>
                <td className="px-4 py-3 text-sm text-slate-400">{c.ordre}</td>
                <td className="px-4 py-3">
                  <AdminToggle checked={c.visible} onChange={() => null} label="Visible" />
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1">
                    <button title="Modifier" onClick={() => ouvrirEdition(c)} className="rounded-md p-1.5 text-sky-400 hover:bg-sky-500/10">
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button title="Supprimer" onClick={() => setASupprimer(c)} className="rounded-md p-1.5 text-red-400 hover:bg-red-500/10">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </AdminTable>
        ) : onglet === "styles" ? (
          <AdminTable headers={["ID", "Nom", "Couleur", "Taille symbole", "Opacité", "Actions"]}>
            {styles.map((s) => (
              <tr key={s.id} className="hover:bg-slate-800/40">
                <td className="px-4 py-3 text-sm text-slate-400">{s.id}</td>
                <td className="px-4 py-3 text-sm font-medium text-white">{s.nom}</td>
                <td className="px-4 py-3 text-xs font-mono text-slate-300">{s.couleur}</td>
                <td className="px-4 py-3 text-sm text-slate-400">{s.taille_symbole}px</td>
                <td className="px-4 py-3 text-sm text-slate-400">{s.opacite}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1">
                    <button title="Modifier" onClick={() => ouvrirEdition(s)} className="rounded-md p-1.5 text-sky-400 hover:bg-sky-500/10">
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button title="Supprimer" onClick={() => setASupprimer(s)} className="rounded-md p-1.5 text-red-400 hover:bg-red-500/10">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </AdminTable>
        ) : (
          <AdminTable headers={["ID", "Nom", "URL du fond de carte", "Attribution", "Actif", "Actions"]}>
            {basemaps.map((b) => (
              <tr key={b.id} className="hover:bg-slate-800/40">
                <td className="px-4 py-3 text-sm text-slate-400">{b.id}</td>
                <td className="px-4 py-3 text-sm font-medium text-white">{b.nom}</td>
                <td className="px-4 py-3 text-xs text-slate-500">{b.url}</td>
                <td className="px-4 py-3 text-xs text-slate-500">{b.attribution || "—"}</td>
                <td className="px-4 py-3">
                  <AdminToggle checked={b.actif} onChange={() => null} label="Actif" />
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1">
                    <button title="Modifier" onClick={() => ouvrirEdition(b)} className="rounded-md p-1.5 text-sky-400 hover:bg-sky-500/10">
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button title="Supprimer" onClick={() => setASupprimer(b)} className="rounded-md p-1.5 text-red-400 hover:bg-red-500/10">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </AdminTable>
        )}
      </AdminPage>

      <AdminModal
        isOpen={modal}
        onClose={() => setModal(false)}
        title={edition ? `Modifier ${edition.nom}` : `Ajouter — ${ONGLETS.find((t) => t.id === onglet)?.label}`}
        footer={
          <>
            <AdminButton variant="secondary" onClick={() => setModal(false)}>
              Annuler
            </AdminButton>
            <AdminButton onClick={enregistrer} disabled={actionLoading}>
              {actionLoading ? "..." : "Enregistrer"}
            </AdminButton>
          </>
        }
      >
        <form onSubmit={enregistrer} className="space-y-4">
          {onglet === "couches" && (
            <>
              <AdminTextField label="Nom de la couche" required value={form.nom} onChange={(e) => setForm({ ...form, nom: e.target.value })} />
              <div className="grid gap-4 sm:grid-cols-2">
                <AdminTextField label="Type" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} />
                <AdminTextField label="Style" value={form.style} onChange={(e) => setForm({ ...form, style: e.target.value })} />
              </div>
              <AdminTextField label="Source" required value={form.source} onChange={(e) => setForm({ ...form, source: e.target.value })} />
              <div className="grid gap-4 sm:grid-cols-2">
                <AdminTextField label="Ordre" type="number" value={form.ordre} onChange={(e) => setForm({ ...form, ordre: e.target.value })} />
                <AdminCheckbox checked={form.visible} onChange={(v) => setForm({ ...form, visible: v })} label="Visible par défaut" />
              </div>
            </>
          )}
          {onglet === "styles" && (
            <>
              <AdminTextField label="Nom du style" required value={form.nom} onChange={(e) => setForm({ ...form, nom: e.target.value })} />
              <div className="grid gap-4 sm:grid-cols-3">
                <AdminTextField label="Couleur" type="color" value={form.couleur} onChange={(e) => setForm({ ...form, couleur: e.target.value })} />
                <AdminTextField label="Taille du symbole (px)" type="number" value={form.taille_symbole} onChange={(e) => setForm({ ...form, taille_symbole: e.target.value })} />
                <AdminTextField label="Opacité (0 à 1)" type="number" step="0.05" min="0" max="1" value={form.opacite} onChange={(e) => setForm({ ...form, opacite: e.target.value })} />
              </div>
            </>
          )}
          {onglet === "basemaps" && (
            <>
              <AdminTextField label="Nom du fond de carte" required value={form.nom} onChange={(e) => setForm({ ...form, nom: e.target.value })} />
              <AdminTextField label="URL du fond de carte" required value={form.url} onChange={(e) => setForm({ ...form, url: e.target.value })} />
              <AdminTextField label="Attribution" value={form.attribution} onChange={(e) => setForm({ ...form, attribution: e.target.value })} />
              <AdminCheckbox checked={form.actif} onChange={(v) => setForm({ ...form, actif: v })} label="Actif (visible dans la liste)" />
            </>
          )}
        </form>
      </AdminModal>

      <AdminConfirmModal
        isOpen={!!aSupprimer}
        onClose={() => setASupprimer(null)}
        onConfirm={supprimer}
        loading={actionLoading}
        title="Supprimer l'élément"
        message={`Voulez-vous supprimer ${aSupprimer?.nom} (${aSupprimer?.id}) ? Cette action affecte la configuration cartographique.`}
      />
    </AdminLayout>
  );
};

export default CartographiePage;
