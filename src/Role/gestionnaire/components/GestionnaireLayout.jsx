// Layout du module Gestionnaire : sidebar + header + contenu.
import React, { useEffect, useState } from "react";
import GestionnaireSidebar from "./GestionnaireSidebar";
import HeaderDashboard from "../../../components/HeaderDashboard";

const GestionnaireLayout = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 1024);
    window.addEventListener("resize", handleResize);
    handleResize();
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const toggleSidebar = () => {
    if (isMobile) setIsSidebarOpen((prev) => !prev);
  };

  return (
    <div className="min-h-screen bg-green-50 transition-colors duration-200 dark:bg-gray-900">
      <GestionnaireSidebar
        isSidebarOpen={isSidebarOpen}
        toggleSidebar={toggleSidebar}
        isMobile={isMobile}
      />

      {isMobile && isSidebarOpen && (
        <div
          onClick={toggleSidebar}
          className="fixed inset-0 z-30 bg-black/30 lg:hidden"
        />
      )}

      <div className="flex flex-col lg:ml-64">
        <HeaderDashboard
          toggleSidebar={toggleSidebar}
          isSidebarOpen={isSidebarOpen}
          isMobile={isMobile}
        />
        <main className="mt-16 p-4 sm:p-6">{children}</main>
      </div>
    </div>
  );
};

// En-tête de page réutilisable (titre + description + actions).
export const PageHeader = ({ title, description, actions, breadcrumb }) => (
  <div className="mb-6">
    {breadcrumb && <div className="mb-3">{breadcrumb}</div>}
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{title}</h1>
        {description && (
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">{description}</p>
        )}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  </div>
);

export default GestionnaireLayout;
