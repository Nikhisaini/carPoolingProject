import api from "@/services/Api";
import {
  BadgeCheck,
  Car,
  CircleX,
  Clock3,
  Eye,
  Fuel,
  Hash,
  Plus,
  Trash2,
  Users,
  Loader2,
  MoreVertical,
  Pencil,
} from "lucide-react";
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";

function MyVehicle() {
  const navigate = useNavigate();
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLodaing] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [deletingId, setDeletingId] = useState(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);

  const getMyVehicle = async () => {
    setErrorMessage("");
    setSuccessMessage("");
    try {
      setLodaing(true);
      const res = await api.get("/vehicle/my-vehicles");
      setVehicles(res.data.vehicles);
    } catch (error) {
      const message = error.response?.data?.message || "Something went wrong";
      setErrorMessage(message);
    } finally {
      setLodaing(false);
    }
  };

  useEffect(() => {
    getMyVehicle();
  }, []);

  const handleDelete = async (id) => {
    try {
      setDeletingId(id);
      const res = await api.delete(`/vehicle/delete/${id}`);
      setSuccessMessage(res.data.message);
      setVehicles((prev) => prev.filter((vehicle) => vehicle._id !== id));
    } catch (error) {
      setErrorMessage(
        error.response?.data?.message ||
          error.message ||
          "Something went wrong.",
      );
    } finally {
      setDeletingId(null);
      setConfirmDeleteId(null);
    }
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case "Approved":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case "Rejected":
        return "bg-red-50 text-red-700 border-red-200";
      default:
        return "bg-amber-50 text-amber-700 border-amber-200";
    }
  };

  const StatusIcon = ({ status }) => {
    if (status === "Approved") return <BadgeCheck className="h-3.5 w-3.5" />;
    if (status === "Rejected") return <CircleX className="h-3.5 w-3.5" />;
    return <Clock3 className="h-3.5 w-3.5" />;
  };

  const stats = useMemo(() => {
    return {
      total: vehicles.length,
      approved: vehicles.filter((v) => v.verificationStatus === "Approved")
        .length,
      pending: vehicles.filter(
        (v) => !v.verificationStatus || v.verificationStatus === "Pending",
      ).length,
      rejected: vehicles.filter((v) => v.verificationStatus === "Rejected")
        .length,
    };
  }, [vehicles]);

  return (
    <div className="min-h-screen bg-[#F5F8FC] py-10">
      <div className="mx-auto max-w-7xl px-4">
        {errorMessage && (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {errorMessage}
          </div>
        )}
        {successMessage && (
          <div className="mb-6 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
            {successMessage}
          </div>
        )}

        <div className="mb-6 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50">
              <Car className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <h1 className="text-2xl font-semibold tracking-tight text-foreground">
                My vehicles
              </h1>
              <p className="text-sm text-muted-foreground">
                Manage all your registered vehicles.
              </p>
            </div>
          </div>

          <Button
            type="button"
            onClick={() => navigate("/add-vehicle")}
            className="gap-2 bg-blue-600 text-white hover:bg-blue-700"
          >
            <Plus className="h-4 w-4" />
            Add vehicle
          </Button>
        </div>

        <div className="mb-8 h-px bg-border" />

        {!loading && vehicles.length > 0 && (
          <div className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div className="rounded-xl border border-blue-200 bg-blue-50 px-5 py-4">
              <p className="text-xs font-medium text-blue-700">
                Total vehicles
              </p>
              <p className="mt-1 text-2xl font-semibold text-blue-700">
                {stats.total}
              </p>
            </div>
            <div className="rounded-xl border border-blue-100 bg-background px-5 py-4">
              <p className="text-xs text-muted-foreground">Approved</p>
              <p className="mt-1 text-2xl font-semibold text-emerald-600">
                {stats.approved}
              </p>
            </div>
            <div className="rounded-xl border border-blue-100 bg-background px-5 py-4">
              <p className="text-xs text-muted-foreground">Pending</p>
              <p className="mt-1 text-2xl font-semibold text-amber-600">
                {stats.pending}
              </p>
            </div>
            <div className="rounded-xl border border-blue-100 bg-background px-5 py-4">
              <p className="text-xs text-muted-foreground">Rejected</p>
              <p className="mt-1 text-2xl font-semibold text-red-600">
                {stats.rejected}
              </p>
            </div>
          </div>
        )}

        {loading ? (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Card key={i} className="overflow-hidden">
                <Skeleton className="h-48 w-full rounded-none" />
                <CardContent className="space-y-3 p-6">
                  <Skeleton className="h-5 w-2/3" />
                  <Skeleton className="h-4 w-1/2" />
                  <Skeleton className="h-4 w-1/3" />
                  <Skeleton className="h-9 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : vehicles.length === 0 ? (
          <Card className="p-12 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-blue-50">
              <Car className="h-6 w-6 text-blue-600" />
            </div>
            <h2 className="mt-4 text-lg font-semibold text-foreground">
              No vehicles added
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Add your first vehicle to start publishing rides.
            </p>
            <Button
              type="button"
              onClick={() => navigate("/add-vehicle")}
              className="mt-6 gap-2 bg-blue-600 text-white hover:bg-blue-700"
            >
              <Plus className="h-4 w-4" />
              Add vehicle
            </Button>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {vehicles.map((vehicle) => (
              <Card
                key={vehicle._id}
                className="group overflow-hidden border-blue-100 transition-shadow hover:shadow-md"
              >
                <div
                  className="relative cursor-pointer"
                  onClick={() => navigate(`/vehicle/${vehicle._id}`)}
                >
                  {vehicle.vehicleImages?.[0] ? (
                    <img
                      src={`http://localhost:8081/${vehicle.vehicleImages[0]}`}
                      alt={`${vehicle.brand} ${vehicle.model}`}
                      className="h-48 w-full object-cover transition-transform duration-200 group-hover:scale-[1.03]"
                    />
                  ) : (
                    <div className="flex h-48 w-full items-center justify-center bg-blue-50">
                      <Car className="h-10 w-10 text-blue-300" />
                    </div>
                  )}

                  <Badge
                    variant="outline"
                    className={`absolute left-3 top-3 gap-1.5 rounded-full shadow-sm ${getStatusStyle(vehicle.verificationStatus)}`}
                  >
                    <StatusIcon status={vehicle.verificationStatus} />
                    {vehicle.verificationStatus || "Pending"}
                  </Badge>
                </div>

                <CardContent className="p-5">
                  <div className="flex items-start justify-between gap-2">
                    <h2
                      className="cursor-pointer truncate text-base font-semibold text-foreground hover:text-blue-600"
                      onClick={() => navigate(`/vehicle/${vehicle._id}`)}
                    >
                      {vehicle.brand} {vehicle.model}
                    </h2>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button
                          type="button"
                          className="shrink-0 rounded-md p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
                        >
                          <MoreVertical className="h-4 w-4" />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => navigate(`/vehicle/${vehicle._id}`)}
                        >
                          <Eye className="h-4 w-4" />
                          View details
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() =>
                            navigate(`/edit-vehicle/${vehicle._id}`)
                          }
                        >
                          <Pencil className="h-4 w-4" />
                          Edit vehicle
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => setConfirmDeleteId(vehicle._id)}
                          className="text-red-600 focus:text-red-600"
                        >
                          <Trash2 className="h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1.5">
                      <Car className="h-3.5 w-3.5" />
                      {vehicle.licenceCategoryId?.name || "—"}
                    </span>

                    <span className="flex items-center gap-1.5">
                      <Hash className="h-3.5 w-3.5" />
                      {vehicle.registrationNumber}
                    </span>

                    <span className="flex items-center gap-1.5">
                      <Fuel className="h-3.5 w-3.5" />
                      {vehicle.fuelTypeId?.name || "—"}
                    </span>

                    <span className="flex items-center gap-1.5">
                      <Users className="h-3.5 w-3.5" />
                      {vehicle.seatingCapacity} seats
                    </span>
                  </div>

                  <Button
                    type="button"
                    onClick={() => navigate(`/vehicle/${vehicle._id}`)}
                    className="mt-4 w-full gap-2 bg-blue-600 text-white hover:bg-blue-700"
                  >
                    <Eye className="h-4 w-4" />
                    View details
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      <AlertDialog
        open={!!confirmDeleteId}
        onOpenChange={(open) => !open && setConfirmDeleteId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this vehicle?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently remove the
              vehicle and all its associated documents.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={!!deletingId}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => handleDelete(confirmDeleteId)}
              disabled={!!deletingId}
              className="bg-red-600 text-white hover:bg-red-700"
            >
              {deletingId ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

export default MyVehicle;
