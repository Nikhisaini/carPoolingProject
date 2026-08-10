import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import UserDetailDialog from "@/components/user/UserDetailDialog";
import api from "@/services/Api";
import { Eye, Search, ShieldCheck } from "lucide-react";
import React, { useEffect, useMemo, useState } from "react";

function UserManagement() {
  const [loading, setloading] = useState(true);
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("All");

  const getUsers = async () => {
    try {
      setloading(true);
      const res = await api.get("/admin/users");
      setUsers(res.data.users || []);
    } catch (error) {
      console.log("Get Users Error:", error);
    } finally {
      setloading(false);
    }
  };

  useEffect(() => {
    getUsers();
  }, []);
  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const firstName = user.firstName || "";
      const lastName = user.lastName || "";
      const email = user.email || "";
      const phoneNumber = user.phoneNumber || "";
      const searchText =
        `${firstName} ${lastName} ${email} ${phoneNumber}`.toLowerCase();

      const matchesSearch = searchText.includes(search.toLowerCase());
      const matchesStatus =
        status === "All" ||
        (status === "Active" && !user.isBlocked) ||
        (status === "Blocked" && user.isBlocked);
      return matchesSearch && matchesStatus;
    });
  }, [users, search, status]);

  const getStatusStyle = (isBlocked) => {
    if (isBlocked) {
      return "text-red-600 border-red-200 bg-red-50";
    }
    return "text-green-600 border-green-200 bg-green-50";
  };
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50">
              <ShieldCheck className="h-5 w-5 text-blue-600" />
            </div>

            <div>
              <h1 className="text-2xl font-semibold tracking-tight">
                User Management
              </h1>

              <p className="text-sm text-muted-foreground">
                Review and verify users.
              </p>
            </div>
          </div>
        </div>

        <div className="text-sm text-muted-foreground">
          {filteredUsers.length} user
          {filteredUsers.length !== 1 ? "s" : ""}
        </div>
      </div>

      <div className="rounded-xl border bg-card p-4 shadow-sm">
        <div className="flex flex-col gap-3 md:flex-row md:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

            <Input
              placeholder="Search by name or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border bg-card shadow-sm">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/40">
              <TableHead className="w-[280px]">User</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Verification</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {loading && (
              <TableRow>
                <TableCell colSpan={5} className="h-32 text-center">
                  <div className="flex items-center justify-center gap-2 text-muted-foreground">
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
                    Loading users...
                  </div>
                </TableCell>
              </TableRow>
            )}

            {!loading && filteredUsers.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="h-40 text-center">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <ShieldCheck className="h-8 w-8 text-muted-foreground/50" />

                    <p className="font-medium">No users found</p>

                    <p className="text-sm text-muted-foreground">
                      Try changing your search or status filter.
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            )}

            {!loading &&
              filteredUsers.map((user) => {
                const fullName = user
                  ? `${user.firstName || ""} ${user.lastName || ""}`.trim()
                  : "Unknown User";

                return (
                  <TableRow
                    key={user._id}
                    className="transition-colors hover:bg-muted/30"
                  >
                    <TableCell>
                      <div className="flex items-center gap-3">
                        {user?.profileImage ? (
                          <img
                            src={`http://localhost:8081/${user.profileImage}`}
                            alt={fullName}
                            className="h-10 w-10 rounded-full object-cover ring-2 ring-background"
                          />
                        ) : (
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-50 font-semibold text-blue-600">
                            {fullName.charAt(0).toUpperCase()}
                          </div>
                        )}

                        <div className="min-w-0">
                          <p className="truncate font-medium">{fullName}</p>

                          <p className="truncate text-xs text-muted-foreground">
                            {user?.email || "No email"}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">
                      {user.phoneNumber || "—"}
                    </TableCell>

                    <TableCell>
                      <Badge
                        variant="outline"
                        className={
                          user.isVerified
                            ? "text-green-600 border-green-200 bg-green-50"
                            : "text-yellow-600 border-yellow-200 bg-yellow-50"
                        }
                      >
                        {user.isVerified ? "Verified" : "Not Verified"}
                      </Badge>
                    </TableCell>

                    <TableCell>
                      <Badge
                        variant="outline"
                        className={getStatusStyle(user.isBlocked)}
                      >
                        <span className="mr-1.5 h-1.5 w-1.5 rounded-full bg-current" />
                        {user.isBlocked ? "Blocked" : "Active"}
                      </Badge>
                    </TableCell>

                    <TableCell className="text-right">
                      <Button
                        variant="outline"
                        size="sm"
                        className="gap-2"
                        onClick={() => {
                          setSelectedUser(user);
                          setOpenDialog(true);
                        }}
                      >
                        <Eye className="h-4 w-4" />
                        View
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
          </TableBody>
        </Table>
        <UserDetailDialog
          open={openDialog}
          setOpen={setOpenDialog}
          user={selectedUser}
          onStatusChange={(updatedUser) => {
            setUsers((currentUsers) =>
              currentUsers.map((user) =>
                user._id === updatedUser._id ? updatedUser : user,
              ),
            );

            setSelectedUser(updatedUser);
          }}
        />
      </div>
    </div>
  );
}

export default UserManagement;
