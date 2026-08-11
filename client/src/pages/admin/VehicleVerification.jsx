import { useEffect, useMemo, useState } from "react";
import { Eye, Search, CarFront } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

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
import api from "@/services/Api";
import VehicleDetailsDialog from "@/components/vehicle/VehicleDetailsDialog";

function VehicleVerification() {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("All");

  const getVehicles = async () => {
    try {
      setLoading(true);
      const res = await api.get("/admin/vehicles");

      setVehicles(res.data.vehicles || []);
    } catch (error) {
      console.error("Get Vehicle error:", error.res?.data || error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getVehicles();
  }, []);

  const filteredVehicles = useMemo(() => {
    const query = search.trim().toLowerCase();

    return vehicles.filter((vehicle) => {
      const owner = vehicle.ownerId;
      const vehicleType = vehicle.licenceCategoryId;
      const fuelType = vehicle.fuelTypeId;
      const searchableText = [
        owner?.firstName,
        owner?.lastName,
        `${owner?.firstName || ""} ${owner?.lastName || ""}`,
        owner?.email,

        vehicle.registrationNumber,
        vehicle.brand,
        vehicle.model,
        vehicle.color,

        vehicleType?.name,
        fuelType?.name,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      const matchesSearch = query === "" || searchableText.includes(query);
      const vehicleStatus = (vehicle.verificationStatus || "Pending").trim();
      const matchesStatus = status === "All" || vehicleStatus === status;
      return matchesSearch && matchesStatus;
    });
  }, [vehicles, search, status]);

  const getStatusStyle = (status) => {
    switch (status) {
      case "Approved":
        return "bg-green-50 text-green-700 border-green-200";

      case "Rejected":
        return "bg-red-50 text-red-700 border-red-200";

      case "Pending":
      default:
        return "bg-amber-50 text-amber-700 border-amber-200";
    }
  };

  const handleVehicleStatusUpdate = (updatedVehicle) => {
    setVehicles((prevVehicles) =>
      prevVehicles.map((vehicle) =>
        vehicle._id === updatedVehicle._id
          ? {
              ...vehicle,
              verificationStatus: updatedVehicle.verificationStatus,
            }
          : vehicle,
      ),
    );
  };
  const handleViewVehicle = (vehicle) => {
    setSelectedVehicle(vehicle);
    setOpenDialog(true);
  };
  return (
    <div className="space-y-6 ">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50">
            <CarFront className="h-5 w-5 text-blue-600" />
          </div>

          <div>
            <h1 className="text-2xl font-semibold tracking-tight">
              Vehicle Verification
            </h1>

            <p className="text-sm text-muted-foreground">
              Review and verify submitted vehicles.
            </p>
          </div>
        </div>

        <div className="text-sm text-muted-foreground">
          {filteredVehicles.length} vehicle
          {filteredVehicles.length !== 1 ? "s" : ""}
        </div>
      </div>

      <div className="rounded-xl border bg-card p-4 shadow-sm">
        <div className="flex flex-col gap-3 md:flex-row md:items-center">
          <div className="relative flex-1">
            <Search
              className="
                absolute
                left-3
                top-1/2
                h-4
                w-4
                -translate-y-1/2
                text-muted-foreground
              "
            />
            <Input
              placeholder="Search by owner, vehicle or registration..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger className="w-full md:w-48">
              <SelectValue placeholder="Filter status" />
            </SelectTrigger>

            <SelectContent>
              <SelectItem value="All">All Status</SelectItem>
              <SelectItem value="Pending">Pending</SelectItem>
              <SelectItem value="Approved">Approved</SelectItem>
              <SelectItem value="Rejected">Rejected</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* ================= TABLE ================= */}

      <div className="overflow-hidden rounded-xl border bg-card shadow-sm">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/40">
              <TableHead className="w-[260px]">Owner</TableHead>
              <TableHead>Vehicle</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Registration</TableHead>
              <TableHead>Fuel</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {loading && (
              <TableRow>
                <TableCell colSpan={7} className="h-32 text-center">
                  <div className="flex items-center justify-center gap-2 text-muted-foreground">
                    <div
                      className="
                        h-4
                        w-4
                        animate-spin
                        rounded-full
                        border-2
                        border-blue-600
                        border-t-transparent
                      "
                    />
                    Loading vehicles...
                  </div>
                </TableCell>
              </TableRow>
            )}
            {!loading && filteredVehicles.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="h-40 text-center">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <CarFront className="h-8 w-8 text-muted-foreground/50" />
                    <p className="font-medium">No vehicles found</p>
                    <p className="text-sm text-muted-foreground">
                      Try changing your search or status filter.
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            )}

            {!loading &&
              filteredVehicles.map((vehicle) => {
                const owner = vehicle.ownerId;
                const fullName = owner
                  ? `${owner.firstName || ""} ${owner.lastName || ""}`.trim()
                  : "Unknown User";
                return (
                  <TableRow
                    key={vehicle._id}
                    className="transition-colors hover:bg-muted/30"
                  >
                    <TableCell>
                      <div className="flex items-center gap-3">
                        {owner?.profileImage ? (
                          <img
                            src={`http://localhost:8081/${owner.profileImage
                              .replaceAll("\\", "/")
                              .replace(/^\/+/, "")}`}
                            alt={fullName}
                            className="
                              h-10
                              w-10
                              rounded-full
                              object-cover
                              ring-2
                              ring-background
                            "
                          />
                        ) : (
                          <div
                            className="
                              flex
                              h-10
                              w-10
                              items-center
                              justify-center
                              rounded-full
                              bg-blue-50
                              font-semibold
                              text-blue-600
                            "
                          >
                            {fullName.charAt(0).toUpperCase()}
                          </div>
                        )}

                        <div className="min-w-0">
                          <p className="truncate font-medium">{fullName}</p>
                          <p className="truncate text-xs text-muted-foreground">
                            {owner?.email || "No email"}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{vehicle.brand || "—"}</p>
                        <p className="text-xs text-muted-foreground">
                          {vehicle.model || "—"}
                        </p>
                      </div>
                    </TableCell>

                    <TableCell>
                      <Badge variant="secondary" className="font-normal">
                        {vehicle.licenceCategoryId?.name || "—"}
                      </Badge>
                    </TableCell>

                    <TableCell className="font-medium">
                      {vehicle.registrationNumber || "—"}
                    </TableCell>

                    <TableCell>{vehicle.fuelTypeId?.name || "—"}</TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={getStatusStyle(vehicle.verificationStatus)}
                      >
                        <span className="mr-1.5 h-1.5 w-1.5 rounded-full bg-current" />
                        {vehicle.verificationStatus || "Pending"}
                      </Badge>
                    </TableCell>

                    <TableCell className="text-right">
                      <Button
                        variant="outline"
                        size="sm"
                        className="gap-2"
                        onClick={() => handleViewVehicle(vehicle)}
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

        <VehicleDetailsDialog
          open={openDialog}
          setOpen={setOpenDialog}
          vehicle={selectedVehicle}
          onStatusUpdate={handleVehicleStatusUpdate}
        />
      </div>
    </div>
  );
}

export default VehicleVerification;
