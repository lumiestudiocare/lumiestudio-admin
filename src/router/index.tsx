import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from '../store';
import { LoginPage }         from '../views/auth/LoginPage';
import { DashboardPage }     from '../views/dashboard/DashboardPage';
import { BookingsPage }      from '../views/bookings/BookingsPage';
import { ProfessionalsPage } from '../views/professionals/ProfessionalsPage';
import { ServicesPage }      from '../views/services/ServicesPage';
import { ReportsPage }       from '../views/reports/ReportsPage';
import { ChatPage }          from '../views/chat/ChatPage';
import { ClientsPage }       from '../views/clients/ClientsPage';

const Protected: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuthStore();
  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--blush)' }}>
      <span className="spinner" style={{ width: 32, height: 32 }} />
    </div>
  );
  return user ? <>{children}</> : <Navigate to="/login" replace />;
};

export const AppRouter: React.FC = () => {
  const init = useAuthStore(s => s.init);
  useEffect(() => { init(); }, []);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/dashboard"     element={<Protected><DashboardPage /></Protected>} />
        <Route path="/bookings"      element={<Protected><BookingsPage /></Protected>} />
        <Route path="/professionals" element={<Protected><ProfessionalsPage /></Protected>} />
        <Route path="/services"      element={<Protected><ServicesPage /></Protected>} />
        <Route path="/reports"       element={<Protected><ReportsPage /></Protected>} />
        <Route path="/chat"          element={<Protected><ChatPage /></Protected>} />
        <Route path="/clients"       element={<Protected><ClientsPage /></Protected>} />
        <Route path="*"              element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
};
