import { LayoutDashboard, BadgeCheck, Car, Users, LogOut } from "lucide-react";
import { NavLink } from "react-router-dom";

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
  // {
  //   title: "Vehicle Verification",
  //   path: "/admin/vehicle-verification",
  //   icon: Car,
  // },
  // {
  //   title: "Users",
  //   path: "/admin/users",
  //   icon: Users,
  // },
];

const Sidebar = () => {
  return (
    <aside className="w-72 h-screen bg-slate-900 text-white flex flex-col">
      <div className="h-20 flex items-center justify-center border-b border-slate-800">
        <h1 className="text-2xl font-bold">BlaBla Admin</h1>
      </div>

      <nav className="flex-1 p-4 space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon;

          return (
            <NavLink
              key={item.title}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-xl transition ${
                  isActive
                    ? "bg-blue-600 text-white"
                    : "text-gray-300 hover:bg-slate-800 hover:text-white"
                }`
              }
            >
              <Icon size={20} />

              <span>{item.title}</span>
            </NavLink>
          );
        })}
      </nav>

      <div className="p-4 border-t border-slate-800">
        <button className="w-full flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 py-3 rounded-xl transition">
          <LogOut size={18} />
          Logout
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
