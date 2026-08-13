import BookingDetailDialog from "@/components/booking/BookingDetailDialog";
import ReviewDialog from "@/components/review/ReviewDialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import api from "@/services/Api";
import {
  ArrowRight,
  CalendarDays,
  Car,
  Clock3,
  Eye,
  MapPin,
  Star,
  UserRound,
} from "lucide-react";
import React, { useEffect, useState } from "react";

function MyBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [bookingDialogOpen, setBookingDialogOpen] = useState(false);
  const [selectedBookingId, setSelectedBookingId] = useState(null);
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
  const [selectedReviewBooking, setSelectedReviewBooking] = useState(null);

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

  const handleRateBooking = async (booking) => {
    try {
      const res = await api.get(`/review/booking/${booking._id}/status`);

      if (!res.data?.success) {
        throw new Error(res.data?.message || "Unable to get review status");
      }
      if (!res.data.canReview) {
        return;
      }
      setSelectedReviewBooking({
        bookingId: booking._id,
        reviewee: res.data.reviewee,
      });
      setReviewDialogOpen(true);
    } catch (error) {
      console.error("Get Review Status Error:", error);
    }
  };

  const handleViewBooking = (bookingId) => {
    setSelectedBookingId(bookingId);
    setBookingDialogOpen(true);
  };

  const getStatusClass = (status) => {
    switch (status) {
      case "CONFIRMED":
        return "border-blue-200 bg-blue-50 text-blue-700";
      case "COMPLETED":
        return "border-emerald-200 bg-emerald-50 text-emerald-700";
      case "CANCELLED":
        return "border-red-200 bg-red-50 text-red-700";
      default:
        return "border-slate-200 bg-slate-50 text-slate-600";
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
          <p className="text-sm text-muted-foreground">
            Loading your bookings...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/70">
      <div className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6 lg:py-10">
        <div className="mb-7">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            My Bookings
          </h1>

          <p className="mt-1.5 text-sm text-slate-500">
            Keep track of the rides you have booked.
          </p>
        </div>

        {bookings.length === 0 ? (
          <Card className="border-slate-200 bg-white shadow-sm">
            <CardContent className="flex min-h-72 flex-col items-center justify-center text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50">
                <Car className="h-7 w-7 text-blue-600" />
              </div>

              <h2 className="mt-5 text-lg font-semibold text-slate-900">
                No bookings yet
              </h2>

              <p className="mt-1 max-w-sm text-sm text-slate-500">
                Once you book a ride, your upcoming and past journeys will
                appear here.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {bookings.map((booking) => {
              const ride = booking.rideId;
              const owner = ride?.ownerId;
              const departure = ride?.departureLocationId;
              const destination = ride?.destinationLocationId;

              const numberOfSeats = booking.numberOfSeats || 0;
              const amount = booking.totalAmount || 0;

              const departureDate = ride?.departureAt
                ? new Date(ride.departureAt)
                : null;

              return (
                <Card
                  key={booking._id}
                  className="group overflow-hidden rounded-2xl border-slate-200 bg-white shadow-sm transition-all duration-200 hover:border-blue-200 hover:shadow-md"
                >
                  <CardHeader className="border-b border-slate-100 bg-gradient-to-r from-blue-50/80 via-white to-white px-4 py-3 sm:px-5">
                    <div className="flex items-center justify-between gap-3">
                      <Badge
                        variant="outline"
                        className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${getStatusClass(
                          booking.status,
                        )}`}
                      >
                        {booking.status}
                      </Badge>

                      <span className="max-w-[170px] truncate text-[11px] text-slate-400 sm:max-w-none">
                        #{booking._id}
                      </span>
                    </div>
                  </CardHeader>

                  <CardContent className="px-4 py-4 sm:px-5">
                    <div className="space-y-4">
                      <div className="rounded-xl border border-blue-100 bg-blue-50/40 px-4 py-3">
                        <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3">
                          <div className="min-w-0">
                            <div className="mb-0.5 flex items-center gap-1.5">
                              <MapPin className="h-3.5 w-3.5 shrink-0 text-blue-600" />

                              <span className="text-[10px] font-medium uppercase tracking-wider text-slate-400">
                                From
                              </span>
                            </div>

                            <p className="truncate text-sm font-semibold text-slate-900">
                              {departure?.city || "Departure"}
                            </p>
                          </div>

                          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-blue-100 bg-white shadow-sm">
                            <ArrowRight className="h-3.5 w-3.5 text-blue-600" />
                          </div>

                          <div className="min-w-0 text-right">
                            <div className="mb-0.5 flex items-center justify-end gap-1.5">
                              <span className="text-[10px] font-medium uppercase tracking-wider text-slate-400">
                                To
                              </span>

                              <MapPin className="h-3.5 w-3.5 shrink-0 text-blue-600" />
                            </div>

                            <p className="truncate text-sm font-semibold text-slate-900">
                              {destination?.city || "Destination"}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 text-xs text-slate-600">
                        <div className="flex items-center gap-1.5">
                          <CalendarDays className="h-3.5 w-3.5 text-blue-600" />

                          <span>
                            {departureDate
                              ? departureDate.toLocaleDateString("en-US", {
                                  weekday: "short",
                                  month: "short",
                                  day: "numeric",
                                  year: "numeric",
                                })
                              : "--"}
                          </span>
                        </div>

                        <div className="h-4 w-px bg-slate-200" />

                        <div className="flex items-center gap-1.5">
                          <Clock3 className="h-3.5 w-3.5 text-blue-600" />

                          <span>
                            {departureDate
                              ? departureDate.toLocaleTimeString([], {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })
                              : "--"}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between border-t border-slate-100 pt-3">
                        <div className="flex min-w-0 items-center gap-2.5">
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full border border-slate-200 bg-blue-50">
                            {owner?.profileImage ? (
                              <img
                                src={`http://localhost:8081/${owner.profileImage}`}
                                alt={owner?.firstName || "Driver"}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <UserRound className="h-4 w-4 text-blue-600" />
                            )}
                          </div>

                          <div className="min-w-0">
                            <p className="text-[10px] text-slate-400">Driver</p>

                            <p className="truncate text-sm font-semibold text-slate-900">
                              {owner?.firstName} {owner?.lastName}
                            </p>

                            <div className="flex items-center gap-1 text-[11px] text-slate-500">
                              <Star className="h-3 w-3 fill-amber-400 text-amber-400" />

                              <span>
                                {owner?.averageRating
                                  ? owner.averageRating.toFixed(1)
                                  : "No ratings yet"}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <div className="rounded-lg bg-blue-50 px-2.5 py-1.5">
                            <p className="text-[9px] font-medium text-blue-600">
                              Seats
                            </p>

                            <p className="text-xs font-semibold text-slate-900">
                              {numberOfSeats}
                            </p>
                          </div>

                          <div className="rounded-lg bg-slate-50 px-2.5 py-1.5">
                            <p className="text-[9px] font-medium text-slate-500">
                              Total
                            </p>

                            <p className="text-xs font-semibold text-slate-900">
                              ₹{amount}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="flex justify-end gap-2 border-t border-slate-100 pt-3">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="h-8 rounded-lg border-blue-200 px-3 text-xs text-blue-600 hover:bg-blue-50 hover:text-blue-700"
                          onClick={() => handleViewBooking(booking._id)}
                        >
                          <Eye className="mr-1.5 h-3.5 w-3.5" />
                          View Details
                        </Button>

                        {booking.status === "COMPLETED" && (
                          <Button
                            type="button"
                            size="sm"
                            className="h-8 rounded-lg bg-blue-600 px-3 text-xs hover:bg-blue-700"
                            onClick={() => handleRateBooking(booking)}
                          >
                            <Star className="mr-1.5 h-3.5 w-3.5" />
                            Rate
                          </Button>
                        )}
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
        <ReviewDialog
          bookingId={selectedReviewBooking?.bookingId}
          reviewee={selectedReviewBooking?.reviewee}
          open={reviewDialogOpen}
          onOpenChange={setReviewDialogOpen}
          onReviewSubmitted={() => {
            setSelectedReviewBooking(null);
          }}
        />
      </div>
    </div>
  );
}

export default MyBookings;
