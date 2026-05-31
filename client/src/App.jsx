import React from "react";
import { Routes, Route, Navigate, Link, useNavigate } from 'react-router-dom';
import { WalletCards, LayoutDashboard, PlusCircle, ListChecks, Target, LogOut } from 'lucide-react';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Transactions from './pages/Transactions.jsx';
import Budgets from './pages/Budgets.jsx';
import { getToken, logout } from './services/api.js';

function Protected({ children }) {
  return getToken() ? children : <Navigate to="/login" />;
}

function Shell({ children }) {
  const navigate = useNavigate();
  function signOut() { logout(); navigate('/login'); }
  return <div className="app">
    <aside className="sidebar">
      <div className="brand"><WalletCards /> <span>Smart Expense</span></div>
      <Link to="/"><LayoutDashboard size={18}/> Dashboard</Link>
      <Link to="/transactions"><ListChecks size={18}/> Transactions</Link>
      <Link to="/budgets"><Target size={18}/> Budgets</Link>
      <Link to="/transactions"><PlusCircle size={18}/> Add Expense</Link>
      <button onClick={signOut}><LogOut size={18}/> Logout</button>
    </aside>
    <main className="main">{children}</main>
  </div>;
}

export default function App() {
  return <Routes>
    <Route path="/login" element={<Login />} />
    <Route path="/register" element={<Register />} />
    <Route path="/" element={<Protected><Shell><Dashboard /></Shell></Protected>} />
    <Route path="/transactions" element={<Protected><Shell><Transactions /></Shell></Protected>} />
    <Route path="/budgets" element={<Protected><Shell><Budgets /></Shell></Protected>} />
  </Routes>;
}
