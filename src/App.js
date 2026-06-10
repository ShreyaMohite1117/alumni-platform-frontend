import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Sidebar from './components/Sidebar';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Alumni from './pages/Alumni';
import Jobs from './pages/Jobs';
import Forum from './pages/Forum';
import Events from './pages/Events';
import Messages from './pages/Messages';
import Mentorship from './pages/Mentorship';
import Profile from './pages/Profile';
import './index.css';

const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="loading"><i className="fas fa-spinner fa-spin"></i></div>;
  return user ? children : <Navigate to="/login" />;
};

const AppLayout = ({ children }) => (
  <div className="layout">
    <Sidebar />
    <div className="main-content">{children}</div>
  </div>
);

const App = () => (
  <AuthProvider>
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={
          <PrivateRoute><AppLayout><Dashboard /></AppLayout></PrivateRoute>
        } />
        <Route path="/alumni" element={
          <PrivateRoute><AppLayout><Alumni /></AppLayout></PrivateRoute>
        } />
        <Route path="/jobs" element={
          <PrivateRoute><AppLayout><Jobs /></AppLayout></PrivateRoute>
        } />
        <Route path="/forum" element={
          <PrivateRoute><AppLayout><Forum /></AppLayout></PrivateRoute>
        } />
        <Route path="/events" element={
          <PrivateRoute><AppLayout><Events /></AppLayout></PrivateRoute>
        } />
        <Route path="/messages" element={
          <PrivateRoute><AppLayout><Messages /></AppLayout></PrivateRoute>
        } />
        <Route path="/mentorship" element={
          <PrivateRoute><AppLayout><Mentorship /></AppLayout></PrivateRoute>
        } />
        <Route path="/profile" element={
          <PrivateRoute><AppLayout><Profile /></AppLayout></PrivateRoute>
        } />
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </Router>
  </AuthProvider>
);

export default App;
