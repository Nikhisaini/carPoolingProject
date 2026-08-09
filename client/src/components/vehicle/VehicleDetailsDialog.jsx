import React, { useState } from "react";
import {
  Car,
  User,
  FileText,
  Fuel,
  CalendarDays,
  Gauge,
  Users,
  Snowflake,
  BriefcaseBusiness,
  ImageIcon,
  XCircle,
  CheckCircle2,
  Loader2,
  ShieldCheck,
} from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import api from "@/services/Api";

const VehicleDetailsDialog = ({ open, setOpen, vehicle, onStatusUpdate }) => {
  const [loading, setLoading] = useState(false);

  if (!vehicle) {
    return null;
  }

  const owner = vehicle.ownerId;
  const vehicleType = vehicle.vehicleTypeId;
  const fuelType = vehicle.fuelTypeId;
  const licence = vehicle.drivingLicenceId;

  const fullName = owner
    ? `${owner.firstName || ""} ${owner.lastName || ""}`.trim()
    : "Unknown User";

  const currentStatus = vehicle.verificationStatus || "Pending";
  const isPending = currentStatus === "Pending";

  const imageUrl = (image) => {
    if (!image) return "";
    const normalizedPath = image.replaceAll("\\", "/").replace(/^\/+/, "");
    return `http://localhost:8081/${normalizedPath}`;
  };

  const getStatusClass = (status) => {
    switch (status) {
      case "Approved":
        return "border-emerald-200 bg-emerald-50 text-emerald-700";
      case "Rejected":
        return "border-red-200 bg-red-50 text-red-700";
      default:
        return "border-amber-200 bg-amber-50 text-amber-700";
    }
  };

  const handleApprove = async () => {
    if (!vehicle?._id || loading || !isPending) return;
    try {
      setLoading(true);
      const response = await api.put(`/admin/vehicle/${vehicle._id}/approve`);
      if (response.data.success) {
        const updatedVehicle = {
          ...vehicle,
          verificationStatus: "Approved",
        };
        if (onStatusUpdate) {
          onStatusUpdate(updatedVehicle);
        }
        setOpen(false);
      }
    } catch (error) {
      console.error("Approve Vehicle Error:", error.response?.data || error);
      alert(error.response?.data?.message || "Failed to approve vehicle.");
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async () => {
    if (!vehicle?._id || loading || currentStatus === "Rejected") {
      return;
    }
    try {
      setLoading(true);
      const response = await api.put(`/admin/vehicle/${vehicle._id}/reject`);
      if (response.data.success) {
        const updatedVehicle = {
          ...vehicle,
          verificationStatus: "Rejected",
        };

        if (onStatusUpdate) {
          onStatusUpdate(updatedVehicle);
        }

        setOpen(false);
      }
    } catch (error) {
      console.error("Reject Vehicle Error:", error.response?.data || error);

      alert(error.response?.data?.message || "Failed to reject vehicle.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-h-[92vh] max-w-6xl overflow-hidden rounded-2xl border border-border bg-background p-0 text-foreground shadow-2xl">
        <DialogHeader className="border-b border-border bg-background px-7 py-5">
          <div className="flex items-center justify-between pr-10">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50">
                <Car className="h-5 w-5 text-blue-600" />
              </div>

              <div>
                <DialogTitle className="text-lg font-semibold tracking-tight text-foreground">
                  Vehicle Verification
                </DialogTitle>

                <DialogDescription className="mt-1 text-sm text-muted-foreground">
                  Review the vehicle and submitted documents.
                </DialogDescription>
              </div>
            </div>

            <Badge
              variant="outline"
              className={`rounded-full px-3 py-1.5 font-medium ${getStatusClass(
                currentStatus,
              )}`}
            >
              <span
                className={`mr-2 h-1.5 w-1.5 rounded-full ${
                  currentStatus === "Approved"
                    ? "bg-emerald-500"
                    : currentStatus === "Rejected"
                      ? "bg-red-500"
                      : "bg-amber-500"
                }`}
              />

              {currentStatus}
            </Badge>
          </div>
        </DialogHeader>

        <div className="min-h-0 flex-1 overflow-y-auto bg-muted/30 px-7 py-6">
          <div className="mx-auto max-w-6xl space-y-6">
            <section className="overflow-hidden rounded-xl border border-border bg-background shadow-sm">
              <div className="border-b border-border px-6 py-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted">
                    <User className="h-4 w-4 text-muted-foreground" />
                  </div>

                  <div>
                    <h3 className="text-sm font-semibold text-foreground">
                      Vehicle Owner
                    </h3>

                    <p className="text-xs text-muted-foreground">
                      Registered vehicle owner information
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-5 px-6 py-5 md:flex-row md:items-center">
                <div className="flex items-center gap-4">
                  {owner?.profileImage ? (
                    <img
                      src={imageUrl(owner.profileImage)}
                      alt={fullName}
                      className="h-14 w-14 rounded-full object-cover ring-2 ring-border"
                      onError={(e) => {
                        e.currentTarget.style.display = "none";
                      }}
                    />
                  ) : (
                    <div className="flex h-14 w-14 items-center justify-center rounded-full bg-blue-50 text-lg font-semibold text-blue-600">
                      {fullName.charAt(0).toUpperCase() || "U"}
                    </div>
                  )}

                  <div>
                    <p className="font-semibold text-foreground">{fullName}</p>

                    <p className="mt-1 text-sm text-muted-foreground">
                      Vehicle Owner
                    </p>
                  </div>
                </div>

                <div className="grid flex-1 gap-5 md:grid-cols-2 md:pl-8">
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                      Email
                    </p>

                    <p className="mt-1 break-all text-sm font-medium text-foreground">
                      {owner?.email || "Not provided"}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                      Phone
                    </p>

                    <p className="mt-1 text-sm font-medium text-foreground">
                      {owner?.phoneNumber || "Not provided"}
                    </p>
                  </div>
                </div>
              </div>
            </section>

            <section className="overflow-hidden rounded-xl border border-border bg-background shadow-sm">
              <div className="border-b border-border px-6 py-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50">
                    <Car className="h-4 w-4 text-blue-600" />
                  </div>

                  <div>
                    <h3 className="text-sm font-semibold text-foreground">
                      Vehicle Information
                    </h3>

                    <p className="text-xs text-muted-foreground">
                      Vehicle details submitted by the owner
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid gap-4 p-6 sm:grid-cols-2 lg:grid-cols-4">
                <InfoCard
                  icon={<Car className="h-4 w-4" />}
                  label="Brand"
                  value={vehicle.brand}
                />
                <InfoCard
                  icon={<Car className="h-4 w-4" />}
                  label="Model"
                  value={vehicle.model}
                />
                <InfoCard
                  icon={<Car className="h-4 w-4" />}
                  label="Vehicle Type"
                  value={vehicleType?.name}
                />
                <InfoCard
                  icon={<FileText className="h-4 w-4" />}
                  label="Registration Number"
                  value={vehicle.registrationNumber}
                />
                <InfoCard
                  icon={<CalendarDays className="h-4 w-4" />}
                  label="Manufacture Year"
                  value={vehicle.manufactureYear}
                />
                <InfoCard
                  icon={<Gauge className="h-4 w-4" />}
                  label="Color"
                  value={vehicle.color}
                />
                <InfoCard
                  icon={<Fuel className="h-4 w-4" />}
                  label="Fuel Type"
                  value={fuelType?.name}
                />
                <InfoCard
                  icon={<Users className="h-4 w-4" />}
                  label="Seating Capacity"
                  value={
                    vehicle.seatingCapacity
                      ? `${vehicle.seatingCapacity} seats`
                      : "—"
                  }
                />
                <InfoCard
                  icon={<Snowflake className="h-4 w-4" />}
                  label="Air Conditioning"
                  value={vehicle.airCondition ? "Available" : "Not Available"}
                />
                <InfoCard
                  icon={<BriefcaseBusiness className="h-4 w-4" />}
                  label="Luggage Capacity"
                  value={vehicle.luggageCapacity || "Not specified"}
                />
              </div>
            </section>

            <section className="overflow-hidden rounded-xl border border-border bg-background shadow-sm">
              <div className="border-b border-border px-6 py-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50">
                    <ShieldCheck className="h-4 w-4 text-blue-600" />
                  </div>

                  <div>
                    <h3 className="text-sm font-semibold text-foreground">
                      Driving Licence
                    </h3>

                    <p className="text-xs text-muted-foreground">
                      Licence associated with this vehicle
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid gap-4 p-6 md:grid-cols-2">
                <InfoCard
                  icon={<FileText className="h-4 w-4" />}
                  label="Licence Number"
                  value={licence?.licenceNumber || "—"}
                />

                <div className="rounded-xl border border-border bg-muted/30 p-4">
                  <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Licence Status
                  </p>

                  <Badge
                    variant="outline"
                    className={`rounded-full ${getStatusClass(licence?.verificationStatus)}`}
                  >
                    {licence?.verificationStatus || "Unknown"}
                  </Badge>
                </div>
              </div>
            </section>

            <section className="overflow-hidden rounded-xl border border-border bg-background shadow-sm">
              <div className="border-b border-border px-6 py-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50">
                    <ImageIcon className="h-4 w-4 text-blue-600" />
                  </div>

                  <div>
                    <h3 className="text-sm font-semibold text-foreground">
                      Vehicle Images
                    </h3>

                    <p className="text-xs text-muted-foreground">
                      Images submitted for vehicle verification
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid gap-5 p-6 sm:grid-cols-2 lg:grid-cols-3">
                {Array.isArray(vehicle.vehicleImages) &&
                vehicle.vehicleImages.length > 0 ? (
                  vehicle.vehicleImages.map((image, index) => (
                    <div
                      key={`${image}-${index}`}
                      className="overflow-hidden rounded-xl border border-border bg-muted/30"
                    >
                      <div className="border-b border-border px-4 py-3">
                        <p className="text-sm font-medium text-foreground">
                          Vehicle Image {index + 1}
                        </p>
                      </div>

                      <div className="flex h-64 items-center justify-center p-3">
                        <img
                          src={imageUrl(image)}
                          alt={`Vehicle ${index + 1}`}
                          className="max-h-full max-w-full rounded-lg object-contain shadow-sm"
                          onError={(e) => {
                            console.error(
                              "Vehicle image failed:",
                              e.currentTarget.src,
                            );
                          }}
                        />
                      </div>
                    </div>
                  ))
                ) : (
                  <EmptyImage text="No vehicle images available" />
                )}
              </div>
            </section>

            <section className="overflow-hidden rounded-xl border border-border bg-background shadow-sm">
              <div className="border-b border-border px-6 py-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50">
                    <FileText className="h-4 w-4 text-blue-600" />
                  </div>

                  <div>
                    <h3 className="text-sm font-semibold text-foreground">
                      Vehicle Documents
                    </h3>

                    <p className="text-xs text-muted-foreground">
                      Registration certificate and insurance
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid gap-6 p-6 lg:grid-cols-3">
                <DocumentImage
                  title="RC Front"
                  subtitle="Registration certificate front"
                  image={vehicle.rcFrontImage}
                  imageUrl={imageUrl}
                />
                <DocumentImage
                  title="RC Back"
                  subtitle="Registration certificate back"
                  image={vehicle.rcBackImage}
                  imageUrl={imageUrl}
                />
                <DocumentImage
                  title="Insurance"
                  subtitle="Vehicle insurance document"
                  image={vehicle.insuranceImage}
                  imageUrl={imageUrl}
                />
              </div>
            </section>

            <div className="flex items-center gap-2 px-1 text-sm text-muted-foreground">
              <CalendarDays className="h-4 w-4" />

              <span>
                Submitted{" "}
                {vehicle.createdAt
                  ? new Date(vehicle.createdAt).toLocaleString()
                  : "—"}
              </span>
            </div>

            <div className="sticky bottom-0 rounded-xl border border-border bg-background p-4 shadow-lg">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="font-semibold text-foreground">
                    Verification Decision
                  </p>

                  <p className="mt-1 text-sm text-muted-foreground">
                    Review all vehicle information before making a decision.
                  </p>
                </div>

                <div className="flex gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleReject}
                    disabled={loading || currentStatus === "Rejected"}
                    className="min-w-[120px] border-red-200 bg-red-50 text-red-700 hover:bg-red-100"
                  >
                    {loading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <XCircle className="h-4 w-4" />
                    )}
                    {loading ? "Processing..." : "Reject"}
                  </Button>

                  <Button
                    type="button"
                    onClick={handleApprove}
                    disabled={loading || currentStatus === "Approved"}
                    className="min-w-[120px] bg-emerald-600 text-white shadow-sm hover:bg-emerald-700"
                  >
                    {loading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <CheckCircle2 className="h-4 w-4" />
                    )}
                    {loading ? "Processing..." : "Approve"}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

const InfoCard = ({ icon, label, value }) => {
  return (
    <div className="rounded-xl border border-border bg-muted/30 p-4">
      <div className="mb-2 flex items-center gap-2 text-muted-foreground">
        {icon}
        <p className="text-xs font-medium uppercase tracking-wide">{label}</p>
      </div>

      <p className="break-words text-sm font-semibold text-foreground">
        {value || "—"}
      </p>
    </div>
  );
};

const DocumentImage = ({ title, subtitle, image, imageUrl }) => {
  return (
    <div className="overflow-hidden rounded-xl border border-border bg-background">
      <div className="border-b border-border px-5 py-4">
        <h4 className="font-semibold text-foreground">{title}</h4>
        <p className="mt-1 text-xs text-muted-foreground">{subtitle}</p>
      </div>

      <div className="flex min-h-[300px] items-center justify-center bg-muted/30 p-5">
        {image ? (
          <img
            src={imageUrl(image)}
            alt={title}
            className="max-h-[400px] max-w-full rounded-lg object-contain shadow-md"
            onError={(e) => {
              console.error(`${title} image failed:`, e.currentTarget.src);
            }}
          />
        ) : (
          <EmptyImage text={`${title} unavailable`} />
        )}
      </div>
    </div>
  );
};

const EmptyImage = ({ text }) => {
  return (
    <div className="flex flex-col items-center justify-center text-center text-muted-foreground">
      <ImageIcon className="mb-3 h-9 w-9" />
      <p className="text-sm">{text}</p>
    </div>
  );
};

export default VehicleDetailsDialog;
