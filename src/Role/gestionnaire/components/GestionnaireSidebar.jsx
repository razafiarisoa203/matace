// Menu latéral du module Gestionnaire.
import React from "react";
import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Building2,
  MapPinned,
  MessageSquareWarning,
  Wrench,
  Upload,
  BellRing,
  FileBarChart,
  ShieldCheck,
  LogOut,
} from "lucide-react";
import { logout as ssoLogout } from "../../../utils/logout";

const menuItems = [
  { title: "Tableau de bord", icon: LayoutDashboard, path: "/gestionnaire" },
  { title: "Infrastructures", icon: Building2, path: "/gestionnaire/infrastructures" },
  { title: "Carte & couches", icon: MapPinned, path: "/gestionnaire/carte" },
  { title: "Signalements", icon: MessageSquareWarning, path: "/gestionnaire/signalements" },
  { title: "Interventions", icon: Wrench, path: "/gestionnaire/interventions" },
  { title: "Import SIG", icon: Upload, path: "/gestionnaire/import" },
  { title: "Alertes", icon: BellRing, path: "/gestionnaire/alertes" },
  { title: "Rapports & export", icon: FileBarChart, path: "/gestionnaire/rapports" },
  { title: "Cadre du rôle", icon: ShieldCheck, path: "/gestionnaire/role" },
];

const GestionnaireSidebar = ({ isSidebarOpen, toggleSidebar, isMobile }) => {
  const handleLogout = async () => {
    try {
      await ssoLogout();
    } catch (error) {
      console.error("Erreur de déconnexion :", error);
    }
  };

  return (
    <aside
      className={`fixed left-0 top-0 z-40 flex h-screen w-64 flex-col border-r border-gray-200 bg-white shadow-lg transition-transform duration-300 dark:border-gray-700 dark:bg-gray-800 ${
        isMobile ? (isSidebarOpen ? "translate-x-0" : "-translate-x-full") : ""
      }`}
    >
      <div className="border-b border-gray-200 p-4 dark:border-gray-700">
        <div className="flex items-center space-x-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-500">
            <Wrench className="h-5 w-5 text-white" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200">MATAC</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">Espace Gestionnaire</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto p-2">
        <ul className="space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <li key={item.path}>
                <NavLink
                  to={item.path}
                  end={item.path === "/gestionnaire"}
                  onClick={() => isMobile && toggleSidebar()}
                  className={({ isActive }) =>
                    `flex items-center rounded-lg border-l-4 px-4 py-3 transition-all duration-200 ${
                      isActive
                        ? "border-green-500 bg-green-50 text-green-700 shadow-sm dark:bg-green-900/20 dark:text-green-400"
                        : "border-transparent text-gray-700 hover:border-gray-300 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-700"
                    }`
                  }
                >
                  <Icon className="mr-3 h-5 w-5 flex-shrink-0" />
                  <span className="text-sm font-medium">{item.title}</span>
                </NavLink>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="border-t border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800">
        <button
          onClick={handleLogout}
          className="flex w-full items-center justify-center rounded-lg bg-red-500 px-4 py-3 text-white transition-all duration-200 hover:bg-red-600"
        >
          <LogOut className="mr-2 h-4 w-4" />
          <span className="font-medium">Déconnexion</span>
        </button>
      </div>
    </aside>
  );
};

export default GestionnaireSidebar;
