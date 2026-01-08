import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { ExpenseForm } from './components/ExpenseForm';
import { ExpenseList } from './components/ExpenseList';
import { CategoryBreakdown } from './components/CategoryBreakdown';
import { SummaryCards } from './components/SummaryCards';
import { Login } from './components/Login';
import { Signup } from './components/Signup';
import './App.css';

function Dashboard() {
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const navigate = useNavigate();

  const refreshData = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
    window.location.reload();
  };

  return (
    <div className="app-container">
      <header className="app-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 className="app-title text-gradient">SmartExpense 💰</h1>
          <p className="app-subtitle">Welcome back, {user.name || 'User'}!</p>
        </div>
        <button onClick={handleLogout} className="submit-btn" style={{ width: 'auto', padding: '0.5rem 1rem', fontSize: '0.9rem' }}>
          Logout
        </button>
      </header>

      <main className="dashboard-grid">
        <div className="main-column">
          <SummaryCards refreshTrigger={refreshTrigger} />
          <ExpenseList refreshTrigger={refreshTrigger} triggerRefresh={refreshData} />
        </div>

        <div className="side-column">
          <ExpenseForm onSuccess={refreshData} />
          <div style={{ height: '1.5rem' }}></div>
          <CategoryBreakdown refreshTrigger={refreshTrigger} />
        </div>
      </main>
    </div>
  );
}

function PrivateRoute({ children }) {
  const token = localStorage.getItem('token');
  return token ? children : <Navigate to="/login" />;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route
          path="/"
          element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          }
        />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
