import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

import SplashScreen from './components/SplashScreen';
import BottomNav from './components/BottomNav';
import AiChatbot from './components/AiChatbot';

import HomeDashboard from './pages/HomeDashboard';
import Login from './pages/Login';
import Register from './pages/Register';
import NearbyFoodScreen from './pages/NearbyFoodScreen';
import RequestFoodScreen from './pages/RequestFoodScreen';
import VolunteerScreen from './pages/VolunteerScreen';
import NotificationsScreen from './pages/NotificationsScreen';
import ProfileScreen from './pages/ProfileScreen';

import DonorDashboard from './pages/DonorDashboard';
import AdminDashboard from './pages/AdminDashboard';
import NgoPendingScreen from './pages/NgoPendingScreen';
import NgoRejectedScreen from './pages/NgoRejectedScreen';
import HomePage from './pages/HomePage';

import ReceiverDashboardLayout from './components/receiver/ReceiverDashboardLayout';
import ReceiverHome from './components/receiver/ReceiverHome';
import ReceiverFoodDetail from './components/receiver/ReceiverFoodDetail';
import ReceiverClaimsList from './components/receiver/ReceiverClaimsList';
import ReceiverClaimDetail from './components/receiver/ReceiverClaimDetail';
import ReceiverPickupMap from './components/receiver/ReceiverPickupMap';
import ReceiverDashboard from './components/receiver/ReceiverDashboard';
import ReceiverRequests from './components/receiver/ReceiverRequests';
import ReceiverImpact from './components/receiver/ReceiverImpact';
import ReceiverNotifications from './components/receiver/ReceiverNotifications';
import ReceiverHistory from './components/receiver/ReceiverHistory';
import ReceiverProfile from './components/receiver/ReceiverProfile';

import NgoDashboardLayout from './components/ngo/NgoDashboardLayout';
import NgoDashboard from './components/ngo/NgoDashboard';
import NgoFindFood from './components/ngo/NgoFindFood';
import NgoFoodDetail from './components/ngo/NgoFoodDetail';
import NgoClaims from './components/ngo/NgoClaims';
import NgoPickupMap from './components/ngo/NgoPickupMap';
import NgoRequests from './components/ngo/NgoRequests';
import NgoBeneficiaries from './components/ngo/NgoBeneficiaries';
import NgoDistribution from './components/ngo/NgoDistribution';
import NgoImpact from './components/ngo/NgoImpact';
import NgoNotifications from './components/ngo/NgoNotifications';
import NgoProfile from './components/ngo/NgoProfile';
import NgoSettings from './components/ngo/NgoSettings';
// Route Guard — strictly enforces role-based access using the DB role from auth state
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, token } = useAuth();

  // 1. Not logged in → always go to login
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  const dbRole = user?.role; // ALWAYS from the database, never guessed

  // 2. NGO approval gate (checked before allowedRoles, only for NGO users)
  if (dbRole === 'ngo') {
    const currentPath = window.location.pathname;
    if (user.status === 'pending_approval' && currentPath !== '/ngo-pending') {
      return <Navigate to="/ngo-pending" replace />;
    }
    if (user.status === 'rejected' && currentPath !== '/ngo-rejected') {
      return <Navigate to="/ngo-rejected" replace />;
    }
  }

  // 3. Role access check — every role is strictly separated
  const hasAccess = !allowedRoles || (dbRole && allowedRoles.includes(dbRole));

  if (!hasAccess && dbRole) {
    // Redirect to the correct dashboard for that role — never silently allow cross-access
    if (dbRole === 'admin') return <Navigate to="/admin/dashboard" replace />;
    if (dbRole === 'ngo') {
      if (user.status === 'pending_approval') return <Navigate to="/ngo-pending" replace />;
      if (user.status === 'rejected') return <Navigate to="/ngo-rejected" replace />;
      return <Navigate to="/ngo/dashboard" replace />;
    }
    if (dbRole === 'receiver') return <Navigate to="/receiver/dashboard" replace />;
    if (dbRole === 'donor') return <Navigate to="/donor/dashboard" replace />;
    // Unknown role — send to login, never to a random dashboard
    return <Navigate to="/login" replace />;
  }

  return children;
};


