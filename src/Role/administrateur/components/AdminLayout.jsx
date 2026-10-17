// Layout du module Administrateur : sidebar + header + contenu.
import React, { useEffect, useState } from "react";
import AdminSidebar from "./AdminSidebar";
import HeaderDashboard from "../../../components/HeaderDashboard";

const AdminLayout = ({ children }) => {
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
      <AdminSidebar
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

export default AdminLayout;
