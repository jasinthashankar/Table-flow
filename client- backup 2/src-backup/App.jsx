import React, { useEffect } from 'react';
import { BrowserRouter as Router, Navigate, Route, Routes } from 'react-router-dom';
import Layout from './components/layout/Layout';
import useAuthStore from './store/useAuthStore';

import Home from './pages/customer/Home';
import Dashboard from './pages/customer/Dashboard';
import Reservations from './pages/customer/Reservations';
import NewReservation from './pages/customer/NewReservation';
import ReservationDetails from './pages/customer/ReservationDetails';
import ReservationSuccess from './pages/customer/ReservationSuccess';
import Waitlist from './pages/customer/Waitlist';
import ServiceRequests from './pages/customer/ServiceRequests';
import Profile from './pages/customer/Profile';

import AdminDashboard from './pages/admin/AdminDashboard';
import AdminReservations from './pages/admin/AdminReservations';
import AdminTables from './pages/admin/AdminTables';
import AdminWaitlist from './pages/admin/AdminWaitlist';
import AdminServiceRequests from './pages/admin/AdminServiceRequests';
import AdminCustomers from './pages/admin/AdminCustomers';

import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import ProtectedRoute from './components/auth/ProtectedRoute';
import PublicOnlyRoute from './components/auth/PublicOnlyRoute';
import AdminRoute from './components/auth/AdminRoute';
import NotFound from './pages/NotFound';

function App() {
  const fetchCurrentUser = useAuthStore((state) => state.fetchCurrentUser);

  useEffect(() => {
    fetchCurrentUser();
  }, [fetchCurrentUser]);

  return (
    <Router>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<Home />} />

          <Route path="login" element={<PublicOnlyRoute><Login /></PublicOnlyRoute>} />
          <Route path="register" element={<PublicOnlyRoute><Register /></PublicOnlyRoute>} />

          <Route path="dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="reservations" element={<ProtectedRoute><Reservations /></ProtectedRoute>} />
          <Route path="reservations/new" element={<ProtectedRoute><NewReservation /></ProtectedRoute>} />
          <Route path="reservations/:reservationNumber" element={<ProtectedRoute><ReservationDetails /></ProtectedRoute>} />
          <Route path="reservation-success/:reservationNumber" element={<ProtectedRoute><ReservationSuccess /></ProtectedRoute>} />
          <Route path="waitlist" element={<ProtectedRoute><Waitlist /></ProtectedRoute>} />
          <Route path="service-requests" element={<ProtectedRoute><ServiceRequests /></ProtectedRoute>} />
          <Route path="profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />

          <Route path="admin" element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="admin/dashboard" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
          <Route path="admin/reservations" element={<AdminRoute><AdminReservations /></AdminRoute>} />
          <Route path="admin/tables" element={<AdminRoute><AdminTables /></AdminRoute>} />
          <Route path="admin/waitlist" element={<AdminRoute><AdminWaitlist /></AdminRoute>} />
          <Route path="admin/service-requests" element={<AdminRoute><AdminServiceRequests /></AdminRoute>} />
          <Route path="admin/customers" element={<AdminRoute><AdminCustomers /></AdminRoute>} />

          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