const AppContent = () => {
  const [showSplash, setShowSplash] = useState(true);
  const { token, user } = useAuth();

  return (
    <>
      {/* 1. Splash Screen Overlay */}
      {showSplash && <SplashScreen onComplete={() => setShowSplash(false)} />}

      {/* Main Screen Routes */}
      <Routes>
        {/* Auto-redirect root to the correct dashboard based on DB role */}
        <Route path="/" element={
          user ? (
            user.role === 'admin'    ? <Navigate to="/admin/dashboard"    replace /> :
            user.role === 'ngo'      ? <Navigate to="/ngo/dashboard"      replace /> :
            user.role === 'receiver' ? <Navigate to="/receiver/dashboard" replace /> :
            user.role === 'donor'    ? <Navigate to="/donor/dashboard"    replace /> :
            <Navigate to="/login" replace />   /* unknown role → login */
          ) : <HomeDashboard />
        } />
        <Route path="/classic-home" element={<HomePage />} />

        {/* 2. Login / Sign Up */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* 5 & 6. Nearby Food & Food Details */}
        <Route path="/nearby" element={<NearbyFoodScreen />} />

        {/* 7. Request Food Screen */}
        <Route path="/request" element={<RequestFoodScreen />} />

        {/* 8. Volunteer Screen */}
        <Route path="/volunteer" element={<VolunteerScreen />} />


        {/* 10. Notifications Screen */}
        <Route path="/notifications" element={<NotificationsScreen />} />

        {/* 11. Profile Screen */}
        <Route path="/profile" element={<ProfileScreen />} />

        {/* 12. Dashboards */}
        <Route path="/donor" element={<Navigate to="/donor/dashboard" replace />} />
        <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
        <Route path="/donor/dashboard" element={
          <ProtectedRoute allowedRoles={['donor']}>
            <DonorDashboard />
          </ProtectedRoute>
        } />
        
        <Route path="/receiver" element={
          <ProtectedRoute allowedRoles={['receiver']}>
            <ReceiverDashboardLayout />
          </ProtectedRoute>
        }>
          <Route path="dashboard" element={<ReceiverDashboard />} />
          <Route path="find-food" element={<ReceiverHome />} />
          <Route path="food/:id" element={<ReceiverFoodDetail />} />
          <Route path="claims" element={<ReceiverClaimsList />} />
          <Route path="claims/:id" element={<ReceiverClaimDetail />} />
          <Route path="pickup/:id" element={<ReceiverPickupMap />} />
          <Route path="requests" element={<ReceiverRequests />} />
          <Route path="impact" element={<ReceiverImpact />} />
          <Route path="history" element={<ReceiverHistory />} />
          <Route path="profile" element={<ReceiverProfile />} />
          <Route path="notifications" element={<ReceiverNotifications />} />
        </Route>

        {/* NGO Operational Routes */}
        <Route path="/ngo" element={
          <ProtectedRoute allowedRoles={['ngo']}>
            <NgoDashboardLayout />
          </ProtectedRoute>
        }>
          <Route index element={<Navigate to="/ngo/dashboard" replace />} />
          <Route path="dashboard" element={<NgoDashboard />} />
          <Route path="find-food" element={<NgoFindFood />} />
          <Route path="food/:id" element={<NgoFoodDetail />} />
          <Route path="claims" element={<NgoClaims />} />
          <Route path="pickup/:id" element={<NgoPickupMap />} />
          <Route path="requests" element={<NgoRequests />} />
          <Route path="beneficiaries" element={<NgoBeneficiaries />} />
          <Route path="distribution" element={<NgoDistribution />} />
          <Route path="impact" element={<NgoImpact />} />
          <Route path="notifications" element={<NgoNotifications />} />
          <Route path="profile" element={<NgoProfile />} />
          <Route path="settings" element={<NgoSettings />} />
        </Route>
        
        <Route path="/ngo-pending" element={
          <ProtectedRoute allowedRoles={['ngo']}>
            <NgoPendingScreen />
          </ProtectedRoute>
        } />
        
        <Route path="/ngo-rejected" element={
          <ProtectedRoute allowedRoles={['ngo']}>
            <NgoRejectedScreen />
          </ProtectedRoute>
        } />
        
        <Route path="/admin/dashboard" element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminDashboard />
          </ProtectedRoute>
        } />
        
        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      {/* Sticky Light Bottom Navigation Bar */}
      <BottomNav />

      {/* Global AI Chatbot for Donors and Receivers */}
      {token && (user?.role === 'donor' || user?.role === 'receiver') && <AiChatbot />}
    </>
  );
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </Router>
  );
}

export default App;
