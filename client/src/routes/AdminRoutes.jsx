import Adminlayout from "@/layouts/Adminlayout";
import Dashboard from "@/pages/Admin/Dashboard";
import LicenceVerification from "@/pages/Admin/LicenceVerification";
import UserManagement from "@/pages/Admin/UserManagement";
import VehicleVerification from "@/pages/Admin/VehicleVerification";
import React from "react";
import { Route, Routes } from "react-router-dom";

function AdminRoutes() {
  return (
    <Routes>
      <Route element={<Adminlayout />}>
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="licence-verification" element={<LicenceVerification />} />
        <Route path="vehicle-verification" element={<VehicleVerification />} />
        <Route path="user-management" element={<UserManagement />} />
      </Route>
    </Routes>
  );
}

export default AdminRoutes;
