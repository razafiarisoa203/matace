// Champ de formulaire générique du module Gestionnaire.
import React from "react";

const Field = ({ label, required, help, children }) => (
  <label className="block">
    <span className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
      {label}
      {required && <span className="ml-1 text-red-500">*</span>}
    </span>
    {children}
    {help && <span className="mt-1 block text-xs text-gray-500 dark:text-gray-400">{help}</span>}
  </label>
);

const inputClass =
  "w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500 dark:border-gray-700 dark:bg-gray-900 dark:text-white";

export const TextField = ({ label, required, help, ...props }) => (
  <Field label={label} required={required} help={help}>
    <input className={inputClass} required={required} {...props} />
  </Field>
);

export const TextAreaField = ({ label, required, help, ...props }) => (
  <Field label={label} required={required} help={help}>
    <textarea className={inputClass} required={required} rows={3} {...props} />
  </Field>
);

export const SelectField = ({ label, required, help, options = [], children, ...props }) => (
  <Field label={label} required={required} help={help}>
    <select className={inputClass} required={required} {...props}>
      {children ||
        options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
    </select>
  </Field>
);

export default Field;
