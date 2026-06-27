import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';

// Guards & Layout
import { ProtectedRoute, AdminRoute } from './components/ProtectedRoutes';
import DashboardLayout from './components/DashboardLayout';

// Public Pages
import LandingPage from './pages/LandingPage';
import Login from './pages/Login';

// Protected Pages
import AdminDashboard from './pages/AdminDashboard';
import StudentDashboard from './pages/StudentDashboard';
import StudentManagement from './pages/StudentManagement';
import BatchManagement from './pages/BatchManagement';
import NotesManagement from './pages/NotesManagement';
import TimetableManagement from './pages/TimetableManagement';
import FeesManagement from './pages/FeesManagement';
import Homework from './pages/Homework';
import TestSeries from './pages/TestSeries';
import Announcements from './pages/Announcements';
import Gallery from './pages/Gallery';
import QueriesInbox from './pages/QueriesInbox';

// Helper component to resolve role dashboard routing
const DashboardRouter = () => {
  const { user } = useAuth();
  if (user?.role === 'admin') {
    return <AdminDashboard />;
  }
  return <StudentDashboard />;
};

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Public Access */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<Login />} />

            {/* Session Guarded Routes */}
            <Route element={<ProtectedRoute />}>
              <Route element={<DashboardLayout />}>
                
                {/* General dashboard routes */}
                <Route path="/dashboard" element={<DashboardRouter />} />
                <Route path="/timetable" element={<TimetableManagement />} />
                <Route path="/notes" element={<NotesManagement />} />
                <Route path="/homework" element={<Homework />} />
                <Route path="/tests" element={<TestSeries />} />
                <Route path="/fees" element={<FeesManagement />} />
                <Route path="/announcements" element={<Announcements />} />
                <Route path="/gallery" element={<Gallery />} />
                <Route path="/queries" element={<QueriesInbox />} />

                {/* Admin Role Guarded routes */}
                <Route element={<AdminRoute />}>
                  <Route path="/students" element={<StudentManagement />} />
                  <Route path="/batches" element={<BatchManagement />} />
                </Route>

              </Route>
            </Route>

            {/* Fallback redirection */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
