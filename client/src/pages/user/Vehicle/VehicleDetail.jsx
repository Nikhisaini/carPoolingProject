import api from "@/services/Api";
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  BadgeCheck,
  CircleX,
  Clock3,
  CalendarDays,
  CarFront,
  Fuel,
  Users,
  Palette,
  Hash,
  ImageIcon,
  ImageOff,
  Loader2,
  Pencil,
  Trash2,
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
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

function VehicleDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [vehicle, setVehicle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [selectedImage, setSelectedImage] = useState(0);
  const [deleting, setDeleting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const getVehicle = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/vehicle/${id}`);
      setVehicle(res.data.vehicle);
    } catch (error) {
      const message = error.response?.data?.message || "Something went wrong";
      setErrorMessage(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getVehicle();
  }, [id]);

  const handleDelete = async () => {
    try {
      setDeleting(true);
      await api.delete(`/vehicle/delete/${id}`);
      navigate("/my-vehicles");
    } catch (error) {
      setErrorMessage(
        error.response?.data?.message ||
          error.message ||
          "Failed to delete vehicle.",
      );
    } finally {
      setDeleting(false);
      setConfirmDelete(false);
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

  const images = vehicle?.vehicleImages || [];

  const goToImage = (dir) => {
    if (images.length === 0) return;
    setSelectedImage((prev) => (prev + dir + images.length) % images.length);
  };

  const DocumentImage = ({ title, src }) => (
    <div>
      <h4 className="mb-2 text-sm font-semibold text-foreground">{title}</h4>
      {src ? (
        <img
          src={`http://localhost:8081/${src}`}
          alt={title}
          className="h-56 w-full rounded-xl border border-border object-cover"
        />
      ) : (
        <div className="flex h-56 w-full items-center justify-center rounded-xl border border-border bg-muted">
          <div className="text-center text-muted-foreground">
            <ImageOff className="mx-auto mb-2 h-6 w-6" />
            <p className="text-xs">Not uploaded</p>
          </div>
        </div>
      )}
    </div>
  );
  if (loading) {
    return (
      <div className="min-h-screen bg-muted/30 py-8">
        <div className="mx-auto max-w-6xl px-4">
          <Skeleton className="mb-6 h-4 w-32" />
          <div className="grid gap-8 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <Skeleton className="h-[380px] w-full rounded-2xl" />
              <div className="mt-3 flex gap-2">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="h-16 w-16 rounded-lg" />
                ))}
              </div>
            </div>
            <Skeleton className="h-96 w-full rounded-2xl" />
          </div>
        </div>
      </div>
    );
  }

  if (errorMessage && !vehicle) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-muted/30 px-4">
        <div className="text-center text-sm text-red-600">{errorMessage}</div>
      </div>
    );
  }

  if (!vehicle) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-muted/30 px-4">
        <div className="text-center text-sm text-muted-foreground">
          Vehicle not found.
        </div>
      </div>
    );
  }

  const specs = [
    {
      icon: CarFront,
      label: "Vehicle type",
      value: vehicle.licenceCategoryId?.name || "—",
    },
    { icon: Fuel, label: "Fuel type", value: vehicle.fuelTypeId?.name || "—" },
    {
      icon: CalendarDays,
      label: "Manufacture year",
      value: vehicle.manufactureYear || "—",
    },
    {
      icon: Users,
      label: "Seats",
      value: `${vehicle.seatingCapacity || "—"} seats`,
    },
    { icon: Palette, label: "Color", value: vehicle.color || "—" },
  ];

  return (
    <div className="min-h-screen bg-muted/30 py-8">
      <div className="mx-auto max-w-6xl px-4">
        {errorMessage && (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {errorMessage}
          </div>
        )}

        {/* =====================================================
            BACK LINK
        ===================================================== */}
        <button
          type="button"
          onClick={() => navigate("/my-vehicles")}
          className="mb-6 flex items-center gap-1.5 text-sm text-muted-foreground hover:text-blue-600"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to my vehicles
        </button>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* =====================================================
              MAIN — GALLERY + TABS
          ===================================================== */}
          <div className="lg:col-span-2">
            {/* GALLERY */}
            <div className="relative overflow-hidden rounded-2xl bg-background shadow-sm">
              {images[selectedImage] ? (
                <img
                  src={`http://localhost:8081/${images[selectedImage]}`}
                  alt={vehicle.brand}
                  className="h-[380px] w-full object-cover"
                />
              ) : (
                <div className="flex h-[380px] w-full items-center justify-center bg-muted">
                  <ImageOff className="h-10 w-10 text-muted-foreground/50" />
                </div>
              )}

              {images.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={() => goToImage(-1)}
                    className="absolute left-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-black/50 text-white hover:bg-black/70"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => goToImage(1)}
                    className="absolute right-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-black/50 text-white hover:bg-black/70"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>
                </>
              )}

              {images.length > 0 && (
                <div className="absolute right-3 top-3 flex items-center gap-1.5 rounded-full bg-black/60 px-3 py-1 text-white">
                  <ImageIcon className="h-3.5 w-3.5" />
                  <span className="text-xs">
                    {selectedImage + 1}/{images.length}
                  </span>
                </div>
              )}
            </div>

            {images.length > 1 && (
              <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
                {images.map((image, index) => (
                  <img
                    key={index}
                    src={`http://localhost:8081/${image}`}
                    onClick={() => setSelectedImage(index)}
                    alt=""
                    className={`h-16 w-16 shrink-0 cursor-pointer rounded-lg border-2 object-cover transition-all ${
                      selectedImage === index
                        ? "border-blue-600"
                        : "border-transparent opacity-70 hover:opacity-100"
                    }`}
                  />
                ))}
              </div>
            )}

            {/* TABS */}
            <Tabs defaultValue="overview" className="mt-8">
              <TabsList>
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="documents">Documents</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="mt-5">
                <div className="grid gap-3 sm:grid-cols-2">
                  {specs.map((item) => {
                    const Icon = item.icon;
                    return (
                      <div
                        key={item.label}
                        className="flex items-center gap-3 rounded-xl border border-border bg-background px-4 py-3.5"
                      >
                        <Icon className="h-4 w-4 shrink-0 text-muted-foreground" />
                        <div className="min-w-0">
                          <p className="text-xs text-muted-foreground">
                            {item.label}
                          </p>
                          <p className="truncate text-sm font-semibold text-foreground">
                            {item.value}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </TabsContent>

              <TabsContent value="documents" className="mt-5">
                <div className="grid gap-5 sm:grid-cols-3">
                  <DocumentImage title="RC front" src={vehicle.rcFrontImage} />
                  <DocumentImage title="RC back" src={vehicle.rcBackImage} />
                  <DocumentImage
                    title="Insurance"
                    src={vehicle.insuranceImage}
                  />
                </div>
              </TabsContent>
            </Tabs>
          </div>

          {/* =====================================================
              SIDEBAR — STICKY
          ===================================================== */}
          <div className="lg:col-span-1">
            <Card className="sticky top-6 p-6">
              <h1 className="text-xl font-semibold tracking-tight text-foreground">
                {vehicle.brand} {vehicle.model}
              </h1>
              <p className="mt-1.5 flex items-center gap-1.5 text-sm text-muted-foreground">
                <Hash className="h-3.5 w-3.5" />
                {vehicle.registrationNumber}
              </p>

              <Badge
                variant="outline"
                className={`mt-3 gap-1.5 rounded-full ${getStatusStyle(vehicle.verificationStatus)}`}
              >
                <StatusIcon status={vehicle.verificationStatus} />
                {vehicle.verificationStatus}
              </Badge>

              <div className="my-5 h-px bg-border" />

              {/* QUICK SPECS */}
              <div className="space-y-3">
                {specs.map((item) => {
                  const Icon = item.icon;
                  return (
                    <div
                      key={item.label}
                      className="flex items-center justify-between gap-3 text-sm"
                    >
                      <span className="flex items-center gap-2 text-muted-foreground">
                        <Icon className="h-3.5 w-3.5" />
                        {item.label}
                      </span>
                      <span className="font-medium text-foreground">
                        {item.value}
                      </span>
                    </div>
                  );
                })}
              </div>

              <div className="my-5 h-px bg-border" />

              <p className="text-xs text-muted-foreground">
                Added{" "}
                {vehicle.createdAt
                  ? new Date(vehicle.createdAt).toLocaleDateString()
                  : "—"}
              </p>

              <div className="mt-5 space-y-2">
                <Button
                  type="button"
                  onClick={() => navigate(`/edit-vehicle/${vehicle._id}`)}
                  className="w-full gap-2 bg-blue-600 text-white hover:bg-blue-700"
                >
                  <Pencil className="h-4 w-4" />
                  Edit vehicle
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setConfirmDelete(true)}
                  className="w-full gap-2 border-red-200 bg-red-50 text-red-700 hover:bg-red-100"
                >
                  <Trash2 className="h-4 w-4" />
                  Delete vehicle
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </div>

      <AlertDialog open={confirmDelete} onOpenChange={setConfirmDelete}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this vehicle?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently remove{" "}
              {vehicle.brand} {vehicle.model} and all its associated documents.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleting}
              className="bg-red-600 text-white hover:bg-red-700"
            >
              {deleting ? (
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

export default VehicleDetail;
