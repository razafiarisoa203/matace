import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import CitoyenDashboardPage from "./pages/CitoyenDashboardPage";
import NouveauSignalementPage from "./pages/NouveauSignalementPage";
import MesSignalementsPage from "./pages/MesSignalementsPage";
import SignalementDetailPage from "./pages/SignalementDetailPage";
import CartePubliquePage from "./pages/CartePubliquePage";
import InfrastructuresPubliquesPage from "./pages/InfrastructuresPubliquesPage";
import InterventionsPubliquesPage from "./pages/InterventionsPubliquesPage";
import NotificationsPage from "./pages/NotificationsPage";
import ProfilPage from "./pages/ProfilPage";

const CitoyenModule = () => {
  return (
    <Routes>
      <Route path="dashboard" element={<CitoyenDashboardPage />} />
      <Route path="signalements" element={<MesSignalementsPage />} />
      <Route path="signalements/nouveau" element={<NouveauSignalementPage />} />
      <Route path="signalements/:id" element={<SignalementDetailPage />} />
      <Route path="carte" element={<CartePubliquePage />} />
      <Route path="infrastructures" element={<InfrastructuresPubliquesPage />} />
      <Route path="interventions" element={<InterventionsPubliquesPage />} />
      <Route path="notifications" element={<NotificationsPage />} />
      <Route path="profil" element={<ProfilPage />} />
      <Route path="*" element={<Navigate to="dashboard" replace />} />
    </Routes>
  );
};

export default CitoyenModule;
