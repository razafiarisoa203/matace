import React from "react";
import { NavLink } from "react-router-dom";
import {
  Home,
  FilePlus,
  List,
  Map,
  Building2,
  Bell,
  ThumbsUp,
  User,
  LogOut,
} from "lucide-react";
import { logout as ssoLogout } from "../../../utils/logout";

const menuItems = [
  { title: "Tableau de bord", icon: Home, path: "/citoyen/dashboard" },
  { title: "Nouveau signalement", icon: FilePlus, path: "/citoyen/signalements/nouveau" },
  { title: "Mes signalements", icon: List, path: "/citoyen/signalements" },
  { title: "Carte publique", icon: Map, path: "/citoyen/carte" },
  { title: "Infrastructures publiques", icon: Building2, path: "/citoyen/infrastructures" },
  { title: "Interventions publiques", icon: ThumbsUp, path: "/citoyen/interventions" },
  { title: "Notifications", icon: Bell, path: "/citoyen/notifications" },
  { title: "Mon profil", icon: User, path: "/citoyen/profil" },
];

const CitoyenSidebar = ({ isSidebarOpen, toggleSidebar, isMobile }) => {
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
            <Home className="h-5 w-5 text-white" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200">MATAC</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">Espace Citoyen</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto p-2">
        <ul className="space-y-0.5">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <li key={item.path}>
                <NavLink
                  to={item.path}
                  end={item.path === "/citoyen/dashboard"}
                  onClick={() => isMobile && toggleSidebar()}
                  className={({ isActive }) =>
                    `flex items-center rounded-md border-l-4 px-3 py-2 transition-all duration-200 ${
                      isActive
                        ? "border-green-500 bg-green-50 text-green-700 shadow-sm dark:bg-green-900/20 dark:text-green-400"
                        : "border-transparent text-gray-700 hover:border-gray-300 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-700"
                    }`
                  }
                >
                  <Icon className="mr-2.5 h-4 w-4 flex-shrink-0" />
                  <span className="text-sm">{item.title}</span>
                </NavLink>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="border-t border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800">
        <button
          onClick={handleLogout}
          className="flex w-full items-center justify-center rounded-lg bg-red-500 px-4 py-2.5 text-white transition-all duration-200 hover:bg-red-600"
        >
          <LogOut className="mr-2 h-4 w-4" />
          <span className="font-medium">Déconnexion</span>
        </button>
      </div>
    </aside>
  );
};

export default CitoyenSidebar;
