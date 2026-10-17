// Graphiques CSS légers (aucune librairie de charts requise).
import React from "react";

// Barres simples verticales.
export const BarChart = ({ data = [], height = 180, formatValue = (v) => v }) => {
  const max = Math.max(1, ...data.map((d) => Number(d.value) || 0));
  return (
    <div className="flex items-end gap-3" style={{ height }}>
      {data.map((d) => {
        const valeur = Number(d.value) || 0;
        const h = Math.max(4, (valeur / max) * (height - 30));
        return (
          <div key={d.label} className="flex flex-1 flex-col items-center justify-end">
            <span className="mb-1 text-xs font-semibold text-gray-700 dark:text-gray-200">
              {formatValue(valeur)}
            </span>
            <div
              className="w-full rounded-t-md transition-all"
              style={{ height: h, backgroundColor: d.color || "#16a34a" }}
              title={`${d.label} : ${formatValue(valeur)}`}
            />
            <span className="mt-1 w-full truncate text-center text-[11px] text-gray-500 dark:text-gray-400">
              {d.label}
            </span>
          </div>
        );
      })}
    </div>
  );
};

// Barres groupées (plusieurs séries par catégorie).
export const GroupedBarChart = ({ data = [], series = [], height = 180 }) => {
  const max = Math.max(
    1,
    ...data.flatMap((d) => series.map((s) => Number(d[s.key]) || 0))
  );
  return (
    <div>
      <div className="mb-3 flex flex-wrap items-center gap-4">
        {series.map((s) => (
          <span key={s.key} className="flex items-center gap-1.5 text-xs text-gray-600 dark:text-gray-300">
            <span className="inline-block h-3 w-3 rounded-sm" style={{ backgroundColor: s.color }} />
            {s.label}
          </span>
        ))}
      </div>
      <div className="flex items-end gap-4" style={{ height }}>
        {data.map((d) => (
          <div key={d.label} className="flex flex-1 flex-col items-center justify-end">
            <div className="flex h-full w-full items-end justify-center gap-1">
              {series.map((s) => {
                const valeur = Number(d[s.key]) || 0;
                const h = Math.max(3, (valeur / max) * (height - 30));
                return (
                  <div
                    key={s.key}
                    className="w-1/2 max-w-[18px] rounded-t-md"
                    style={{ height: h, backgroundColor: s.color }}
                    title={`${d.label} · ${s.label} : ${valeur}`}
                  />
                );
              })}
            </div>
            <span className="mt-1 text-[11px] text-gray-500 dark:text-gray-400">{d.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

// Jauge horizontale de progression (0-100).
export const ProgressBar = ({ value = 0, color = "#16a34a", label }) => (
  <div>
    {label && (
      <div className="mb-1 flex justify-between text-xs text-gray-500 dark:text-gray-400">
        <span>{label}</span>
        <span>{value}%</span>
      </div>
    )}
    <div className="h-2 w-full overflow-hidden rounded-full bg-gray-100 dark:bg-gray-700">
      <div className="h-full rounded-full" style={{ width: `${Math.min(100, value)}%`, backgroundColor: color }} />
    </div>
  </div>
);
