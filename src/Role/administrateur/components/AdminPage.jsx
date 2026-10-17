import React from 'react';

const AdminPage = ({ title, description, actions, children }) => {
  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-white">{title}</h1>
          {description && (
            <p className="text-slate-400 mt-1 max-w-3xl">{description}</p>
          )}
        </div>
        {actions && <div className="flex items-center gap-2">{actions}</div>}
      </div>

      <div className="bg-slate-900 border border-slate-700 rounded-lg p-6">
        {children}
      </div>
    </div>
  );
};

export default AdminPage;
