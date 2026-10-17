import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import AdminDashboardPage from './pages/AdminDashboardPage';
import ComptesUsersPage from './pages/ComptesUsersPage';
import RolesPermissionsPage from './pages/RolesPermissionsPage';
import JournauxPage from './pages/JournauxPage';
import ReferentielsPage from './pages/ReferentielsPage';
import AlertesConfigPage from './pages/AlertesConfigPage';
import ScoringPage from './pages/ScoringPage';
import GeospatialDataPage from './pages/GeospatialDataPage';
import CartographiePage from './pages/CartographiePage';
import SupervisionPage from './pages/SupervisionPage';
import LogsErreursPage from './pages/LogsErreursPage';
import BackupPage from './pages/BackupPage';
import DonneesGlobalesPage from './pages/DonneesGlobalesPage';

const AdminModule = () => {
  return (
    <Routes>
      <Route path="dashboard" element={<AdminDashboardPage />} />
      <Route path="comptes" element={<ComptesUsersPage />} />
      <Route path="roles" element={<RolesPermissionsPage />} />
      <Route path="journaux" element={<JournauxPage />} />
      <Route path="referentiels" element={<ReferentielsPage />} />
      <Route path="alertes-config" element={<AlertesConfigPage />} />
      <Route path="scoring" element={<ScoringPage />} />
      <Route path="geospatial" element={<GeospatialDataPage />} />
      <Route path="cartographie" element={<CartographiePage />} />
      <Route path="supervision" element={<SupervisionPage />} />
      <Route path="logs" element={<LogsErreursPage />} />
      <Route path="backup" element={<BackupPage />} />
      <Route path="donnees" element={<DonneesGlobalesPage />} />
      <Route path="*" element={<Navigate to="dashboard" replace />} />
    </Routes>
  );
};

export default AdminModule;
