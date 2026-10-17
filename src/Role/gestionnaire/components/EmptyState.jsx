// État vide réutilisable.
import React from "react";

const EmptyState = ({ icon: Icon, title, description, action }) => (
  <div className="py-12 text-center">
    {Icon && <Icon className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500" />}
    <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-white">{title}</h3>
    {description && (
      <p className="mx-auto mt-1 max-w-md text-sm text-gray-500 dark:text-gray-400">
        {description}
      </p>
    )}
    {action && <div className="mt-6">{action}</div>}
  </div>
);

export default EmptyState;
