import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Users from './pages/Users';
import UserForm from './pages/UserForm';
import Rosters from './pages/Rosters';
import RosterForm from './pages/RosterForm';
import Profile from './pages/Profile';
import MyRosters from './pages/MyRosters';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            
            {/* User Management Routes */}
            <Route path="users" element={
              <ProtectedRoute requiredRole="Supervisor">
                <Users />
              </ProtectedRoute>
            } />
            <Route path="users/new" element={
              <ProtectedRoute requiredRole="Supervisor">
                <UserForm />
              </ProtectedRoute>
            } />
            <Route path="users/:id/edit" element={
              <ProtectedRoute requiredRole="Supervisor">
                <UserForm />
              </ProtectedRoute>
            } />
            
            {/* Roster Management Routes */}
            <Route path="rosters" element={
              <ProtectedRoute requiredRole="Supervisor">
                <Rosters />
              </ProtectedRoute>
            } />
            <Route path="rosters/new" element={
              <ProtectedRoute requiredRole="Supervisor">
                <RosterForm />
              </ProtectedRoute>
            } />
            <Route path="rosters/:id/edit" element={
              <ProtectedRoute requiredRole="Supervisor">
                <RosterForm />
              </ProtectedRoute>
            } />
            
            {/* Employee Routes */}
            <Route path="my-rosters" element={<MyRosters />} />
            <Route path="profile" element={<Profile />} />
          </Route>
          
          {/* Catch all route */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
