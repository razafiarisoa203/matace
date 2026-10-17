// Carte de statistique réutilisable.
import React from "react";

const StatCard = ({ icon: Icon, label, value, tone = "green", onClick, active }) => {
  const tones = {
    green: "bg-green-100 text-green-600 dark:bg-green-900/40 dark:text-green-400",
    blue: "bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-400",
    yellow: "bg-yellow-100 text-yellow-600 dark:bg-yellow-900/40 dark:text-yellow-400",
    red: "bg-red-100 text-red-600 dark:bg-red-900/40 dark:text-red-400",
    gray: "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300",
  };

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={!onClick}
      className={`flex w-full items-center justify-between rounded-lg border-l-4 bg-white p-4 text-left shadow-sm transition-all dark:bg-gray-800 ${
        onClick ? "cursor-pointer hover:shadow-md" : "cursor-default"
      } ${
        active
          ? "border-green-500 ring-2 ring-green-200 dark:ring-green-900/40"
          : "border-transparent"
      }`}
    >
      <div className="flex items-center gap-4">
        {Icon && (
          <div className={`rounded-lg p-3 ${tones[tone] || tones.green}`}>
            <Icon className="h-6 w-6" />
          </div>
        )}
        <div>
          <div className="text-sm font-medium text-gray-500 dark:text-gray-400">{label}</div>
          <div className="text-2xl font-bold text-gray-800 dark:text-gray-100">{value}</div>
        </div>
      </div>
    </button>
  );
};

export default StatCard;
