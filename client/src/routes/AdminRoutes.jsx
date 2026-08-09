import Adminlayout from "@/layouts/Adminlayout";
import Dashboard from "@/pages/admin/Dashboard";
import LicenceVerification from "@/pages/admin/LicenceVerification";
import VehicleVerification from "@/pages/admin/VehicleVerification";
import React from "react";
import { Route, Routes } from "react-router-dom";

function AdminRoutes() {
  return (
    <Routes>
      <Route element={<Adminlayout />}>
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="licence-verification" element={<LicenceVerification />} />
        <Route path="vehicle-verification" element={<VehicleVerification />} />
      </Route>
    </Routes>
  );
}

export default AdminRoutes;
