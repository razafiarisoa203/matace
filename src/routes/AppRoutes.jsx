import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { useContext, useEffect } from "react";

// Auth SSO
import Callback from "../pages/Authentification/Callback";
import RegisterComplete from "../pages/Authentification/RegisterComplete";

// Pages principales
import HomePage from "../pages/HomePage";

// Alignement
import Allignement from "../pages/Allignement";
import AlignmentDetailsPage from "../pages/AlignmentDetailsPage";
import AlignmentListPage from "../pages/AlignmentListPage";

// Autres
import PermisConstruction from "../components/PermisConstruction";
import ConstructionListPage from "../pages/ConstructionListPage";
import ConstructionDetailsPage from '../pages/ConstructionDetailsPage';
import PermisRemblai from '../pages/PermisRemblai';
import PrescriptionUrbanisme from '../pages/PrescriptionUrbanisme';

// Admin & Profile
import UsersList from "../components/Users/UsersList";
import RoleManagement from "../pages/RoleAppli/Role";

// Module Gestionnaire
import GestionnaireDashboard from "../Role/gestionnaire/pages/GestionnaireDashboard";
import InfrastructuresPage from "../Role/gestionnaire/pages/InfrastructuresPage";
import InfrastructureDetailPage from "../Role/gestionnaire/pages/InfrastructureDetailPage";
import SignalementsPage from "../Role/gestionnaire/pages/SignalementsPage";
import InterventionsPage from "../Role/gestionnaire/pages/InterventionsPage";
import ImportPage from "../Role/gestionnaire/pages/ImportPage";
import CartePage from "../Role/gestionnaire/pages/CartePage";
import AlertesPage from "../Role/gestionnaire/pages/AlertesPage";
import RapportsPage from "../Role/gestionnaire/pages/RapportsPage";
import RoleGestionnairePage from "../Role/gestionnaire/pages/RoleGestionnairePage";

// Module Décideur
import DecideurDashboard from "../Role/decideur/pages/DecideurDashboard";
import DecideurCartePage from "../Role/decideur/pages/DecideurCartePage";
import DecideurTerritoiresPage from "../Role/decideur/pages/DecideurTerritoiresPage";
import DecideurPrioritesPage from "../Role/decideur/pages/DecideurPrioritesPage";
import DecideurPlansPage from "../Role/decideur/pages/DecideurPlansPage";
import DecideurProjetsPage from "../Role/decideur/pages/DecideurProjetsPage";
import DecideurBudgetPage from "../Role/decideur/pages/DecideurBudgetPage";
import DecideurSignalementsPage from "../Role/decideur/pages/DecideurSignalementsPage";
import DecideurAlertesPage from "../Role/decideur/pages/DecideurAlertesPage";
import DecideurRapportsPage from "../Role/decideur/pages/DecideurRapportsPage";
import RoleDecideurPage from "../Role/decideur/pages/RoleDecideurPage";

// Module Administrateur
import { AdminModule } from "../Role/administrateur";

// Module Citoyen
import { CitoyenModule } from "../Role/citoyen";

// Route protégée (vérifie le JWT via /serviceauth/auth/verify-token)
import PrivateRoute from "../components/auth/PrivateRoute";
import AuthenticatedRoute from "../components/auth/AuthenticatedRoute";
import ProfileRequiredRoute from "../components/auth/ProfileRequiredRoute";
import { AuthContext } from "../context/AuthContext";
import { getProfileCompletion } from "../utils/profileUtils";

function ProfileVerificationLogger() {
  const { pathname } = useLocation();
  const { user } = useContext(AuthContext);

  useEffect(() => {
    const profileStatus = getProfileCompletion(user);

    console.info("[Vérification profil]", {
      page: pathname,
      user_id: profileStatus.user_id,
      id_citizen: profileStatus.id_citizen,
      complete: profileStatus.complete,
      champs_manquants: profileStatus.missingFields,
    });
  }, [pathname, user]);

  return null;
}

