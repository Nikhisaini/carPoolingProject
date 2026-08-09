import { Bell, Menu, Search } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

const Navbar = () => {
  return (
    <header className="flex h-20 items-center justify-between border-b border-border bg-background px-6 shadow-sm">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" className="lg:hidden">
          <Menu className="h-5 w-5" />
        </Button>

        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Dashboard
          </h1>
          <p className="text-sm text-muted-foreground">Welcome back, Admin</p>
        </div>
      </div>

      <div className="relative hidden w-96 items-center md:flex">
        <Search className="absolute left-3 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Search..." className="pl-10" />
      </div>

      <div className="flex items-center gap-5">
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-xs text-destructive-foreground">
            3
          </span>
        </Button>

        <div className="flex items-center gap-3">
          <Avatar size="lg">
            <AvatarImage src="https://i.pravatar.cc/150?img=12" alt="Admin" />
            <AvatarFallback>A</AvatarFallback>
          </Avatar>

          <div className="hidden sm:block">
            <h3 className="font-semibold text-foreground">Admin</h3>
            <p className="text-xs text-muted-foreground">Administrator</p>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
