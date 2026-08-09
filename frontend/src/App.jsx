
import { useEffect, useState } from 'react';
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from 'react-router-dom';

import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './Dashboard';
import { apiRequest } from './api';

function App() {
  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem('user');
      return savedUser ? JSON.parse(savedUser) : null;
    } catch {
      return null;
    }
  });

  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(false);

  // Load applications after login
  useEffect(() => {
    if (!user) {
      setApplications([]);
      return;
    }

    const loadApplications = async () => {
      setLoading(true);

      try {
        const response = await apiRequest('/api/applications');

        if (!response.ok) {
          console.error('Unable to load applications');
          setApplications([]);
          return;
        }

        const result = await response.json();

        setApplications(result.applications || []);
      } catch (error) {
        console.error('Error loading applications:', error);
        setApplications([]);
      } finally {
        setLoading(false);
      }
    };

    loadApplications();
  }, [user]);

  // Login
  const handleLogin = (userData) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  // Logout
  const handleLogout = () => {
    setUser(null);
    setApplications([]);
    localStorage.removeItem('user');
  };

  return (
    <BrowserRouter>
      <Routes>

        {/* =========================
            LOGIN
        ========================== */}
        <Route
          path="/login"
          element={
            user ? (
              <Navigate to="/" replace />
            ) : (
              <Login onLogin={handleLogin} />
            )
          }
        />

        {/* =========================
            REGISTER
        ========================== */}
        <Route
          path="/register"
          element={
            user ? (
              <Navigate to="/" replace />
            ) : (
              <Register />
            )
          }
        />

        {/* =========================
            DASHBOARD
        ========================== */}
        <Route
          path="/"
          element={
            user ? (
              loading ? (
                <div className="auth-page">
                  <div className="auth-card">
                    <h2>Loading your dashboard...</h2>
                  </div>
                </div>
              ) : (
                <Dashboard
                  user={user}
                  applications={applications}
                  setApplications={setApplications}
                  onLogout={handleLogout}
                />
              )
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />

        {/* =========================
            FALLBACK
        ========================== */}
        <Route
          path="*"
          element={<Navigate to="/" replace />}
        />

      </Routes>
    </BrowserRouter>
  );
}

export default App;

