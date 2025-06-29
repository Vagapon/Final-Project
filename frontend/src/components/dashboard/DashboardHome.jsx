// src/components/dashboard/DashboardHome.jsx
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import AdminLayout from './AdminLayout';
import Overview from '../../pages/Admin/Overview';
import User from '../../pages/Admin/User';


const DashboardHome = () => {
  return (
    <Routes>
      <Route path="/admin" element={<AdminLayout />}>
        <Route index element={<Overview />} />
        <Route path="users" element={<User />} />
      </Route>
    </Routes>
  );
};

export default DashboardHome;
