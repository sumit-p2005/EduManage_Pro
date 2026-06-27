import React, { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';

// Guards & Layout
import { ProtectedRoute, AdminRoute } from './components/ProtectedRoutes';
import DashboardLayout from './components/DashboardLayout';

// Public Pages (Loaded synchronously for instant first-paint)
import LandingPage from './pages/LandingPage';

// Lazy-loaded Pages (Loaded asynchronously when routing to them)
const Login = lazy(() => import('./pages/Login'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));
const StudentDashboard = lazy(() => import('./pages/StudentDashboard'));
const StudentManagement = lazy(() => import('./pages/StudentManagement'));
const BatchManagement = lazy(() => import('./pages/BatchManagement'));
const NotesManagement = lazy(() => import('./pages/NotesManagement'));
const TimetableManagement = lazy(() => import('./pages/TimetableManagement'));
const FeesManagement = lazy(() => import('./pages/FeesManagement'));
const Homework = lazy(() => import('./pages/Homework'));
const TestSeries = lazy(() => import('./pages/TestSeries'));
const Announcements = lazy(() => import('./pages/Announcements'));
const Gallery = lazy(() => import('./pages/Gallery'));
const QueriesInbox = lazy(() => import('./pages/QueriesInbox'));

// Premium loading spinner component matching the app's overall aesthetics
const LoadingFallback = () => (
  <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center transition-colors duration-300">
    <div className="flex flex-col items-center gap-4">
      <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin shadow-glow-primary" />
      <span className="font-outfit font-semibold text-sm tracking-wide text-slate-500 dark:text-slate-400">
        Loading EduManage Pro...
      </span>
    </div>
  </div>
);

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
          <Suspense fallback={<LoadingFallback />}>
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
          </Suspense>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
