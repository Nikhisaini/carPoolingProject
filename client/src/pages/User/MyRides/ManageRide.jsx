import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  CarFront,
  CheckCircle2,
  Clock3,
  IndianRupee,
  Loader2,
  MapPin,
  Phone,
  Play,
  Send,
  User,
  Users,
  XCircle,
} from "lucide-react";

import api from "@/services/Api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
import { toast } from "sonner";

function ManageRide() {
  const { rideId } = useParams();
  const navigate = useNavigate();
  const [verifyingOtp, setVerifyingOtp] = useState(null);
  const [otpValues, setOtpValues] = useState({});
  const [ride, setRide] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sendingOtp, setSendingOtp] = useState(null);
  const [startingRide, setStartingRide] = useState(false);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [completingRide, setCompletingRide] = useState(false);
  const [noShowBooking, setNoShowBooking] = useState(null);
  const [noShowDialogOpen, setNoShowDialogOpen] = useState(false);
  const [noShowReason, setNoShowReason] = useState("");
  const [noShowNote, setNoShowNote] = useState("");
  const [markingNoShow, setMarkingNoShow] = useState(false);

  const getManageRide = async () => {
    try {
      setLoading(true);

      const [rideResponse, bookingResponse] = await Promise.all([
        api.get(`/ride/${rideId}`),
        api.get(`/booking/manage-ride/${rideId}`),
      ]);

      setRide(
        rideResponse.data?.ride ||
          rideResponse.data?.data?.ride ||
          rideResponse.data?.data,
      );

      const passengers =
        bookingResponse.data?.passengers ||
        bookingResponse.data?.data?.passengers ||
        [];

      setBookings(passengers);
    } catch (error) {
      console.error("Get Manage Ride Error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (rideId) {
      getManageRide();
    }
  }, [rideId]);

  const handleSendOtp = async (booking) => {
    if (!booking?.bookingId) return;

    try {
      setSendingOtp(booking.bookingId);

      const res = await api.post("/ride-checkin/send-otp", {
        rideId,
        bookingId: booking.bookingId,
      });

      if (!res.data?.success) {
        throw new Error(res.data?.message || "Failed to send check-in OTP");
      }

      setBookings((prev) =>
        prev.map((item) =>
          item.bookingId === booking.bookingId
            ? {
                ...item,
                checkIn: res.data.checkIn,
              }
            : item,
        ),
      );

      toast.success(res.data?.message);
    } catch (error) {
      console.error("Send OTP Error:", error);

      toast.error(
        error.response?.data?.message || error.message || "Unable to send OTP",
      );
    } finally {
      setSendingOtp(null);
    }
  };

  const handleVerifyOtp = async (booking) => {
    const otp = otpValues[booking.bookingId];

    if (!otp || otp.length !== 6) {
      toast.error("Please enter a valid 6-digit OTP");
      return;
    }

    try {
      setVerifyingOtp(booking.bookingId);

      const res = await api.post("/ride-checkin/verify-otp", {
        rideId,
        bookingId: booking.bookingId,
        otp,
      });

      if (!res.data?.success) {
        throw new Error(res.data?.message || "OTP verification failed");
      }

      setBookings((prev) =>
        prev.map((item) =>
          item.bookingId === booking.bookingId
            ? {
                ...item,
                checkIn: res.data.checkIn || {
                  ...item.checkIn,
                  status: "VERIFIED",
                },
              }
            : item,
        ),
      );
      setOtpValues((prev) => {
        const updated = { ...prev };
        delete updated[booking.bookingId];
        return updated;
      });

      toast.success(res.data?.message || "Passenger verified successfully");
    } catch (error) {
      console.error("Verify OTP Error:", error);

      toast.error(
        error.response?.data?.message || error.message || "Invalid OTP",
      );
    } finally {
      setVerifyingOtp(null);
    }
  };

  const handleStartRide = async () => {
    try {
      setStartingRide(true);

      const res = await api.patch(`/ride/start/${rideId}`);

      if (!res.data?.success) {
        throw new Error(res.data?.message || "Failed to start ride");
      }

      setRide((prev) => ({
        ...prev,
        status: "STARTED",
      }));
    } catch (error) {
      console.error("Start Ride Error:", error);

      toast.error(
        error.response?.data?.message ||
          error.message ||
          "Unable to start ride",
      );
    } finally {
      setStartingRide(false);
    }
  };

  const handleCompleteRide = async () => {
    try {
      setCompletingRide(true);

      const res = await api.patch(`/ride/complete/${rideId}`);

      if (!res.data?.success) {
        throw new Error(res.data?.message || "Failed to complete ride");
      }

      setRide((prev) => ({
        ...prev,
        status: "COMPLETED",
        completedAt: res.data?.ride?.completedAt,
      }));

      toast.success(res.data?.message || "Ride completed successfully");
    } catch (error) {
      console.error("Complete Ride Error:", error);

      toast.error(
        error.response?.data?.message ||
          error.message ||
          "Unable to complete ride",
      );
    } finally {
      setCompletingRide(false);
    }
  };

  const handleCancelRide = async () => {
    try {
      setCancelling(true);

      const res = await api.patch(`/ride/cancel/${rideId}`, {
        reason: "Ride cancelled by driver",
      });

      if (!res.data?.success) {
        throw new Error(res.data?.message || "Failed to cancel ride");
      }

      setRide((prev) => ({
        ...prev,
        status: "CANCELLED",
      }));

      setCancelDialogOpen(false);
    } catch (error) {
      console.error("Cancel Ride Error:", error);

      toast.error(
        error.response?.data?.message ||
          error.message ||
          "Unable to cancel ride",
      );
    } finally {
      setCancelling(false);
    }
  };

  const handleMarkNoShow = async () => {
    if (!noShowBooking || !noShowReason) {
      toast.error("Please select a no-show reason");
      return;
    }

    try {
      setMarkingNoShow(true);

      const res = await api.patch("/ride-checkin/no-show", {
        rideId,
        bookingId: noShowBooking.bookingId,
        noShowReason,
        noShowNote,
      });

      if (!res.data?.success) {
        throw new Error(
          res.data?.message || "Failed to mark passenger as no-show",
        );
      }

      setBookings((prev) =>
        prev.map((item) =>
          item.bookingId === noShowBooking.bookingId
            ? {
                ...item,
                checkIn: res.data.checkIn,
              }
            : item,
        ),
      );

      toast.success("Passenger marked as no-show");

      setNoShowDialogOpen(false);
      setNoShowBooking(null);
      setNoShowReason("");
      setNoShowNote("");
    } catch (error) {
      console.error("Mark No-Show Error:", error);

      toast.error(
        error.response?.data?.message ||
          error.message ||
          "Unable to mark passenger as no-show",
      );
    } finally {
      setMarkingNoShow(false);
    }
  };

  const getCheckInStatus = (booking) => {
    return (
      booking?.checkIn?.status || booking?.rideCheckIn?.status || "WAITING"
    );
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

  const getStatusVariant = (status) => {
    switch (status) {
      case "PUBLISHED":
        return "default";
      case "STARTED":
        return "default";
      case "COMPLETED":
        return "outline";
      case "CANCELLED":
        return "destructive";
      case "FULL":
        return "secondary";
      default:
        return "outline";
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <p className="text-sm text-slate-500">Loading ride details...</p>
        </div>
      </div>
    );
  }

  if (!ride) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50">
        <h2 className="text-lg font-semibold text-slate-900">Ride not found</h2>

        <Button
          variant="outline"
          className="mt-4"
          onClick={() => navigate("/my-rides")}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to My Rides
        </Button>
      </div>
    );
  }

  const departure = ride.departureLocationId;
  const destination = ride.destinationLocationId;
  const vehicle = ride.vehicleId;
  const bookedSeats = ride.totalSeats - ride.availableSeats;

  return (
    <div className="min-h-screen bg-slate-50/70">
      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6">
        <div className="mb-6">
          <Button
            variant="ghost"
            className="mb-3 -ml-2 gap-2"
            onClick={() => navigate("/my-rides")}
          >
            <ArrowLeft className="h-4 w-4" />
            My Rides
          </Button>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                Manage Ride
              </h1>

              <p className="mt-1 text-sm text-slate-500">
                Manage passengers, check-ins and ride status.
              </p>
            </div>

            <Badge
              variant={getStatusVariant(ride.status)}
              className="w-fit rounded-full px-3 py-1.5"
            >
              {ride.status}
            </Badge>
          </div>
        </div>

        <Card className="mb-5 overflow-hidden rounded-2xl border-slate-200 shadow-sm">
          <CardHeader className="border-b border-slate-100">
            <h2 className="font-semibold text-slate-900">Ride Information</h2>
          </CardHeader>

          <CardContent className="p-5">
            <div className="rounded-xl border border-blue-100 bg-blue-50/40 p-5">
              <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-4">
                <div>
                  <div className="mb-1 flex items-center gap-2 text-xs font-medium uppercase text-blue-600">
                    <MapPin className="h-4 w-4" />
                    From
                  </div>

                  <p className="font-semibold text-slate-900">
                    {departure?.city ||
                      departure?.name ||
                      departure?.address ||
                      "Departure"}
                  </p>

                  <p className="mt-1 text-xs text-slate-500">
                    {formatTime(ride.departureAt)}
                  </p>
                </div>

                <div className="flex h-9 w-9 items-center justify-center rounded-full border border-blue-100 bg-white">
                  <ArrowRight className="h-4 w-4 text-blue-600" />
                </div>

                <div className="text-right">
                  <div className="mb-1 flex items-center justify-end gap-2 text-xs font-medium uppercase text-blue-600">
                    To
                    <MapPin className="h-4 w-4" />
                  </div>

                  <p className="font-semibold text-slate-900">
                    {destination?.city ||
                      destination?.name ||
                      destination?.address ||
                      "Destination"}
                  </p>

                  <p className="mt-1 text-xs text-slate-500">
                    {formatTime(ride.estimatedArrivalAt)}
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <InfoItem
                icon={<CalendarDays />}
                label="Date"
                value={formatDate(ride.departureAt)}
              />

              <InfoItem
                icon={<Clock3 />}
                label="Departure"
                value={formatTime(ride.departureAt)}
              />

              <InfoItem
                icon={<Users />}
                label="Seats"
                value={`${bookedSeats} / ${ride.totalSeats} booked`}
              />

              <InfoItem
                icon={<IndianRupee />}
                label="Price / Seat"
                value={`₹${ride.pricePerSeat}`}
              />
            </div>

            <div className="mt-4 flex items-center gap-3 border-t border-slate-100 pt-4">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100">
                <CarFront className="h-4 w-4 text-slate-600" />
              </div>

              <div>
                <p className="text-xs text-slate-400">Vehicle</p>

                <p className="text-sm font-semibold text-slate-800">
                  {vehicle?.brand} {vehicle?.model}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-slate-200 shadow-sm">
          <CardHeader className="border-b border-slate-100">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-semibold text-slate-900">Passengers</h2>

                <p className="mt-1 text-xs text-slate-500">
                  Verify passenger arrival using OTP.
                </p>
              </div>

              <Badge variant="secondary">
                {bookings.length}{" "}
                {bookings.length === 1 ? "Passenger" : "Passengers"}
              </Badge>
            </div>
          </CardHeader>

          <CardContent className="p-4">
            {bookings.length === 0 ? (
              <div className="flex min-h-40 flex-col items-center justify-center text-center">
                <Users className="h-8 w-8 text-slate-300" />

                <p className="mt-3 text-sm font-medium text-slate-700">
                  No confirmed passengers
                </p>

                <p className="mt-1 text-xs text-slate-400">
                  Bookings will appear here.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {bookings.map((booking) => {
                  const passenger = booking.passengerId || booking.passenger;
                  const checkInStatus = getCheckInStatus(booking);
                  const isVerified = checkInStatus === "VERIFIED";
                  const isOtpSent = checkInStatus === "OTP_SENT";
                  const isNoShow = checkInStatus === "NO_SHOW";

                  return (
                    <div
                      key={booking.bookingId}
                      className="rounded-xl border border-slate-200 bg-white p-4"
                    >
                      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex items-center gap-3">
                          {passenger?.profileImage ? (
                            <img
                              src={`http://localhost:8081/${passenger.profileImage}`}
                              alt={passenger.firstName}
                              className="h-11 w-11 rounded-full object-cover"
                            />
                          ) : (
                            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-blue-50 text-blue-600">
                              <User className="h-5 w-5" />
                            </div>
                          )}

                          <div>
                            <p className="font-semibold text-slate-900">
                              {passenger?.firstName} {passenger?.lastName}
                            </p>

                            <div className="mt-1 flex flex-wrap gap-2 text-xs text-slate-500">
                              <span>
                                {booking.seats?.length
                                  ? `Seats: ${booking.seats.map((seat) => seat.seatNumber).join(", ")}`
                                  : `${booking.numberOfSeats || 1} seat(s)`}
                              </span>

                              {booking.paymentStatus && (
                                <span>
                                  Payment:{" "}
                                  <span className="font-medium text-green-600">
                                    {booking.paymentStatus}
                                  </span>
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-col gap-2 sm:items-end">
                          {isVerified ? (
                            <Badge className="gap-1 bg-green-50 text-green-700 hover:bg-green-50">
                              <CheckCircle2 className="h-3.5 w-3.5" />
                              Verified
                            </Badge>
                          ) : isNoShow ? (
                            <Badge className="gap-1 bg-red-50 text-red-700 hover:bg-red-50">
                              <XCircle className="h-3.5 w-3.5" />
                              No Show
                            </Badge>
                          ) : isOtpSent ? (
                            <Badge className="gap-1 bg-amber-50 text-amber-700 hover:bg-amber-50">
                              <Clock3 className="h-3.5 w-3.5" />
                              OTP Sent
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="gap-1">
                              Waiting
                            </Badge>
                          )}

                          {!isVerified && (
                            <div className="flex flex-col gap-2">
                              {isOtpSent && (
                                <div className="flex gap-2">
                                  <input
                                    type="text"
                                    inputMode="numeric"
                                    maxLength={6}
                                    value={otpValues[booking.bookingId] || ""}
                                    onChange={(e) => {
                                      const value = e.target.value.replace(
                                        /\D/g,
                                        "",
                                      );

                                      setOtpValues((prev) => ({
                                        ...prev,
                                        [booking.bookingId]: value,
                                      }));
                                    }}
                                    placeholder="Enter OTP"
                                    className="h-9 w-28 rounded-md border border-slate-200 px-3 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                                  />

                                  <Button
                                    size="sm"
                                    className="gap-2"
                                    disabled={
                                      verifyingOtp === booking.bookingId ||
                                      (otpValues[booking.bookingId] || "")
                                        .length !== 6
                                    }
                                    onClick={() => handleVerifyOtp(booking)}
                                  >
                                    {verifyingOtp === booking.bookingId ? (
                                      <>
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                        Verifying...
                                      </>
                                    ) : (
                                      <>
                                        <CheckCircle2 className="h-4 w-4" />
                                        Verify
                                      </>
                                    )}
                                  </Button>
                                </div>
                              )}

                              <Button
                                size="sm"
                                variant={isOtpSent ? "outline" : "default"}
                                className="gap-2"
                                disabled={sendingOtp === booking.bookingId}
                                onClick={() => handleSendOtp(booking)}
                              >
                                {sendingOtp === booking.bookingId ? (
                                  <>
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    Sending...
                                  </>
                                ) : (
                                  <>
                                    <Send className="h-4 w-4" />
                                    {isOtpSent ? "Resend OTP" : "Send OTP"}
                                  </>
                                )}
                              </Button>
                              {!isVerified && !isNoShow && (
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  className="gap-2"
                                  onClick={() => {
                                    setNoShowBooking(booking);
                                    setNoShowDialogOpen(true);
                                  }}
                                >
                                  <XCircle className="h-4 w-4" />
                                  Mark No Show
                                </Button>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="mt-5 rounded-2xl border-slate-200 shadow-sm">
          <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:justify-end">
            {ride.status === "PUBLISHED" && (
              <Button
                className="gap-2 bg-green-600 hover:bg-green-700"
                disabled={startingRide}
                onClick={handleStartRide}
              >
                {startingRide ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Play className="h-4 w-4" />
                )}
                Start Ride
              </Button>
            )}

            {["PUBLISHED", "FULL"].includes(ride.status) && (
              <Button
                variant="destructive"
                className="gap-2"
                onClick={() => setCancelDialogOpen(true)}
              >
                <XCircle className="h-4 w-4" />
                Cancel Ride
              </Button>
            )}
            {ride.status === "STARTED" && (
              <Button
                className="gap-2 bg-blue-600 hover:bg-blue-700"
                disabled={completingRide}
                onClick={handleCompleteRide}
              >
                {completingRide ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Completing...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="h-4 w-4" />
                    Complete Ride
                  </>
                )}
              </Button>
            )}
          </CardContent>
        </Card>
      </div>

      <AlertDialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
        <AlertDialogContent className="rounded-2xl sm:max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel this ride?</AlertDialogTitle>

            <AlertDialogDescription>
              This will cancel the ride and its associated bookings. This action
              cannot be undone.
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
              {cancelling ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Cancelling...
                </>
              ) : (
                "Cancel Ride"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      <AlertDialog open={noShowDialogOpen} onOpenChange={setNoShowDialogOpen}>
        <AlertDialogContent className="rounded-2xl sm:max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle>Mark Passenger as No Show?</AlertDialogTitle>

            <AlertDialogDescription>
              Select the reason why this passenger did not board the ride.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <div className="space-y-4 py-2">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Reason
              </label>

              <select
                value={noShowReason}
                onChange={(e) => setNoShowReason(e.target.value)}
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500"
              >
                <option value="">Select reason</option>

                <option value="PASSENGER_NOT_ARRIVED">
                  Passenger did not arrive
                </option>

                <option value="PASSENGER_NOT_REACHABLE">
                  Passenger not reachable
                </option>

                <option value="PASSENGER_REFUSED_TO_BOARD">
                  Passenger refused to board
                </option>

                <option value="OTHER">Other</option>
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Additional Note
              </label>

              <textarea
                value={noShowNote}
                onChange={(e) => setNoShowNote(e.target.value)}
                placeholder="Enter additional details..."
                maxLength={500}
                rows={3}
                className="w-full resize-none rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <AlertDialogFooter>
            <AlertDialogCancel disabled={markingNoShow}>
              Cancel
            </AlertDialogCancel>

            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                handleMarkNoShow();
              }}
              disabled={!noShowReason || markingNoShow}
              className="bg-red-600 text-white hover:bg-red-700"
            >
              {markingNoShow ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Marking...
                </>
              ) : (
                "Mark No Show"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function InfoItem({ icon, label, value }) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
        {React.cloneElement(icon, {
          className: "h-4 w-4",
        })}
      </div>

      <div className="min-w-0">
        <p className="text-xs text-slate-400">{label}</p>

        <p className="truncate text-sm font-semibold text-slate-800">{value}</p>
      </div>
    </div>
  );
}

export default ManageRide;
