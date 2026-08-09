import { LayoutDashboard, BadgeCheck, Car, LogOut } from "lucide-react";
import { NavLink } from "react-router-dom";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

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
    <aside className="flex h-screen w-72 flex-col border-r border-border bg-background text-foreground">
      <div className="flex h-20 shrink-0 items-center gap-3 border-b border-border px-6">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600">
          <Car className="h-5 w-5 text-white" />
        </div>
        <h1 className="text-lg font-bold tracking-tight">BlaBla Admin</h1>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto p-4">
        {menuItems.map((item) => {
          const Icon = item.icon;

          return (
            <NavLink
              key={item.title}
              to={item.path}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-blue-600 text-white shadow-sm"
                    : "text-muted-foreground hover:bg-blue-50 hover:text-blue-700",
                )
              }
            >
              <Icon className="h-[18px] w-[18px] shrink-0" />
              <span>{item.title}</span>
            </NavLink>
          );
        })}
      </nav>

      <div className="shrink-0 border-t border-border p-4">
        <Button
          variant="outline"
          className="w-full justify-center gap-2 rounded-xl border-red-200 bg-red-50 text-red-700 hover:bg-red-100"
        >
          <LogOut className="h-4 w-4" />
          Logout
        </Button>
      </div>
    </aside>
  );
};

export default Sidebar;
