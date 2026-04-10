import React from 'react';
import { BrowserRouter as Router, Navigate, Route, Routes } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login/Login';
import Register from './pages/Register/Register';
import Dashboard from './pages/Dashboard/Dashboard';
import Courses from './pages/Courses/Courses';
import Settings from './pages/Settings/Settings';
import Calendar from './pages/Calendar/Calendar';
import Help from './pages/Help/Help';
import Chat from './pages/Chat/Chat';
import Upload from './pages/Upload/Upload';
import Users from './pages/Admin/Users';
import Resources from './pages/Admin/Resources';

const HomeRedirect = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return null;
  }

  return <Navigate to={user ? '/dashboard' : '/login'} replace />;
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/" element={<HomeRedirect />} />

          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/courses"
            element={
              <ProtectedRoute>
                <Courses />
              </ProtectedRoute>
            }
          />

          <Route
            path="/downloads"
            element={
              <ProtectedRoute>
                <Courses />
              </ProtectedRoute>
            }
          />

          <Route
            path="/settings"
            element={
              <ProtectedRoute>
                <Settings />
              </ProtectedRoute>
            }
          />

          <Route
            path="/calendar"
            element={
              <ProtectedRoute>
                <Calendar />
              </ProtectedRoute>
            }
          />

          <Route
            path="/help"
            element={
              <ProtectedRoute>
                <Help />
              </ProtectedRoute>
            }
          />

          <Route
            path="/chat"
            element={
              <ProtectedRoute requiredRoles={['enseignant', 'etudiant']}>
                <Chat />
              </ProtectedRoute>
            }
          />

          <Route
            path="/upload"
            element={
              <ProtectedRoute requiredRoles={['enseignant', 'admin']}>
                <Upload />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/users"
            element={
              <ProtectedRoute requiredRole="admin">
                <Users />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/resources"
            element={
              <ProtectedRoute requiredRole="admin">
                <Resources />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/stats"
            element={
              <ProtectedRoute requiredRole="admin">
                <Resources />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/resources/edit/:id"
            element={
              <ProtectedRoute requiredRole="admin">
                <div
                  style={{
                    padding: '2rem',
                    textAlign: 'center',
                    background: 'white',
                    borderRadius: '12px',
                    margin: '2rem',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                  }}
                >
                  <h1 style={{ color: '#0f2b4b', marginBottom: '1rem' }}>Page d'édition de ressource</h1>
                  <p style={{ color: '#6b7280' }}>Cette fonctionnalité est en cours de développement...</p>
                </div>
              </ProtectedRoute>
            }
          />

          <Route path="*" element={<HomeRedirect />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
