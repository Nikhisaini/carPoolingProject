import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Car,
  Plus,
  ShieldCheck,
  Clock,
  AlertTriangle,
  Users,
  Fuel,
  Luggage,
  Wind,
  Eye,
  Pencil,
  Trash2,
  MoreHorizontal,
  PlusCircle,
  Sparkles,
  ArrowRight,
  Loader2,
  Calendar,
} from "lucide-react";

import api from "@/services/Api";
import { getImageUrl } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

function MyVehicle() {
  const navigate = useNavigate();
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [deletingId, setDeletingId] = useState(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);

  const getMyVehicle = async () => {
    setErrorMessage("");
    setSuccessMessage("");
    try {
      setLoading(true);
      const res = await api.get("/vehicle/my-vehicles");
      setVehicles(res.data.vehicles || []);
    } catch (error) {
      const message = error.response?.data?.message || "Something went wrong";
      setErrorMessage(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getMyVehicle();
  }, []);

  const handleDelete = async (id) => {
    try {
      setDeletingId(id);
      const res = await api.delete(`/vehicle/delete/${id}`);
      setSuccessMessage(res.data.message || "Vehicle removed successfully");
      setVehicles((prev) => prev.filter((vehicle) => vehicle._id !== id));
    } catch (error) {
      setErrorMessage(
        error.response?.data?.message ||
          error.message ||
          "Unable to delete vehicle.",
      );
    } finally {
      setDeletingId(null);
      setConfirmDeleteId(null);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "Approved":
        return {
          label: "Verified & Ready",
          icon: ShieldCheck,
          className:
            "bg-emerald-50 text-emerald-700 border-emerald-200/80 shadow-sm",
          dotColor: "bg-emerald-500",
        };
      case "Rejected":
        return {
          label: "Action Required",
          icon: AlertTriangle,
          className: "bg-rose-50 text-rose-700 border-rose-200/80 shadow-sm",
          dotColor: "bg-rose-500",
        };
      default:
        return {
          label: "Under Verification",
          icon: Clock,
          className: "bg-amber-50 text-amber-700 border-amber-200/80 shadow-sm",
          dotColor: "bg-amber-500",
        };
    }
  };

  const selectedDeleteVehicle = vehicles.find((v) => v._id === confirmDeleteId);

  return (
    <div className="min-h-[calc(100vh-72px)] bg-slate-50/60 pb-16 pt-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Top Header & Action */}
        <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-blue-600">
                Driver Portal
              </span>
              <span className="text-slate-300">•</span>
              <span className="text-xs font-medium text-slate-500">
                {vehicles.length}{" "}
                {vehicles.length === 1 ? "Vehicle" : "Vehicles"}
              </span>
            </div>
            <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
              My Garage
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Manage your registered vehicles, verify documents, and publish
              rides.
            </p>
          </div>

          <Button
            type="button"
            onClick={() => navigate("/add-vehicle")}
            className="h-11 gap-2 rounded-xl bg-blue-600 px-5 text-sm font-semibold text-white shadow-sm shadow-blue-500/20 transition-all hover:bg-blue-700 hover:shadow-md active:scale-95"
          >
            <Plus className="h-4 w-4" />
            <span>Add New Vehicle</span>
          </Button>
        </div>

        {/* Feedback Messages */}
        {errorMessage && (
          <div className="mb-6 flex items-center justify-between rounded-xl border border-red-200 bg-red-50/90 p-4 text-sm font-medium text-red-800 shadow-sm">
            <span>{errorMessage}</span>
            <button
              type="button"
              onClick={() => setErrorMessage("")}
              className="text-red-500 hover:text-red-700"
            >
              ✕
            </button>
          </div>
        )}

        {successMessage && (
          <div className="mb-6 flex items-center justify-between rounded-xl border border-emerald-200 bg-emerald-50/90 p-4 text-sm font-medium text-emerald-800 shadow-sm">
            <span>{successMessage}</span>
            <button
              type="button"
              onClick={() => setSuccessMessage("")}
              className="text-emerald-500 hover:text-emerald-700"
            >
              ✕
            </button>
          </div>
        )}

        {/* Loading State */}
        {loading ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm animate-pulse"
              >
                <div className="h-48 w-full rounded-xl bg-slate-200" />
                <div className="mt-4 space-y-3">
                  <div className="h-5 w-3/4 rounded bg-slate-200" />
                  <div className="h-4 w-1/2 rounded bg-slate-100" />
                  <div className="grid grid-cols-2 gap-2 pt-2">
                    <div className="h-8 rounded-lg bg-slate-100" />
                    <div className="h-8 rounded-lg bg-slate-100" />
                  </div>
                  <div className="h-10 w-full rounded-xl bg-slate-200 pt-2" />
                </div>
              </div>
            ))}
          </div>
        ) : vehicles.length === 0 ? (
          /* Modern Empty State */
          <div className="relative overflow-hidden rounded-3xl border border-slate-200/80 bg-white px-6 py-16 text-center shadow-sm">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-blue-50/80 ring-8 ring-blue-50/40">
              <Car className="h-10 w-10 text-blue-600" />
            </div>

            <h2 className="mt-6 text-xl font-bold text-slate-900">
              Your garage is currently empty
            </h2>
            <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-slate-500">
              Add your car details and vehicle RC document to get verified. Once
              approved, you can publish rides and share your empty seats.
            </p>

            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Button
                type="button"
                onClick={() => navigate("/add-vehicle")}
                className="h-12 gap-2 rounded-xl bg-blue-600 px-6 font-semibold text-white shadow-md shadow-blue-500/20 transition-all hover:bg-blue-700"
              >
                <Plus className="h-4 w-4" />
                Add Your First Vehicle
              </Button>
            </div>
          </div>
        ) : (
          /* Vehicle Cards Grid */
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {vehicles.map((vehicle) => {
              const isApproved = vehicle.verificationStatus === "Approved";
              const statusConfig = getStatusBadge(vehicle.verificationStatus);
              const StatusIcon = statusConfig.icon;
              const vehicleImage = vehicle.vehicleImages?.[0];
              const imageUrl = getImageUrl(vehicleImage);

              return (
                <div
                  key={vehicle._id}
                  className="group relative flex flex-col overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-slate-300 hover:shadow-lg"
                >
                  {/* Card Media Header */}
                  <div
                    className="relative h-52 w-full cursor-pointer overflow-hidden bg-slate-900"
                    onClick={() => navigate(`/vehicle/${vehicle._id}`)}
                  >
                    {imageUrl ? (
                      <img
                        src={imageUrl}
                        alt={`${vehicle.brand} ${vehicle.model}`}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                        onError={(e) => {
                          e.currentTarget.style.display = "none";
                          e.currentTarget.nextElementSibling.style.display =
                            "flex";
                        }}
                      />
                    ) : null}

                    <div
                      className={`h-full w-full items-center justify-center bg-gradient-to-br from-slate-800 to-slate-950 ${
                        imageUrl ? "hidden" : "flex"
                      }`}
                    >
                      <Car className="h-16 w-16 text-slate-700" />
                    </div>

                    {/* Dark gradient overlay for contrast */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-black/30 pointer-events-none" />

                    {/* Verification Status Badge */}
                    <div className="absolute left-3 top-3">
                      <Badge
                        variant="outline"
                        className={`flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold backdrop-blur-md ${statusConfig.className}`}
                      >
                        <span
                          className={`h-1.5 w-1.5 rounded-full ${statusConfig.dotColor}`}
                        />
                        <StatusIcon className="h-3.5 w-3.5" />
                        <span>{statusConfig.label}</span>
                      </Badge>
                    </div>

                    {/* Quick Menu Dropdown */}
                    <div
                      className="absolute right-3 top-3"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button
                            type="button"
                            className="flex h-8 w-8 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-md transition-colors hover:bg-black/60 focus:outline-none"
                            aria-label="Options"
                          >
                            <MoreHorizontal className="h-4 w-4" />
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent
                          align="end"
                          className="w-44 rounded-xl"
                        >
                          <DropdownMenuItem
                            onClick={() => navigate(`/vehicle/${vehicle._id}`)}
                            className="cursor-pointer gap-2"
                          >
                            <Eye className="h-4 w-4 text-slate-500" />
                            <span>View Details</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() =>
                              navigate(`/edit-vehicle/${vehicle._id}`)
                            }
                            className="cursor-pointer gap-2"
                          >
                            <Pencil className="h-4 w-4 text-slate-500" />
                            <span>Edit Vehicle</span>
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => setConfirmDeleteId(vehicle._id)}
                            className="cursor-pointer gap-2 text-red-600 focus:text-red-600"
                          >
                            <Trash2 className="h-4 w-4 text-red-500" />
                            <span>Remove Vehicle</span>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>

                    {/* Category & Color Pill on bottom of image */}
                    <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
                      <span className="rounded-lg bg-black/50 px-2.5 py-1 text-xs font-medium text-white backdrop-blur-md">
                        {vehicle.licenceCategoryId?.name || "Car"}
                      </span>

                      {vehicle.color && (
                        <span className="rounded-lg bg-black/50 px-2.5 py-1 text-xs font-medium text-slate-200 backdrop-blur-md capitalize">
                          {vehicle.color}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Card Body */}
                  <div className="flex flex-1 flex-col p-5">
                    {/* Brand & Model */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <h2
                          className="truncate text-lg font-bold text-slate-900 transition-colors hover:text-blue-600 cursor-pointer"
                          onClick={() => navigate(`/vehicle/${vehicle._id}`)}
                        >
                          {vehicle.brand} {vehicle.model}
                        </h2>
                        {vehicle.manufactureYear && (
                          <p className="text-xs text-slate-400">
                            Model Year {vehicle.manufactureYear}
                          </p>
                        )}
                      </div>

                      {/* Number Plate Graphic Pill */}
                      <div className="flex shrink-0 items-center overflow-hidden rounded border border-slate-300 bg-slate-50 px-2 py-0.5 shadow-[inset_0_1px_2px_rgba(0,0,0,0.05)]">
                        <span className="mr-1 text-[9px] font-bold text-blue-700">
                          IND
                        </span>
                        <span className="font-mono text-xs font-bold tracking-wider text-slate-800">
                          {vehicle.registrationNumber}
                        </span>
                      </div>
                    </div>

                    {/* Specs Grid */}
                    <div className="mt-4 grid grid-cols-2 gap-2 rounded-xl bg-slate-50/80 p-3 text-xs text-slate-600">
                      <div className="flex items-center gap-2">
                        <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded bg-white text-blue-600 shadow-2xs">
                          <Users className="h-3.5 w-3.5" />
                        </div>
                        <span className="truncate font-medium">
                          {vehicle.seatingCapacity - 1} Passenger Seats
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded bg-white text-blue-600 shadow-2xs">
                          <Fuel className="h-3.5 w-3.5" />
                        </div>
                        <span className="truncate font-medium capitalize">
                          {vehicle.fuelTypeId?.name || "Standard"}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded bg-white text-blue-600 shadow-2xs">
                          <Luggage className="h-3.5 w-3.5" />
                        </div>
                        <span className="truncate font-medium capitalize">
                          {vehicle.luggageCapacity || "Standard"} Luggage
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded bg-white text-blue-600 shadow-2xs">
                          <Wind className="h-3.5 w-3.5" />
                        </div>
                        <span className="truncate font-medium">
                          {vehicle.airCondition ? "A/C Equipped" : "Non A/C"}
                        </span>
                      </div>
                    </div>

                    {/* Bottom Action Section */}
                    <div className="mt-5 pt-3 border-t border-slate-100 flex items-center gap-2">
                      {isApproved ? (
                        <Button
                          type="button"
                          onClick={() => navigate("/publish-ride")}
                          className="flex-1 h-10 gap-1.5 rounded-xl bg-blue-600 font-semibold text-white shadow-sm hover:bg-blue-700 transition-colors"
                        >
                          <PlusCircle className="h-4 w-4" />
                          <span>Publish Ride</span>
                        </Button>
                      ) : (
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => navigate(`/vehicle/${vehicle._id}`)}
                          className="flex-1 h-10 gap-1.5 rounded-xl border-slate-200 text-slate-700 hover:bg-slate-50"
                        >
                          <Eye className="h-4 w-4 text-slate-500" />
                          <span>View Documents</span>
                        </Button>
                      )}

                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => navigate(`/vehicle/${vehicle._id}`)}
                        className="h-10 w-10 p-0 rounded-xl border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-blue-600"
                        title="Vehicle details"
                      >
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <AlertDialog
        open={!!confirmDeleteId}
        onOpenChange={(open) => !open && setConfirmDeleteId(null)}
      >
        <AlertDialogContent className="rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-lg font-bold text-slate-900">
              Remove this vehicle?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-sm text-slate-500">
              Are you sure you want to delete{" "}
              <strong className="text-slate-700">
                {selectedDeleteVehicle?.brand} {selectedDeleteVehicle?.model} (
                {selectedDeleteVehicle?.registrationNumber})
              </strong>
              ? This action is irreversible.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-4 gap-2">
            <AlertDialogCancel
              disabled={!!deletingId}
              className="rounded-xl border-slate-200"
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => handleDelete(confirmDeleteId)}
              disabled={!!deletingId}
              className="rounded-xl bg-red-600 font-semibold text-white hover:bg-red-700"
            >
              {deletingId ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-1.5" />
                  Removing...
                </>
              ) : (
                "Remove Vehicle"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

export default MyVehicle;
