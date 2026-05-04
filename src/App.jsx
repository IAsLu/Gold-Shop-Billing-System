import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import ProductList from './pages/ProductList';
import ProductForm from './pages/ProductForm';
import BillingCreate from './pages/BillingCreate';
import InvoiceView from './pages/InvoiceView';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);

  useEffect(() => {
    const user = localStorage.getItem('user');
    if (user) {
      setIsAuthenticated(true);
    }
    setCheckingAuth(false);
  }, []);

  const handleLogin = () => setIsAuthenticated(true);
  const handleLogout = () => {
    localStorage.removeItem('user');
    setIsAuthenticated(false);
  };

  if (checkingAuth) return <div className="loading-wrap"><div className="spinner" /></div>;

  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        {!isAuthenticated ? (
          <>
            <Route path="/welcome" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage onLoginSuccess={handleLogin} />} />
            <Route path="*" element={<Navigate to="/welcome" />} />
          </>
        ) : (
          /* Protected Routes */
          <Route
            path="*"
            element={
              <div className="app-layout">
                <Sidebar onLogout={handleLogout} />
                <main className="main-content">
                  <Routes>
                    <Route path="/" element={<Dashboard />} />
                    <Route path="/products" element={<ProductList />} />
                    <Route path="/products/create" element={<ProductForm />} />
                    <Route path="/products/edit/:id" element={<ProductForm />} />
                    <Route path="/billing" element={<BillingCreate />} />
                    <Route path="/invoice/:id" element={<InvoiceView />} />
                    <Route path="*" element={<Navigate to="/" />} />
                  </Routes>
                </main>
              </div>
            }
          />
        )}
      </Routes>
    </Router>
  );
}
