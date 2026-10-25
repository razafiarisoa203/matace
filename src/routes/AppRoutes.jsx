import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { useContext, useEffect } from "react";

// Auth SSO
import Callback from "../pages/Authentification/Callback";
import RegisterComplete from "../pages/Authentification/RegisterComplete";

// Pages principales
import HomePage from "../pages/HomePage";
import Dashboard from "../pages/Dashboard";

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
import RoleManagement from "../pages/RoleAppli/Role";

// Route protégée (vérifie le JWT via /serviceauth/auth/verify-token)
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
        <Route
          path="/dashboard"
          element={
            <ProfileRequiredRoute>
              <Dashboard />
            </ProfileRequiredRoute>
          }
        />
        <Route
          path="/dashboard-client"
          element={
            <ProfileRequiredRoute>
              <Dashboard />
            </ProfileRequiredRoute>
          }
        />

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

        {/* Admin & Profile */}
        <Route path="/admin-dashboard" element={<Navigate to="/" replace />} />
        <Route path="/admin" element={<Navigate to="/" replace />} />
        <Route path="/users" element={<Navigate to="/RoleManagement" replace />} />
        <Route
          path="/RoleManagement"
          element={
            <ProfileRequiredRoute>
              <RoleManagement />
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
