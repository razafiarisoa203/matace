// Gestion du profil du citoyen (compte + informations personnelles).
import React, { useContext, useState } from "react";
import { User, Mail, Phone, Save, BadgeCheck } from "lucide-react";
import CitoyenLayout, { PageHeader } from "../components/CitoyenLayout";
import {
  CitoyenTextField,
  CitoyenButton,
  CitoyenToast,
  CitoyenBadge,
} from "../components/CitoyenUI";
import { AuthContext } from "../../../context/AuthContext";
import { authService } from "../../../services/api/authService";

const ProfilPage = () => {
  const { user, refreshUser } = useContext(AuthContext);

  const [pseudo, setPseudo] = useState(user?.user_pseudo || user?.username || "");
  const [email, setEmail] = useState(user?.user_email || user?.email || "");
  const [telephone, setTelephone] = useState(user?.user_phone || user?.phone_number || "");
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({ message: "", tone: "success" });

  const citoyen = user?.citizen || {};
  const nomComplet =
    [citoyen.citizen_lastname, citoyen.citizen_name].filter(Boolean).join(" ") ||
    user?.user_pseudo ||
    "Citoyen";

  const afficherToast = (message, tone = "success") => {
    setToast({ message, tone });
    setTimeout(() => setToast({ message: "", tone }), 3000);
  };

  const enregistrer = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await authService.updateUser({
        user_pseudo: pseudo,
        user_email: email,
        user_phone: telephone,
      });
      if (refreshUser) await refreshUser();
      afficherToast("Profil mis à jour avec succès.");
    } catch (err) {
      afficherToast(err?.response?.data?.message || "Erreur lors de la mise à jour.", "error");
    } finally {
      setLoading(false);
    }
  };

  const getInitials = (name) => {
    if (!name) return "C";
    const words = name.trim().split(/\s+/).filter(Boolean);
    return words.length > 1
      ? `${words[0][0]}${words[1][0]}`.toUpperCase()
      : name.slice(0, 2).toUpperCase();
  };

  return (
    <CitoyenLayout>
      <PageHeader
        title="Mon profil"
        description="Gérez vos informations de compte et vos coordonnées."
      />

      {toast.message && (
        <CitoyenToast
          message={toast.message}
          tone={toast.tone}
          onClose={() => setToast({ message: "", tone: "success" })}
        />
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Carte identité */}
        <div className="rounded-xl border border-gray-200 bg-white p-6 text-center shadow-sm dark:border-gray-700 dark:bg-gray-800">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-green-500 to-emerald-600 text-2xl font-bold text-white">
            {getInitials(nomComplet)}
          </div>
          <h2 className="mt-3 text-lg font-semibold text-gray-900 dark:text-white">
            {nomComplet}
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">{email || "—"}</p>
          <div className="mt-3 flex justify-center">
            <CitoyenBadge tone="green">
              <BadgeCheck className="mr-1 h-3.5 w-3.5" /> Compte citoyen
            </CitoyenBadge>
          </div>

          <dl className="mt-5 space-y-2 text-left text-sm">
            <div className="flex justify-between gap-2">
              <dt className="text-gray-500 dark:text-gray-400">Téléphone</dt>
              <dd className="font-medium text-gray-800 dark:text-gray-200">{telephone || "—"}</dd>
            </div>
            {citoyen.citizen_national_card_number && (
              <div className="flex justify-between gap-2">
                <dt className="text-gray-500 dark:text-gray-400">CIN</dt>
                <dd className="font-mono text-xs text-gray-800 dark:text-gray-200">
                  {citoyen.citizen_national_card_number}
                </dd>
              </div>
            )}
            {user?.id_citizen && (
              <div className="flex justify-between gap-2">
                <dt className="text-gray-500 dark:text-gray-400">ID citoyen</dt>
                <dd className="font-mono text-xs text-gray-800 dark:text-gray-200">
                  {user.id_citizen}
                </dd>
              </div>
            )}
          </dl>
        </div>

        {/* Formulaire */}
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800 lg:col-span-2">
          <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold text-gray-900 dark:text-white">
            <User className="h-4 w-4 text-green-600 dark:text-green-400" />
            Informations du compte
          </h2>
          <form onSubmit={enregistrer} className="space-y-4">
            <CitoyenTextField
              label="Nom d'utilisateur"
              value={pseudo}
              onChange={(e) => setPseudo(e.target.value)}
              placeholder="votre pseudo"
            />
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <label className="block">
                <span className="mb-1 flex items-center gap-1 text-sm font-medium text-gray-700 dark:text-gray-300">
                  <Mail className="h-3.5 w-3.5" /> Email
                </span>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/30 dark:border-gray-600 dark:bg-gray-900 dark:text-white"
                />
              </label>
              <label className="block">
                <span className="mb-1 flex items-center gap-1 text-sm font-medium text-gray-700 dark:text-gray-300">
                  <Phone className="h-3.5 w-3.5" /> Téléphone
                </span>
                <input
                  type="tel"
                  value={telephone}
                  onChange={(e) => setTelephone(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/30 dark:border-gray-600 dark:bg-gray-900 dark:text-white"
                />
              </label>
            </div>
            <div className="flex justify-end pt-2">
              <CitoyenButton type="submit" disabled={loading}>
                <Save className="h-4 w-4" />
                {loading ? "Enregistrement..." : "Enregistrer"}
              </CitoyenButton>
            </div>
          </form>
        </div>
      </div>
    </CitoyenLayout>
  );
};

export default ProfilPage;
