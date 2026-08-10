import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  CalendarDays,
  Car,
  CheckCircle2,
  Mail,
  Phone,
  ShieldCheck,
  Star,
  User,
  UserRound,
} from "lucide-react";
import { Badge } from "../ui/badge";
import { Button } from "@/components/ui/button";
import api from "@/services/Api";

const UserDetailsDialog = ({ open, setOpen, user, onStatusChange }) => {
  const [loading, setLoading] = useState(false);
  if (!user) {
    return null;
  }

  const fullName =
    `${user.firstName || ""} ${user.lastName || ""}`.trim() || "Unknown User";

  const handleBlockUnblock = async () => {
    if (!user._id || loading) return;
    try {
      setLoading(true);

      const endpoint = user.isBlocked
        ? `/admin/users/${user._id}/unblock`
        : `/admin/users/${user._id}/block`;

      const res = await api.patch(endpoint);

      if (res.data.success) {
        const updatedUser = {
          ...user,
          isBlocked: res.data.isBlocked,
        };

        if (onStatusChange) {
          onStatusChange(updatedUser);
        }

        setOpen(false);
      }
    } catch (error) {
      console.error("Block/Unblock User Error:", error.response?.data || error);
    } finally {
      setLoading(false);
    }
  };
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="flex max-h-[92vh] w-[calc(100%-2rem)] max-w-5xl flex-col overflow-hidden rounded-2xl border border-border bg-background p-0 text-foreground shadow-2xl">
        <DialogHeader className="shrink-0 border-b border-border bg-background px-7 py-5">
          <div className="flex items-center gap-4">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-600 shadow-sm">
              <User className="h-5 w-5 text-white" />
            </div>

            <div>
              <DialogTitle className="text-lg font-semibold tracking-tight">
                User Details
              </DialogTitle>

              <DialogDescription className="mt-1 text-sm text-muted-foreground">
                Review the user's account information.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="min-h-0 flex-1 overflow-y-auto bg-muted/30 px-7 py-6">
          <div className="mx-auto max-w-5xl space-y-6">
            <section className="overflow-hidden rounded-xl border border-border bg-background shadow-sm">
              <div className="border-b border-border px-6 py-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted">
                    <User className="h-4 w-4 text-muted-foreground" />
                  </div>

                  <div>
                    <h3 className="text-sm font-semibold">User Information</h3>

                    <p className="text-xs text-muted-foreground">
                      Basic account details
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-6 px-6 py-6 sm:flex-row sm:items-center">
                <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-full bg-blue-600 text-2xl font-semibold text-white">
                  {user.profileImage ? (
                    <img
                      src={`http://localhost:8081/${user.profileImage.replace(
                        /^\/+/,
                        "",
                      )}`}
                      alt={fullName}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    fullName.charAt(0).toUpperCase()
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-3">
                    <h2 className="text-xl font-semibold">{fullName}</h2>

                    <Badge
                      variant="outline"
                      className={
                        user.isBlocked
                          ? "border-red-200 bg-red-50 text-red-700"
                          : "border-emerald-200 bg-emerald-50 text-emerald-700"
                      }
                    >
                      <span className="mr-1.5 h-1.5 w-1.5 rounded-full bg-current" />
                      {user.isBlocked ? "Blocked" : "Active"}
                    </Badge>
                  </div>

                  <p className="mt-1 text-sm text-muted-foreground">
                    {user.role || "User"}
                  </p>
                </div>
                <div className="grid gap-5 border-t border-border pt-5 sm:grid-cols-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <Mail className="h-3.5 w-3.5 text-muted-foreground" />

                      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                        Email
                      </p>
                    </div>

                    <p className="mt-1 break-all text-sm font-medium">
                      {user.email || "Not provided"}
                    </p>
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <Phone className="h-3.5 w-3.5 text-muted-foreground" />

                      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                        Phone
                      </p>
                    </div>

                    <p className="mt-1 text-sm font-medium">
                      {user.phoneNumber || "Not provided"}
                    </p>
                  </div>
                </div>
              </div>
            </section>
            <section className="overflow-hidden rounded-xl border border-border bg-background shadow-sm">
              <div className="border-b border-border px-6 py-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted">
                    <UserRound className="h-4 w-4 text-muted-foreground" />
                  </div>

                  <div>
                    <h3 className="text-sm font-semibold">
                      Personal Information
                    </h3>

                    <p className="text-xs text-muted-foreground">
                      User's personal details
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid gap-6 p-6 sm:grid-cols-2">
                <div>
                  <div className="flex items-center gap-2">
                    <UserRound className="h-3.5 w-3.5 text-muted-foreground" />

                    <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                      Gender
                    </p>
                  </div>

                  <p className="mt-1 text-sm font-medium">
                    {user.gender || "Not provided"}
                  </p>
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <CalendarDays className="h-3.5 w-3.5 text-muted-foreground" />

                    <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                      Date of Birth
                    </p>
                  </div>

                  <p className="mt-1 text-sm font-medium">
                    {user.dob
                      ? new Date(user.dob).toLocaleDateString()
                      : "Not provided"}
                  </p>
                </div>
              </div>
            </section>
            <section className="overflow-hidden rounded-xl border border-border bg-background shadow-sm">
              <div className="border-b border-border px-6 py-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted">
                    <ShieldCheck className="h-4 w-4 text-muted-foreground" />
                  </div>

                  <div>
                    <h3 className="text-sm font-semibold">
                      Account Information
                    </h3>

                    <p className="text-xs text-muted-foreground">
                      Account status and activity
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid gap-4 p-6 sm:grid-cols-2 lg:grid-cols-4">
                <div className="rounded-xl border border-border bg-muted/30 p-4">
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Role
                  </p>

                  <p className="mt-2 text-sm font-semibold">
                    {user.role || "User"}
                  </p>
                </div>

                <div className="rounded-xl border border-border bg-muted/30 p-4">
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Email Verification
                  </p>

                  <div className="mt-2 flex items-center gap-2">
                    <CheckCircle2
                      className={`h-4 w-4 ${
                        user.isVerified
                          ? "text-emerald-600"
                          : "text-muted-foreground"
                      }`}
                    />

                    <p className="text-sm font-semibold">
                      {user.isVerified ? "Verified" : "Not Verified"}
                    </p>
                  </div>
                </div>

                <div className="rounded-xl border border-border bg-muted/30 p-4">
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Profile
                  </p>

                  <p className="mt-2 text-sm font-semibold">
                    {user.profileCompleted ? "Completed" : "Incomplete"}
                  </p>
                </div>

                <div className="rounded-xl border border-border bg-muted/30 p-4">
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Total Trips
                  </p>

                  <div className="mt-2 flex items-center gap-2">
                    <Car className="h-4 w-4 text-muted-foreground" />

                    <p className="text-sm font-semibold">
                      {user.totalTrips ?? 0}
                    </p>
                  </div>
                </div>

                <div className="rounded-xl border border-border bg-muted/30 p-4 sm:col-span-2 lg:col-span-4">
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Average Rating
                  </p>

                  <div className="mt-2 flex items-center gap-2">
                    <Star className="h-4 w-4 fill-current text-yellow-500" />

                    <p className="text-sm font-semibold">
                      {Number(user.averageRating || 0).toFixed(1)} / 5
                    </p>
                  </div>
                </div>
                <div className="rounded-xl border border-border bg-muted/30 p-4">
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Last Login
                  </p>

                  <div className="mt-2 flex items-center gap-2">
                    <CalendarDays className="h-4 w-4 text-muted-foreground" />

                    <p className="text-sm font-semibold">
                      {user.lastLogin
                        ? new Date(user.lastLogin).toLocaleString()
                        : "Never"}
                    </p>
                  </div>
                </div>

                <div className="rounded-xl border border-border bg-muted/30 p-4">
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Account Created
                  </p>

                  <div className="mt-2 flex items-center gap-2">
                    <CalendarDays className="h-4 w-4 text-muted-foreground" />

                    <p className="text-sm font-semibold">
                      {user.createdAt
                        ? new Date(user.createdAt).toLocaleDateString()
                        : "—"}
                    </p>
                  </div>
                </div>
              </div>
            </section>
            <section className="sticky bottom-0 overflow-hidden rounded-xl border border-border bg-background shadow-lg">
              <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="font-semibold text-foreground">
                    Account Status
                  </p>

                  <p className="mt-1 text-sm text-muted-foreground">
                    Manage the user's account access.
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <Badge
                    variant="outline"
                    className={
                      user.isBlocked
                        ? "border-red-200 bg-red-50 px-3 py-1.5 text-red-700"
                        : "border-emerald-200 bg-emerald-50 px-3 py-1.5 text-emerald-700"
                    }
                  >
                    <span className="mr-2 h-1.5 w-1.5 rounded-full bg-current" />
                    {user.isBlocked ? "Blocked" : "Active"}
                  </Badge>

                  <Button
                    type="button"
                    variant={user.isBlocked ? "default" : "destructive"}
                    className="min-w-[120px]"
                    onClick={handleBlockUnblock}
                    disabled={loading}
                  >
                    {loading
                      ? "Processing..."
                      : user.isBlocked
                        ? "Unblock User"
                        : "Block User"}
                  </Button>
                </div>
              </div>
            </section>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default UserDetailsDialog;
