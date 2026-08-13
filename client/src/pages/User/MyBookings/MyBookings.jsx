import BookingDetailDialog from "@/components/booking/BookingDetailDialog";
import LicenceDetailsDialog from "@/components/licence/LicenceDetailsDialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import api from "@/services/Api";
import { format } from "date-fns";
import {
  Armchair,
  ArrowRight,
  CalendarDays,
  Car,
  Clock3,
  Eye,
  IndianRupee,
  MapPin,
  Star,
  UserRound,
  Users,
} from "lucide-react";
import React, { useEffect, useState } from "react";

function MyBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [bookingDialogOpen, setBookingDialogOpen] = useState(false);
  const [selectedBookingId, setSelectedBookingId] = useState(null);

  const getMyBookings = async () => {
    try {
      setLoading(true);

      const res = await api.get("/booking/my-bookings");

      if (!res.data?.success) {
        throw new Error(res.data?.message || "Unable to fetch bookings");
      }

      setBookings(res.data.bookings || []);
    } catch (error) {
      console.error("Get My Bookings Error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getMyBookings();
  }, []);

  const handleViewBooking = (bookingId) => {
    setSelectedBookingId(bookingId);
    setBookingDialogOpen(true);
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <p className="text-sm text-muted-foreground">Loading bookings...</p>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-5xl space-y-6 px-4 py-6 sm:px-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">My Bookings</h1>

        <p className="mt-1 text-sm text-muted-foreground">
          Manage all the rides you have booked.
        </p>
      </div>

      {/* <div className="flex flex-wrap gap-2">
        <Button variant="default" size="sm">
          All
        </Button>

        <Button variant="outline" size="sm">
          Upcoming
        </Button>

        <Button variant="outline" size="sm">
          Completed
        </Button>

        <Button variant="outline" size="sm">
          Cancelled
        </Button>
      </div> */}

      {bookings.length === 0 ? (
        <Card>
          <CardContent className="flex min-h-60 flex-col items-center justify-center text-center">
            <Car className="h-10 w-10 text-muted-foreground" />

            <h2 className="mt-4 text-lg font-semibold">No bookings found</h2>

            <p className="mt-1 text-sm text-muted-foreground">
              You have not booked any rides yet.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {bookings.map((booking) => {
            const ride = booking.rideId;
            const owner = ride?.ownerId;
            const vehicle = ride?.vehicleId;
            const departure = ride?.departureLocationId;
            const destination = ride?.destinationLocationId;
            const numberOfSeats = booking.numberOfSeats || 0;
            const amount = booking.totalAmount || 0;

            return (
              <Card
                key={booking._id}
                className="overflow-hidden border-border shadow-sm"
              >
                <CardHeader className="border-b bg-muted/20 px-5 py-3">
                  <div className="flex items-center justify-between">
                    <Badge
                      variant={
                        booking.status === "CONFIRMED"
                          ? "default"
                          : booking.status === "COMPLETED"
                            ? "secondary"
                            : booking.status === "CANCELLED"
                              ? "destructive"
                              : "outline"
                      }
                    >
                      {booking.status}
                    </Badge>

                    <span className="max-w-[220px] truncate text-xs text-muted-foreground">
                      Booking #{booking._id}
                    </span>
                  </div>
                </CardHeader>

                <CardContent className="p-5">
                  <div className="flex flex-col gap-6">
                    <div className="flex items-center gap-4">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 shrink-0 text-primary" />

                          <p className="truncate text-base font-semibold">
                            {departure?.city || "Departure"}
                          </p>
                        </div>

                        <div className="mt-1 flex items-center gap-2 pl-6">
                          <Clock3 className="h-3.5 w-3.5 text-muted-foreground" />

                          <span className="text-xs text-muted-foreground">
                            {ride?.departureAt
                              ? new Date(ride.departureAt).toLocaleTimeString(
                                  [],
                                  {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  },
                                )
                              : "--"}
                          </span>
                        </div>
                      </div>

                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted">
                        <ArrowRight className="h-4 w-4 text-muted-foreground" />
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 shrink-0 text-primary" />

                          <p className="truncate text-base font-semibold">
                            {destination?.city || "Destination"}
                          </p>
                        </div>

                        <div className="mt-1 flex items-center gap-2 pl-6">
                          <Clock3 className="h-3.5 w-3.5 text-muted-foreground" />

                          <span className="text-xs text-muted-foreground">
                            {ride?.estimatedArrivalAt
                              ? new Date(
                                  ride.estimatedArrivalAt,
                                ).toLocaleTimeString([], {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })
                              : "--"}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 border-y py-3 text-sm text-muted-foreground">
                      <CalendarDays className="h-4 w-4" />

                      <span>
                        {ride?.departureAt
                          ? new Date(ride.departureAt).toLocaleDateString(
                              "en-US",
                              {
                                weekday: "short",
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                              },
                            )
                          : "--"}
                      </span>
                    </div>

                    <div className="grid gap-5 sm:grid-cols-2">
                      <div className="flex items-center gap-3">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-full bg-muted">
                          {owner?.profileImage ? (
                            <img
                              src={`http://localhost:8081/${owner.profileImage}`}
                              alt={owner?.name || "Driver"}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <UserRound className="h-5 w-5 text-muted-foreground" />
                          )}
                        </div>

                        <div className="min-w-0">
                          <p className="text-xs text-muted-foreground">
                            Driver
                          </p>

                          <p className="truncate text-sm font-medium">
                            {owner?.firstName} {owner?.lastName}
                          </p>

                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Star className="h-3 w-3 fill-current" />

                            {owner?.averageRating ?? 0}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-muted">
                          {vehicle?.vehicleImages?.[0] ? (
                            <img
                              src={`http://localhost:8081/${vehicle.vehicleImages[0]}`}
                              alt={`${vehicle?.brand || ""} ${vehicle?.model || ""}`}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <Car className="h-5 w-5 text-muted-foreground" />
                          )}
                        </div>

                        <div className="min-w-0">
                          <p className="text-xs text-muted-foreground">
                            Vehicle
                          </p>

                          <p className="truncate text-sm font-medium">
                            {vehicle?.brand || ""} {vehicle?.model || ""}
                          </p>

                          <p className="text-xs text-muted-foreground">
                            {vehicle?.registrationNumber || ""}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 border-t pt-4 sm:grid-cols-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <Armchair className="h-4 w-4 text-muted-foreground" />

                          <p className="text-xs text-muted-foreground">Seats</p>
                        </div>

                        <p className="mt-1 text-sm font-semibold">
                          {numberOfSeats}
                        </p>
                      </div>

                      <div>
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4 text-muted-foreground" />

                          <p className="text-xs text-muted-foreground">
                            Passengers
                          </p>
                        </div>

                        <p className="mt-1 text-sm font-semibold">
                          {numberOfSeats}
                        </p>
                      </div>

                      <div>
                        <div className="flex items-center gap-2">
                          <IndianRupee className="h-4 w-4 text-muted-foreground" />

                          <p className="text-xs text-muted-foreground">
                            Amount
                          </p>
                        </div>

                        <p className="mt-1 text-sm font-semibold">₹{amount}</p>
                      </div>

                      <div>
                        <p className="text-xs text-muted-foreground">
                          Price / Seat
                        </p>

                        <p className="mt-1 text-sm font-semibold">
                          ₹{ride?.pricePerSeat || 0}
                        </p>
                      </div>
                    </div>

                    <div className="flex justify-end border-t pt-4">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => handleViewBooking(booking._id)}
                      >
                        <Eye className="mr-2 h-4 w-4" />
                        View Details
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
      <BookingDetailDialog
        bookingId={selectedBookingId}
        open={bookingDialogOpen}
        onOpenChange={setBookingDialogOpen}
      />
    </div>
  );
}

export default MyBookings;
