import RideDetailsDialog from "@/components/ride/RideDetailsDialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
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
import { Input } from "@/components/ui/input";
import api from "@/services/Api";
import {
  ArrowRight,
  CalendarDays,
  CarFront,
  Clock3,
  Eye,
  IndianRupee,
  MapPin,
  MoreHorizontal,
  Pencil,
  Search,
  Trash2,
  Users,
} from "lucide-react";
import React, { useEffect, useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

function MyRides() {
  const [rides, setRides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [selectedRideId, setSelectedRideId] = useState(null);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [selectedCancelRide, setSelectedCancelRide] = useState(null);
  const [cancelling, setCancelling] = useState(false);

  const getMyRides = async () => {
    try {
      setLoading(true);

      const res = await api.get("ride/my-rides");

      setRides(res.data.rides || []);
    } catch (error) {
      console.error("Get my ride Error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getMyRides();
  }, []);

  const filteredRides = rides.filter((ride) => {
    const departure =
      ride.departureLocationId?.city ||
      ride.departureLocationId?.name ||
      ride.departureLocationId?.address ||
      "";

    const destination =
      ride.destinationLocationId?.city ||
      ride.destinationLocationId?.name ||
      ride.destinationLocationId?.address ||
      "";

    return `${departure} ${destination}`
      .toLowerCase()
      .includes(search.toLowerCase());
  });

  const getStatusVariant = (status) => {
    switch (status) {
      case "PUBLISHED":
        return "default";
      case "STARTED":
        return "default";
      case "FULL":
        return "secondary";
      case "COMPLETED":
        return "outline";
      case "CANCELLED":
        return "destructive";
      case "EXPIRED":
        return "secondary";
      default:
        return "outline";
    }
  };

  const handleOpenCancelDialog = (ride) => {
    setSelectedCancelRide(ride);
    setCancelDialogOpen(true);
  };

  const handleCancelRide = async () => {
    if (!selectedCancelRide?._id) return;

    try {
      setCancelling(true);

      const res = await api.patch(`/ride/cancel/${selectedCancelRide._id}`, {
        reason: "Ride cancelled by driver",
      });

      if (!res.data?.success) {
        throw new Error(res.data?.message || "Failed to cancel ride");
      }

      setRides((prevRides) =>
        prevRides.map((ride) =>
          ride._id === selectedCancelRide._id
            ? {
                ...ride,
                status: "CANCELLED",
                availableSeats: ride.totalSeats,
              }
            : ride,
        ),
      );

      setCancelDialogOpen(false);
      setSelectedCancelRide(null);
    } catch (error) {
      console.error("Cancel Ride Error:", error);
    } finally {
      setCancelling(false);
    }
  };

  const formatDate = (date) => {
    if (!date) return "N/A";

    return new Date(date).toLocaleDateString("en-IN", {
      weekday: "short",
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const formatTime = (date) => {
    if (!date) return "--";

    return new Date(date).toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleViewDetails = (rideId) => {
    setSelectedRideId(rideId);
    setDetailsOpen(true);
  };

  const handleEditRide = (rideId) => {
    console.log("Edit ride:", rideId);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50/70">
        <div className="mx-auto max-w-6xl space-y-5 px-4 py-6 sm:px-6">
          <div className="space-y-2">
            <div className="h-8 w-40 animate-pulse rounded-md bg-muted" />
            <div className="h-4 w-64 animate-pulse rounded-md bg-muted" />
          </div>

          <div className="h-10 w-full max-w-md animate-pulse rounded-lg bg-muted" />

          <div className="grid gap-4 lg:grid-cols-2">
            {[1, 2, 3, 4].map((item) => (
              <div
                key={item}
                className="h-72 animate-pulse rounded-2xl bg-muted"
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/70">
      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6">
        <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="mb-2 flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-white">
                <CarFront className="h-4 w-4" />
              </div>

              <span className="text-sm font-medium text-blue-600">
                Ride Management
              </span>
            </div>

            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              My Rides
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              Manage the rides you have published.
            </p>
          </div>

          <Badge
            variant="secondary"
            className="w-fit rounded-full bg-blue-50 px-3 py-1.5 text-blue-700"
          >
            {rides.length} {rides.length === 1 ? "Ride" : "Rides"}
          </Badge>
        </div>

        <div className="mb-5 max-w-md">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

            <Input
              placeholder="Search by city..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-10 rounded-xl border-slate-200 bg-white pl-9 shadow-sm focus-visible:ring-blue-500"
            />
          </div>
        </div>

        {filteredRides.length === 0 ? (
          <Card className="border-dashed border-slate-300 bg-white shadow-sm">
            <CardContent className="flex min-h-64 flex-col items-center justify-center text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-50">
                <MapPin className="h-5 w-5 text-blue-600" />
              </div>

              <h2 className="mt-4 text-base font-semibold text-slate-900">
                No rides found
              </h2>

              <p className="mt-1 max-w-sm text-sm text-slate-500">
                You don't have any rides matching your search.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 lg:grid-cols-2">
            {filteredRides.map((ride) => {
              const departure =
                ride.departureLocationId?.city ||
                ride.departureLocationId?.name ||
                ride.departureLocationId?.address ||
                "Departure";

              const destination =
                ride.destinationLocationId?.city ||
                ride.destinationLocationId?.name ||
                ride.destinationLocationId?.address ||
                "Destination";

              const bookedSeats =
                (ride.totalSeats || 0) - (ride.availableSeats || 0);

              return (
                <Card
                  key={ride._id}
                  className="overflow-hidden rounded-2xl border-slate-200 bg-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
                >
                  <CardHeader className="px-5 pb-3 pt-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Badge
                          variant={getStatusVariant(ride.status)}
                          className={
                            ride.status === "PUBLISHED"
                              ? "border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-50"
                              : ""
                          }
                        >
                          {ride.status}
                        </Badge>

                        {ride.status === "FULL" && (
                          <span className="text-xs font-medium text-slate-400">
                            All seats booked
                          </span>
                        )}
                      </div>

                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                          >
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>

                        <DropdownMenuContent
                          align="end"
                          sideOffset={6}
                          className="w-40 rounded-xl p-1.5"
                        >
                          <DropdownMenuItem
                            onClick={() => handleEditRide(ride._id)}
                            className="cursor-pointer rounded-lg"
                          >
                            <Pencil className="mr-2 h-4 w-4" />
                            Edit ride
                          </DropdownMenuItem>

                          {["PUBLISHED", "FULL"].includes(ride.status) && (
                            <>
                              <DropdownMenuSeparator />

                              <DropdownMenuItem
                                onClick={() => handleOpenCancelDialog(ride)}
                                className="cursor-pointer rounded-lg text-red-600 focus:bg-red-50 focus:text-red-600"
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Cancel ride
                              </DropdownMenuItem>
                            </>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </CardHeader>

                  <CardContent className="px-5 pb-4">
                    <div className="rounded-xl border border-blue-100 bg-blue-50/40 p-4">
                      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3">
                        <div className="min-w-0">
                          <div className="mb-1 flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wide text-blue-600">
                            <MapPin className="h-3.5 w-3.5" />
                            From
                          </div>

                          <p className="truncate text-sm font-semibold text-slate-900">
                            {departure}
                          </p>

                          <div className="mt-1 flex items-center gap-1.5 text-xs text-slate-500">
                            <Clock3 className="h-3.5 w-3.5" />
                            {formatTime(ride.departureAt)}
                          </div>
                        </div>

                        <div className="flex h-8 w-8 items-center justify-center rounded-full border border-blue-100 bg-white shadow-sm">
                          <ArrowRight className="h-4 w-4 text-blue-600" />
                        </div>

                        <div className="min-w-0 text-right">
                          <div className="mb-1 flex items-center justify-end gap-1.5 text-[11px] font-medium uppercase tracking-wide text-blue-600">
                            To
                            <MapPin className="h-3.5 w-3.5" />
                          </div>

                          <p className="truncate text-sm font-semibold text-slate-900">
                            {destination}
                          </p>

                          <div className="mt-1 flex items-center justify-end gap-1.5 text-xs text-slate-500">
                            <Clock3 className="h-3.5 w-3.5" />
                            {formatTime(ride.estimatedArrivalAt)}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 flex items-center justify-between gap-3">
                      <div className="flex min-w-0 items-center gap-2 text-sm text-slate-600">
                        <CalendarDays className="h-4 w-4 shrink-0 text-blue-600" />

                        <span className="truncate font-medium">
                          {formatDate(ride.departureAt)}
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5 text-sm font-medium text-slate-700">
                        <Users className="h-4 w-4 text-blue-600" />

                        <span>
                          {bookedSeats} / {ride.totalSeats} booked
                        </span>
                      </div>
                    </div>

                    <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-3">
                      <div className="flex min-w-0 items-center gap-2">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-100">
                          <CarFront className="h-4 w-4 text-slate-600" />
                        </div>

                        <div className="min-w-0">
                          <p className="truncate text-xs text-slate-400">
                            Vehicle
                          </p>

                          <p className="truncate text-sm font-medium text-slate-800">
                            {ride.vehicleId
                              ? `${ride.vehicleId.brand || ""} ${
                                  ride.vehicleId.model || ""
                                }`
                              : "Vehicle"}
                          </p>
                        </div>
                      </div>

                      <div className="text-right">
                        <p className="text-[11px] text-slate-400">
                          Price / seat
                        </p>

                        <div className="flex items-center justify-end text-sm font-bold text-slate-900">
                          <IndianRupee className="h-3.5 w-3.5" />
                          {ride.pricePerSeat}
                        </div>
                      </div>
                    </div>
                  </CardContent>

                  <CardFooter className="flex justify-end gap-2 border-t border-slate-100 bg-slate-50/50 px-5 py-3">
                    <Button
                      variant="outline"
                      className="h-9 rounded-lg border-slate-200 bg-white px-4 text-sm"
                      onClick={() => handleViewDetails(ride._id)}
                    >
                      View Details
                    </Button>

                    <Button className="h-9 rounded-lg bg-blue-600 px-4 text-sm shadow-sm hover:bg-blue-700">
                      Manage Ride
                      <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
                    </Button>
                  </CardFooter>
                </Card>
              );
            })}
          </div>
        )}
      </div>
      <AlertDialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
        <AlertDialogContent className="rounded-2xl sm:max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel this ride?</AlertDialogTitle>

            <AlertDialogDescription>
              Are you sure you want to cancel your ride from{" "}
              <span className="font-medium text-foreground">
                {selectedCancelRide?.departureLocationId?.city || "Departure"}
              </span>{" "}
              to{" "}
              <span className="font-medium text-foreground">
                {selectedCancelRide?.destinationLocationId?.city ||
                  "Destination"}
              </span>
              ?
              <span className="mt-2 block">
                This will cancel the ride and all associated bookings.
              </span>
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter>
            <AlertDialogCancel disabled={cancelling}>
              Keep Ride
            </AlertDialogCancel>

            <AlertDialogAction
              onClick={handleCancelRide}
              disabled={cancelling}
              className="bg-red-600 text-white hover:bg-red-700"
            >
              {cancelling ? "Cancelling..." : "Cancel Ride"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <RideDetailsDialog
        rideId={selectedRideId}
        open={detailsOpen}
        onOpenChange={setDetailsOpen}
      />
    </div>
  );
}

export default MyRides;
