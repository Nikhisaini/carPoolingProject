import api from "@/services/Api";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Mail,
  Phone,
  CalendarDays,
  User,
  Cake,
  Loader2,
  ShieldCheck,
  ShieldAlert,
  Pencil,
} from "lucide-react";

import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

function Profile() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);

  const getProfile = async () => {
    try {
      const res = await api.get("/profile");
      setUser(res.data.user);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getProfile();
  }, []);

  const handleDelete = async () => {
    const ok = window.confirm("Are you sure you want to delete your account");
    if (!ok) return;

    try {
      setDeleting(true);
      const res = await api.delete("/profile/delete");
      alert(res.data.message);
      localStorage.removeItem("token");
      navigate("/login");
    } catch (error) {
      console.log(error);
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-muted/30">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          Loading profile...
        </div>
      </div>
    );
  }

  const fullName = `${user?.firstName || ""} ${user?.lastName || ""}`.trim();
  const memberSince = user?.createdAt
    ? new Date(user.createdAt).getFullYear()
    : "—";

  const infoRows = [
    {
      icon: User,
      label: "First name",
      value: user?.firstName || "—",
    },
    {
      icon: User,
      label: "Last name",
      value: user?.lastName || "—",
    },
    {
      icon: User,
      label: "Gender",
      value: user?.gender || "Not added",
    },
    {
      icon: Cake,
      label: "Date of birth",
      value: user?.dob ? new Date(user.dob).toLocaleDateString() : "Not added",
    },
    {
      icon: Mail,
      label: "Email",
      value: user?.email || "—",
    },
    {
      icon: Phone,
      label: "Phone",
      value: user?.phoneNumber || "—",
    },
    {
      icon: CalendarDays,
      label: "Member since",
      value: user?.createdAt
        ? new Date(user.createdAt).toLocaleDateString()
        : "—",
    },
  ];

  return (
    <div className="min-h-screen bg-muted/30 py-10">
      <div className="mx-auto max-w-2xl px-4">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16">
              <AvatarImage
                src={
                  user?.profileImage
                    ? `http://localhost:8081/${user.profileImage}`
                    : undefined
                }
                alt={fullName}
              />
              <AvatarFallback className="text-lg font-semibold">
                {fullName ? fullName.charAt(0).toUpperCase() : "U"}
              </AvatarFallback>
            </Avatar>

            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-semibold tracking-tight text-foreground">
                  {fullName || "Unnamed User"}
                </h1>
                {user?.isVerified ? (
                  <ShieldCheck className="h-4 w-4 text-emerald-600" />
                ) : (
                  <ShieldAlert className="h-4 w-4 text-amber-600" />
                )}
              </div>
              <p className="text-sm text-muted-foreground">{user?.email}</p>
            </div>
          </div>

          <Button
            type="button"
            onClick={() =>
              navigate(
                user?.profileCompleted ? "/edit-profile" : "/complete-profile",
              )
            }
            className="inline-flex items-center gap-2 whitespace-nowrap bg-blue-600 text-white hover:bg-blue-700"
          >
            <Pencil className="h-3.5 w-3.5 shrink-0" />
            <span>
              {user?.profileCompleted ? "Edit profile" : "Complete profile"}
            </span>
          </Button>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-2">
          <div className="rounded-xl border border-border bg-background px-4 py-3">
            <p className="text-xs text-muted-foreground">Account status</p>
            <p
              className={`mt-0.5 text-sm font-semibold ${
                user?.isVerified ? "text-emerald-600" : "text-amber-600"
              }`}
            >
              {user?.isVerified ? "Verified" : "Not verified"}
            </p>
          </div>
          <div className="rounded-xl border border-border bg-background px-4 py-3">
            <p className="text-xs text-muted-foreground">Member since</p>
            <p className="mt-0.5 text-sm font-semibold text-foreground">
              {memberSince}
            </p>
          </div>
        </div>

        <div className="mt-8">
          <h2 className="mb-3 text-sm font-semibold text-foreground">
            Account details
          </h2>

          <div className="overflow-hidden rounded-xl border border-border bg-background">
            {infoRows.map((row, index) => {
              const Icon = row.icon;
              return (
                <div
                  key={row.label}
                  className={`flex items-center justify-between gap-4 px-4 py-3 ${
                    index !== infoRows.length - 1
                      ? "border-b border-border"
                      : ""
                  }`}
                >
                  <div className="flex items-center gap-2.5 text-sm text-muted-foreground">
                    <Icon className="h-4 w-4" />
                    {row.label}
                  </div>
                  <p className="truncate text-sm font-medium text-foreground">
                    {row.value}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        <div className="mt-10">
          <h2 className="mb-3 text-sm font-semibold text-foreground">
            Danger zone
          </h2>

          <div className="overflow-hidden rounded-xl border border-red-200 bg-background">
            <div className="flex flex-col gap-4 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-medium text-foreground">
                  Delete account
                </p>
                <p className="mt-0.5 text-sm text-muted-foreground">
                  Permanently remove your account and all associated data. This
                  action cannot be undone.
                </p>
              </div>

              <Button
                type="button"
                variant="destructive"
                onClick={handleDelete}
                disabled={deleting}
                className="shrink-0"
              >
                {deleting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  "Delete account"
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Profile;
