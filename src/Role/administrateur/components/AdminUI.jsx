// Composants UI réutilisables du module Administrateur (mode clair/sombre).
import React from "react";
import { X, CheckCircle2, AlertTriangle, Inbox } from "lucide-react";

export const AdminButton = ({ variant = "primary", className = "", children, ...props }) => {
  const variants = {
    primary: "bg-green-600 text-white hover:bg-green-700 focus:ring-2 focus:ring-green-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800",
    secondary:
      "border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 focus:ring-2 focus:ring-green-500 focus:ring-offset-2 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700 dark:focus:ring-offset-gray-800",
    danger: "bg-red-600 text-white hover:bg-red-700 focus:ring-2 focus:ring-red-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800",
    ghost:
      "text-gray-600 hover:bg-gray-100 focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 dark:text-gray-300 dark:hover:bg-gray-700 dark:focus:ring-offset-gray-800",
  };
  return (
    <button
      className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

export const AdminBadge = ({ children, tone = "gray" }) => {
  const tones = {
    gray: "bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700",
    green: "bg-green-100 text-green-800 border-green-200 dark:bg-green-900/40 dark:text-green-300 dark:border-green-700/60",
    red: "bg-red-100 text-red-800 border-red-200 dark:bg-red-900/40 dark:text-red-300 dark:border-red-700/60",
    yellow: "bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/40 dark:text-yellow-300 dark:border-yellow-700/60",
    blue: "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/40 dark:text-blue-300 dark:border-blue-700/60",
    violet: "bg-violet-100 text-violet-800 border-violet-200 dark:bg-violet-900/40 dark:text-violet-300 dark:border-violet-700/60",
    slate: "bg-gray-100 text-gray-700 border-gray-200 dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600",
  };
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${tones[tone] || tones.gray}`}
    >
      {children}
    </span>
  );
};

export const AdminToast = ({ message, tone = "success", onClose }) => {
  if (!message) return null;
  const styles =
    tone === "error"
      ? "border-red-500 bg-red-50 text-red-700 dark:border-red-500/60 dark:bg-red-900/30 dark:text-red-300"
      : "border-green-500 bg-green-50 text-green-700 dark:border-green-500/60 dark:bg-green-900/30 dark:text-green-300";
  const Icon = tone === "error" ? AlertTriangle : CheckCircle2;
  return (
    <div className={`mb-4 flex items-center justify-between gap-2 rounded-lg border-l-4 px-4 py-3 text-sm ${styles}`}>
      <span className="flex items-center gap-2">
        <Icon className="h-4 w-4 shrink-0" /> {message}
      </span>
      {onClose && (
        <button onClick={onClose} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-white" aria-label="Fermer">
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
};

export const AdminStatCard = ({ icon: Icon, label, value, detail, tone = "green" }) => {
  const tones = {
    green: "bg-green-100 text-green-600 dark:bg-green-900/40 dark:text-green-400",
    blue: "bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-400",
    amber: "bg-amber-100 text-amber-600 dark:bg-amber-900/40 dark:text-amber-400",
    red: "bg-red-100 text-red-600 dark:bg-red-900/40 dark:text-red-400",
    slate: "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300",
    violet: "bg-violet-100 text-violet-600 dark:bg-violet-900/40 dark:text-violet-400",
  };
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md dark:border-gray-700 dark:bg-gray-800">
      <div className="flex items-center gap-3">
        {Icon && (
          <div className={`rounded-lg p-2.5 ${tones[tone] || tones.green}`}>
            <Icon className="h-5 w-5" />
          </div>
        )}
        <div className="min-w-0">
          <div className="truncate text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">{label}</div>
          <div className="text-2xl font-bold text-gray-900 dark:text-white">{value}</div>
          {detail && <div className="truncate text-xs text-gray-500 dark:text-gray-400">{detail}</div>}
        </div>
      </div>
    </div>
  );
};

export const AdminModal = ({ isOpen, onClose, title, children, footer, size = "md" }) => {
  if (!isOpen) return null;
  const largeurs = { sm: "max-w-md", md: "max-w-2xl", lg: "max-w-4xl" };
  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/50 p-4">
      <div className={`relative my-8 w-full ${largeurs[size]} rounded-xl border border-gray-200 bg-white shadow-xl dark:border-gray-700 dark:bg-gray-800`}>
        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h2>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-gray-500 hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white"
            aria-label="Fermer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="px-6 py-5">{children}</div>
        {footer && (
          <div className="flex items-center justify-end gap-3 border-t border-gray-200 px-6 py-4 dark:border-gray-700">{footer}</div>
        )}
      </div>
    </div>
  );
};

export const inputClass =
  "w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/30 dark:border-gray-600 dark:bg-gray-900 dark:text-white dark:placeholder-gray-500";

const FieldLabel = ({ label, required, help }) => (
  <span className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
    {label}
    {required && <span className="ml-1 text-red-500">*</span>}
    {help && <span className="mt-1 block text-xs font-normal text-gray-500 dark:text-gray-400">{help}</span>}
  </span>
);

export const AdminTextField = ({ label, required, help, ...props }) => (
  <label className="block">
    <FieldLabel label={label} required={required} help={help} />
    <input className={inputClass} required={required} {...props} />
  </label>
);

export const AdminSelectField = ({ label, required, help, options = [], children, ...props }) => (
  <label className="block">
    <FieldLabel label={label} required={required} help={help} />
    <select className={inputClass} required={required} {...props}>
      {children ||
        options.map((o) => (
          <option key={o.value ?? o} value={o.value ?? o}>
            {o.label ?? o}
          </option>
        ))}
    </select>
  </label>
);

export const AdminTextareaField = ({ label, required, help, ...props }) => (
  <label className="block">
    <FieldLabel label={label} required={required} help={help} />
    <textarea className={inputClass} required={required} rows={3} {...props} />
  </label>
);

export const AdminToggle = ({ checked, onChange, label }) => (
  <button
    type="button"
    role="switch"
    aria-checked={checked}
    aria-label={label}
    onClick={() => onChange(!checked)}
    className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors ${
      checked ? "bg-green-600" : "bg-gray-300 dark:bg-gray-600"
    }`}
  >
    <span
      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
        checked ? "translate-x-6" : "translate-x-1"
      }`}
    />
  </button>
);

export const AdminCheckbox = ({ checked, onChange, label }) => (
  <label className="flex cursor-pointer items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
    <input
      type="checkbox"
      checked={checked}
      onChange={(e) => onChange(e.target.checked)}
      className="h-4 w-4 rounded border-gray-300 bg-white text-green-600 focus:ring-green-500 dark:border-gray-600 dark:bg-gray-800"
    />
    {label}
  </label>
);

export const AdminEmptyState = ({ icon: Icon, title, description, action }) => (
  <div className="py-12 text-center">
    {Icon ? <Icon className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500" /> : <Inbox className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500" />}
    <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-white">{title}</h3>
    {description && <p className="mx-auto mt-1 max-w-md text-sm text-gray-600 dark:text-gray-400">{description}</p>}
    {action && <div className="mt-6">{action}</div>}
  </div>
);

export const AdminTabs = ({ tabs, active, onChange }) => (
  <div className="mb-5 flex flex-wrap gap-1 rounded-lg border border-gray-200 bg-gray-50 p-1 dark:border-gray-700 dark:bg-gray-800/60">
    {tabs.map((t) => (
      <button
        key={t.id}
        onClick={() => onChange(t.id)}
        className={`rounded-md px-4 py-2 text-sm font-medium transition-colors ${
          active === t.id ? "bg-green-600 text-white" : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
        }`}
      >
        {t.label}
      </button>
    ))}
  </div>
);

export const AdminTable = ({ headers, children }) => (
  <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
      <thead className="bg-gray-50 dark:bg-gray-900/50">
        <tr>
          {headers.map((h) => (
            <th
              key={h}
              className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400"
            >
              {h}
            </th>
          ))}
        </tr>
      </thead>
      <tbody className="divide-y divide-gray-100 dark:divide-gray-700/50">{children}</tbody>
    </table>
  </div>
);

export const AdminLoading = ({ message = "Chargement..." }) => (
  <div className="flex h-40 items-center justify-center text-sm text-gray-500 dark:text-gray-400">{message}</div>
);

export const AdminConfirmModal = ({ isOpen, onClose, onConfirm, title, message, confirmLabel = "Supprimer", loading }) => (
  <AdminModal
    isOpen={isOpen}
    onClose={onClose}
    title={title}
    size="sm"
    footer={
      <>
        <AdminButton variant="secondary" onClick={onClose}>
          Annuler
        </AdminButton>
        <AdminButton variant="danger" onClick={onConfirm} disabled={loading}>
          {loading ? "..." : confirmLabel}
        </AdminButton>
      </>
    }
  >
    <p className="text-sm text-gray-700 dark:text-gray-300">{message}</p>
  </AdminModal>
);