function App() {
  return (
    <Router>
      <ProfileVerificationLogger />
      <Routes>
        {/* Public */}
        <Route path="/" element={<HomePage />} />
        <Route path="/callback" element={<Callback />} />
        <Route
          path="/register-complete"
          element={
            <AuthenticatedRoute>
              <RegisterComplete />
            </AuthenticatedRoute>
          }
        />
        <Route path="/permis" element={<PermisConstruction />} />

        {/* Protected Routes */}
        <Route path="/dashboard" element={<Navigate to="/citoyen/dashboard" replace />} />
        <Route path="/dashboard-client" element={<Navigate to="/citoyen/dashboard" replace />} />

        {/* Alignement */}
        <Route
          path="/alignement"
          element={
            <ProfileRequiredRoute>
              <Allignement />
            </ProfileRequiredRoute>
          }
        />
        <Route
          path="/alignement-list"
          element={
            <ProfileRequiredRoute>
              <AlignmentListPage />
            </ProfileRequiredRoute>
          }
        />
        <Route
          path="/alignment-details/:id"
          element={
            <ProfileRequiredRoute>
              <AlignmentDetailsPage />
            </ProfileRequiredRoute>
          }
        />

        <Route
          path="/prescription-urbanisme"
          element={
            <ProfileRequiredRoute>
              <PrescriptionUrbanisme />
            </ProfileRequiredRoute>
          }
        />

        {/* Permis */}
        <Route
          path="/permis-list"
          element={
            <ProfileRequiredRoute>
              <ConstructionListPage />
            </ProfileRequiredRoute>
          }
        />
        <Route
          path="/permis-details/:id"
          element={
            <ProfileRequiredRoute>
              <ConstructionDetailsPage />
            </ProfileRequiredRoute>
          }
        />
        <Route
          path="/permis-remblai"
          element={
            <ProfileRequiredRoute>
              <PermisRemblai />
            </ProfileRequiredRoute>
          }
        />

        {/* Admin */}
        <Route path="/admin-dashboard" element={<Navigate to="/admin/dashboard" replace />} />
        <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
        {/* Module Administrateur */}
        <Route
          path="/admin/*"
          element={
            <ProfileRequiredRoute>
              <AdminModule />
            </ProfileRequiredRoute>
          }
        />
        {/* Module Citoyen */}
        <Route path="/citoyen" element={<Navigate to="/citoyen/dashboard" replace />} />
        <Route
          path="/citoyen/*"
          element={
            <ProfileRequiredRoute>
              <CitoyenModule />
            </ProfileRequiredRoute>
          }
        />
        <Route
          path="/users"
          element={
            <ProfileRequiredRoute>
              <UsersList />
            </ProfileRequiredRoute>
          }
        />
        <Route
          path="/RoleManagement"
          element={
            <ProfileRequiredRoute>
              <RoleManagement />
            </ProfileRequiredRoute>
          }
        />

        {/* Module Gestionnaire */}
        <Route
          path="/gestionnaire"
          element={
            <ProfileRequiredRoute>
              <GestionnaireDashboard />
            </ProfileRequiredRoute>
          }
        />
        <Route
          path="/gestionnaire/infrastructures"
          element={
            <ProfileRequiredRoute>
              <InfrastructuresPage />
            </ProfileRequiredRoute>
          }
        />
        <Route
          path="/gestionnaire/infrastructures/:id"
          element={
            <ProfileRequiredRoute>
              <InfrastructureDetailPage />
            </ProfileRequiredRoute>
          }
        />
        <Route
          path="/gestionnaire/signalements"
          element={
            <ProfileRequiredRoute>
              <SignalementsPage />
            </ProfileRequiredRoute>
          }
        />
        <Route
          path="/gestionnaire/interventions"
          element={
            <ProfileRequiredRoute>
              <InterventionsPage />
            </ProfileRequiredRoute>
          }
        />
        <Route
          path="/gestionnaire/import"
          element={
            <ProfileRequiredRoute>
              <ImportPage />
            </ProfileRequiredRoute>
          }
        />
        <Route
          path="/gestionnaire/carte"
          element={
            <ProfileRequiredRoute>
              <CartePage />
            </ProfileRequiredRoute>
          }
        />
        <Route
          path="/gestionnaire/alertes"
          element={
            <ProfileRequiredRoute>
              <AlertesPage />
            </ProfileRequiredRoute>
          }
        />
        <Route
          path="/gestionnaire/rapports"
          element={
            <ProfileRequiredRoute>
              <RapportsPage />
            </ProfileRequiredRoute>
          }
        />
        <Route
          path="/gestionnaire/role"
          element={
            <ProfileRequiredRoute>
              <RoleGestionnairePage />
            </ProfileRequiredRoute>
          }
        />

        {/* Module Décideur */}
        <Route
          path="/decideur"
          element={
            <ProfileRequiredRoute>
              <DecideurDashboard />
            </ProfileRequiredRoute>
          }
        />
        <Route
          path="/decideur/carte"
          element={
            <ProfileRequiredRoute>
              <DecideurCartePage />
            </ProfileRequiredRoute>
          }
        />
        <Route
          path="/decideur/territoires"
          element={
            <ProfileRequiredRoute>
              <DecideurTerritoiresPage />
            </ProfileRequiredRoute>
          }
        />
        <Route
          path="/decideur/priorites"
          element={
            <ProfileRequiredRoute>
              <DecideurPrioritesPage />
            </ProfileRequiredRoute>
          }
        />
        <Route
          path="/decideur/plans"
          element={
            <ProfileRequiredRoute>
              <DecideurPlansPage />
            </ProfileRequiredRoute>
          }
        />
        <Route
          path="/decideur/projets"
          element={
            <ProfileRequiredRoute>
              <DecideurProjetsPage />
            </ProfileRequiredRoute>
          }
        />
        <Route
          path="/decideur/budget"
          element={
            <ProfileRequiredRoute>
              <DecideurBudgetPage />
            </ProfileRequiredRoute>
          }
        />
        <Route
          path="/decideur/signalements"
          element={
            <ProfileRequiredRoute>
              <DecideurSignalementsPage />
            </ProfileRequiredRoute>
          }
        />
        <Route
          path="/decideur/alertes"
          element={
            <ProfileRequiredRoute>
              <DecideurAlertesPage />
            </ProfileRequiredRoute>
          }
        />
        <Route
          path="/decideur/rapports"
          element={
            <ProfileRequiredRoute>
              <DecideurRapportsPage />
            </ProfileRequiredRoute>
          }
        />
        <Route
          path="/decideur/role"
          element={
            <ProfileRequiredRoute>
              <RoleDecideurPage />
            </ProfileRequiredRoute>
          }
        />

        {/* Catch-all pour les routes inconnues */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;

