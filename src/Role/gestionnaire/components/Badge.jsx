// Badge de statut générique (couleurs clair/sombre).
import React from "react";

const Badge = ({ config, className = "" }) => {
  const c = config || {
    label: "—",
    color: "bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700",
  };
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${c.color} ${className}`}
    >
      {c.label}
    </span>
  );
};

export default Badge;
