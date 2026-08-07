import { BadgeCheck, Car, LayoutDashboard } from "lucide-react";

const menuItems = [
  {
    title: "Dashboard",
    path: "/admin/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Licence Verification",
    path: "/admin/licence-verification",
    icon: BadgeCheck,
  },
  {
    title: "Vehicle Verification",
    path: "/admin/vehicle-verification",
    icon: Car,
  },
];

const Sidebar = () => {
  return (
    <aside className="w-72 h-screen bg-slate-900 text-white flex flex-col">
      <div className="h-20 flex itms-center justif-center border-b border-slate-800">
        <hi className="text-2xl font-bold">BlaBla Admin</hi>
      </div>
    </aside>
  );
};
