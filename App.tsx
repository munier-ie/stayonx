import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import { Layout } from './components/Layout';
import { Dashboard } from './pages/Dashboard';
import { Leaderboard } from './pages/Leaderboard';
import { Login } from './pages/Login';
import { Spaces } from './pages/Spaces';
import { Settings } from './pages/Settings';
import { Landing } from './pages/Landing';
import { HowItWorks } from './pages/HowItWorks';
import { InstallExtension } from './pages/InstallExtension';
import { Pricing } from './pages/Pricing';
import { NotFound } from './pages/NotFound';
import { PrivacyTerms } from './pages/PrivacyTerms';
import { Advertise } from './pages/Advertise';
import { AdSubmit } from './pages/AdSubmit';
import { ProtectedRoute } from './components/ProtectedRoute';

const App: React.FC = () => {
  return (
    <Router>
      <Toaster 
        position="top-right" 
        toastOptions={{
          style: {
            background: '#111827', // Obsidian
            color: '#FFFFFF', // Canvas White
            border: '1px solid #E5E7EB', // Concrete
            borderRadius: '12px',
            fontFamily: 'Inter, sans-serif',
            fontSize: '14px',
          },
          className: 'sonner-toast-custom',
        }}
      />
      <Layout>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/how-it-works" element={<HowItWorks />} />
          <Route path="/install-extension" element={<InstallExtension />} />
          <Route path="/pricing" element={<Pricing />} />
          <Route path="/pricing" element={<Pricing />} />
          <Route path="/privacy" element={<PrivacyTerms />} />
          <Route path="/advertise" element={<Advertise />} />
          <Route path="/ads/submit" element={<AdSubmit />} />
          
          {/* Protected Routes */}
          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/leaderboard" element={<Leaderboard />} />
            <Route path="/spaces" element={<Spaces />} />
            <Route path="/settings" element={<Settings />} />
          </Route>
          
          {/* Catch-all for 404 */}
          <Route path="/404" element={<NotFound />} />
          <Route path="*" element={<Navigate to="/404" replace />} />
        </Routes>
      </Layout>
    </Router>
  );
};

export default App;