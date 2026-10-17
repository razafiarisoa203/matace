// Point d'entrée du module Administrateur.
export { default as AdminModule } from './AdminModule';
export { default as AdminLayout } from './components/AdminLayout';
export { default as AdminSidebar } from './components/AdminSidebar';
export { default as AdminDashboardPage } from './pages/AdminDashboardPage';
export { default as ComptesUsersPage } from './pages/ComptesUsersPage';
export { default as RolesPermissionsPage } from './pages/RolesPermissionsPage';
export { default as JournauxPage } from './pages/JournauxPage';
export { default as ReferentielsPage } from './pages/ReferentielsPage';
export { default as AlertesConfigPage } from './pages/AlertesConfigPage';
export { default as ScoringPage } from './pages/ScoringPage';
export { default as GeospatialDataPage } from './pages/GeospatialDataPage';
export { default as CartographiePage } from './pages/CartographiePage';
export { default as SupervisionPage } from './pages/SupervisionPage';
export { default as LogsErreursPage } from './pages/LogsErreursPage';
export { default as BackupPage } from './pages/BackupPage';
export { default as DonneesGlobalesPage } from './pages/DonneesGlobalesPage';
export { adminService } from './services/adminService';
export * from './constants';
