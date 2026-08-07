import Navbar from "@/components/admin/Navbar";
import Sidebar from "@/components/admin/sidebar";
import React from "react";
import { Outlet } from "react-router-dom";

function Adminlayout() {
  return (
    <div className="h-screen bg-slate-100 flex overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Navbar />
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default Adminlayout;
