import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import api from "@/services/Api";
import socket from "@/services/socket";
import { format } from "date-fns";
import {
  ArrowLeft,
  ArrowRight,
  Car,
  Check,
  Clock,
  Loader2,
  ShieldCheck,
  Star,
  User,
  Users,
} from "lucide-react";
import React, { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";

const RAZORPAY_KEY_ID = import.meta.env.VITE_RAZORPAY_KEY_ID;

function RideDetail() {
  const { rideId } = useParams();
  const location = useLocation();
  const { requestedSeats = 1 } = location.state || {};
  const navigate = useNavigate();

  const [ride, setRide] = useState(null);
  const [loading, setLoading] = useState(true);
  const [occupiedSeats, setOccupiedSeats] = useState([]);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [seatLoading, setSeatLoading] = useState(true);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingMessage, setBookingMessage] = useState("");
  const [bookingError, setBookingError] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [retryLoading, setRetryLoading] = useState(false);
  const [retryBooking, setRetryBooking] = useState(null);

  useEffect(() => {
    getRideDetail();
  }, [rideId]);

  useEffect(() => {
    if (!rideId) {
      return;
    }

    getRideSeats();
  }, [rideId]);

  useEffect(() => {
    if (!rideId) {
      return;
    }
    socket.connect();
    const handleConnect = () => {
      socket.emit("ride:join", rideId);
    };
    socket.on("connect", handleConnect);
    return () => {
      socket.emit("ride:leave", rideId);
      socket.off("connect", handleConnect);
      socket.disconnect();
    };
  }, [rideId]);

  useEffect(() => {
    const handleSeatBooked = (data) => {
      if (data.rideId !== rideId) {
        return;
      }

      const newlyBookedSeats = data.seatNumbers || [];

      setOccupiedSeats((currentSeats) =>
        Array.from(new Set([...currentSeats, ...newlyBookedSeats])),
      );

      setSelectedSeats((currentSeats) =>
        currentSeats.filter((seat) => !newlyBookedSeats.includes(seat)),
      );

      setRide((currentRide) => {
        if (!currentRide) {
          return currentRide;
        }

        return {
          ...currentRide,
          availableSeats: Math.max(
            0,
            currentRide.availableSeats - newlyBookedSeats.length,
          ),
        };
      });
    };
    socket.on("ride:seat-booked", handleSeatBooked);
    return () => {
      socket.off("ride:seat-booked", handleSeatBooked);
    };
  }, [rideId]);

  const openRazorpayCheckout = (razorpayOrder, booking) => {
    if (!razorpayOrder?.id) {
      setBookingError("Unable to create payment order.");
      return;
    }
    if (!RAZORPAY_KEY_ID) {
      setBookingError("Razorpay key is not configured.");
      return;
    }
    const options = {
      key: RAZORPAY_KEY_ID,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      name: "Carpolling",
      description: `${departure?.city || ""} to ${destination?.city || ""}`,
      order_id: razorpayOrder.id,

      handler: async (response) => {
        try {
          setBookingLoading(true);
          setBookingError("");
          setBookingMessage("");

          const verifyResponse = await api.post("/payment/verify", {
            razorpayOrderId: response.razorpay_order_id,
            razorpayPaymentId: response.razorpay_payment_id,
            razorpaySignature: response.razorpay_signature,
          });

          if (!verifyResponse.data?.success) {
            throw new Error(
              verifyResponse.data?.message || "Payment verification failed.",
            );
          }

          setSelectedSeats([]);
          setRetryBooking(null);
          setBookingMessage("Payment successful. Ride booked successfully.");
          toast.success("Payment successful. Ride booked successfully.");

          await getRideSeats();
        } catch (error) {
          console.error("Payment Verification Error:", error);
          setRetryBooking(booking);
          setBookingError(
            error.response?.data?.message ||
              error.message ||
              "Payment verification failed.",
          );

          await getRideSeats();
        } finally {
          setBookingLoading(false);
        }
      },
      modal: {
        ondismiss: () => {
          setBookingLoading(false);
          setRetryBooking(booking);
          setBookingError(
            "Payment was cancelled. Your selected seats are temporarily held.",
          );
        },
      },
      theme: {
        color: "#2563eb",
      },
    };

    const razorpay = new window.Razorpay(options);

    razorpay.on("payment.failed", (response) => {
      console.error("Razorpay Payment Failed:", response.error);

      setBookingLoading(false);
      setRetryBooking(booking);
      setBookingError(
        response.error?.description || "Payment failed. Please try again.",
      );
    });

    razorpay.open();
  };

  const handleRetryPayment = async () => {
    if (!retryBooking?._id) {
      return;
    }
    try {
      setRetryLoading(true);
      setBookingError("");
      setBookingMessage("");

      const res = await api.post("/payment/retry", {
        bookingId: retryBooking._id,
      });
      if (!res.data?.success) {
        throw new Error(res.data?.message || "Unable to retry payment.");
      }

      openRazorpayCheckout(res.data.razorpayOrder, retryBooking);
    } catch (error) {
      console.error("Retry Payment Error:", error);

      setBookingError(
        error.response?.data?.message ||
          error.message ||
          "Unable to retry payment.",
      );
    } finally {
      setRetryLoading(false);
    }
  };

  const handleSeatSelect = (seatNumber) => {
    if (occupiedSeats.includes(seatNumber)) {
      return;
    }
    setBookingError("");
    setBookingMessage("");
    setSelectedSeats((currentSeats) => {
      if (currentSeats.includes(seatNumber)) {
        return currentSeats.filter((seat) => seat !== seatNumber);
      }
      if (currentSeats.length >= requestedSeats) {
        setBookingError(
          `You can select a maximum of ${requestedSeats} ${
            requestedSeats === 1 ? "seat" : "seats"
          } for this search.`,
        );
        return currentSeats;
      }
      return [...currentSeats, seatNumber].sort((a, b) => a - b);
    });
  };

  const getRideSeats = async () => {
    try {
      setSeatLoading(true);
      setBookingError("");
      const res = await api.get(`/booking/ride/${rideId}/seats`);
      if (!res.data?.success) {
        throw new Error(
          res.data?.message || "Unable to load seat availability.",
        );
      }
      setOccupiedSeats(res.data.occupiedSeats || []);
      setRide((currentRide) => {
        if (!currentRide) {
          return currentRide;
        }
        return {
          ...currentRide,
          availableSeats: res.data.availableSeats,
        };
      });
    } catch (error) {
      console.error("Get Ride Seats Error:", error);
      setBookingError(
        error.response?.data?.message ||
          error.message ||
          "Unable to load seat availability.",
      );
    } finally {
      setSeatLoading(false);
    }
  };

  const getRideDetail = async () => {
    try {
      setLoading(true);
      setErrorMessage("");
      const res = await api.get(`/ride/${rideId}`);
      if (!res.data?.success) {
        throw new Error(res.data?.message || "Unable to load ride details.");
      }
      setRide(res.data.ride);
      console.log("RIDE SEATS:", res.data.ride);
    } catch (error) {
      console.error("Get Ride Details Error:", error);
      setErrorMessage(
        error.response?.data?.message ||
          error.message ||
          "Unable to load ride detail.",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    navigate(-1);
  };

  const handleBookRide = async () => {
    if (selectedSeats.length === 0) {
      toast.warning("Please select at least one seat.");
      return;
    }
    try {
      setBookingLoading(true);
      setBookingError("");
      setBookingMessage("");
      setRetryBooking(null);

      const res = await api.post("/booking/book", {
        rideId,
        seats: selectedSeats,
      });

      if (!res.data?.success) {
        throw new Error(res.data?.message || "Unable to book ride.");
      }

      const booking = res.data.booking;
      const razorpayOrder = res.data.razorpayOrder;

      if (!razorpayOrder?.id) {
        throw new Error("Unable to create payment order.");
      }
      openRazorpayCheckout(razorpayOrder, booking);
    } catch (error) {
      console.error("Book Ride Error:", error);
      toast.error(
        error.response?.data?.message ||
          error.message ||
          "Unable to book ride.",
      );
      await getRideSeats();
      setBookingLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <p className="text-sm text-gray-500">Loading ride details...</p>
        </div>
      </div>
    );
  }

  if (errorMessage || !ride) {
    return (
      <div className="mx-auto flex min-h-[70vh] w-full max-w-4xl items-center justify-center px-4">
        <Card className="w-full border-gray-200">
          <CardContent className="flex flex-col items-center justify-center p-10 text-center">
            <Car className="h-12 w-12 text-gray-400" />

            <h2 className="mt-4 text-xl font-semibold text-gray-900">
              Unable to load ride
            </h2>

            <p className="mt-2 text-sm text-red-600">
              {errorMessage || "Ride not found"}
            </p>

            <Button
              type="button"
              variant="outline"
              onClick={handleBack}
              className="mt-5 gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Go Back
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const departureDate = new Date(ride.departureAt);

  const arrivalDate = ride.estimatedArrivalAt
    ? new Date(ride.estimatedArrivalAt)
    : null;

  const owner = ride.ownerId;
  const vehicle = ride.vehicleId;
  const departure = ride.departureLocationId;
  const destination = ride.destinationLocationId;

  const vehicleImage = vehicle?.vehicleImages?.[0];

  const vehicleImageUrl = vehicleImage
    ? `http://localhost:8081/${vehicleImage}`
    : null;

  const profileImageUrl = owner?.profileImage
    ? `http://localhost:8081/${owner.profileImage}`
    : null;

  const rating =
    owner?.rating ?? owner?.averageRating ?? owner?.ratingAverage ?? null;

  const hasRating =
    rating !== null && rating !== undefined && !Number.isNaN(Number(rating));

  const canBook =
    ride.status === "PUBLISHED" &&
    ride.availableSeats > 0 &&
    departureDate > new Date();

  const bookingMode =
    ride.bookingMode === "AUTO" ? "Instant confirmation" : "Driver approval";

  const selectedSeatCount = selectedSeats.length;

  const totalBookingAmount = selectedSeatCount * ride.pricePerSeat;
  const getSeatPassenger = (seatNumber) =>
    ride.seats?.find((seat) => seat.seatNumber === seatNumber)?.passenger;

  const getPassengerInitial = (passenger) =>
    passenger?.firstName?.charAt(0)?.toUpperCase() || "U";
  return (
    <div className="min-h-[calc(100vh-73px)] bg-[#f8fafc]">
      <div className="mx-auto w-full max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
        <button
          type="button"
          onClick={handleBack}
          className="mb-3 flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-gray-900"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to rides
        </button>

        <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,1fr)_360px]">
          <div className="space-y-4">
            <Card className="overflow-hidden border-gray-200 bg-white shadow-sm">
              <CardContent className="p-0">
                <div className="border-b border-gray-100 px-6 py-5">
                  <div className="flex items-center gap-3">
                    <h1 className="text-2xl font-bold text-gray-950">
                      {departure?.city}
                    </h1>

                    <ArrowRight className="h-5 w-5 text-gray-400" />

                    <h1 className="text-2xl font-bold text-gray-950">
                      {destination?.city}
                    </h1>
                  </div>

                  {bookingError && (
                    <div className="mt-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-600">
                      {bookingError}
                    </div>
                  )}

                  {bookingMessage && (
                    <div className="mt-3 rounded-lg border border-green-200 bg-green-50 px-3 py-2 text-xs text-green-700">
                      {bookingMessage}
                    </div>
                  )}

                  <div className="mt-3 flex flex-wrap items-center gap-3">
                    <div className="flex items-center gap-2 rounded-lg bg-gray-50 px-3 py-2 text-xs text-gray-600">
                      <Clock className="h-4 w-4 text-blue-600" />
                      {format(departureDate, "EEE, MMM d")}
                    </div>

                    <div className="flex items-center gap-2 rounded-lg bg-gray-50 px-3 py-2 text-xs text-gray-600">
                      <Clock className="h-4 w-4 text-blue-600" />
                      {format(departureDate, "hh:mm a")}
                    </div>

                    <div className="flex items-center gap-2 rounded-lg bg-blue-50 px-3 py-2 text-xs font-medium text-blue-700">
                      <Users className="h-4 w-4" />
                      {ride.availableSeats} seats available
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-[1.25fr_0.75fr]">
                  <div className="border-r border-gray-100 px-6 py-5">
                    <div className="mb-4 flex items-center gap-2">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50">
                        <Clock className="h-4 w-4 text-blue-600" />
                      </div>

                      <h2 className="text-sm font-semibold text-gray-900">
                        Ride Details
                      </h2>
                    </div>

                    <div className="relative pl-1">
                      <div className="absolute left-[7px] top-5 bottom-5 w-px bg-gray-200" />

                      <div className="relative flex gap-4">
                        <div className="relative z-10 mt-1 h-3.5 w-3.5 shrink-0 rounded-full bg-blue-600 ring-4 ring-blue-50" />

                        <div className="min-w-0 pb-7">
                          <div className="flex items-center gap-3">
                            <span className="text-xs font-semibold text-gray-500">
                              {format(departureDate, "hh:mm a")}
                            </span>

                            <span className="rounded-full bg-blue-50 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide text-blue-700">
                              Pickup
                            </span>
                          </div>

                          <p className="mt-2 text-base font-semibold text-gray-900">
                            {departure?.placeName || departure?.city}
                          </p>

                          <p className="mt-1 text-xs text-gray-500">
                            {departure?.address || departure?.city}
                          </p>
                        </div>
                      </div>

                      <div className="relative flex gap-4">
                        <div className="relative z-10 mt-1 h-3.5 w-3.5 shrink-0 rounded-full bg-gray-500 ring-4 ring-gray-100" />

                        <div>
                          <div className="flex items-center gap-3">
                            <span className="text-xs font-semibold text-gray-500">
                              {arrivalDate
                                ? format(arrivalDate, "hh:mm a")
                                : "Arrival"}
                            </span>

                            <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide text-gray-500">
                              Drop-off
                            </span>
                          </div>

                          <p className="mt-2 text-base font-semibold text-gray-900">
                            {destination?.placeName || destination?.city}
                          </p>

                          <p className="mt-1 text-xs text-gray-500">
                            {destination?.address || destination?.city}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="divide-y divide-gray-100">
                    <div className="px-5 py-5">
                      <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-gray-400">
                        Ride Owner
                      </p>

                      <div className="flex items-center gap-3">
                        {profileImageUrl ? (
                          <img
                            src={profileImageUrl}
                            alt={`${owner?.firstName || ""} ${
                              owner?.lastName || ""
                            }`}
                            className="h-12 w-12 rounded-full object-cover"
                          />
                        ) : (
                          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-50 font-semibold text-blue-600">
                            {owner?.firstName?.charAt(0)?.toUpperCase() || "U"}
                          </div>
                        )}

                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="truncate text-sm font-semibold text-gray-900">
                              {owner?.firstName} {owner?.lastName}
                            </p>

                            {hasRating && (
                              <span className="flex items-center gap-1 rounded-full bg-amber-50 px-2 py-1 text-[10px] font-semibold text-amber-700">
                                <Star className="h-3 w-3 fill-current" />
                                {Number(rating).toFixed(1)}
                              </span>
                            )}
                          </div>

                          <div className="mt-1 flex items-center gap-1 text-xs text-gray-500">
                            <User className="h-3 w-3" />
                            Ride owner
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="px-5 py-5">
                      <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-gray-400">
                        Vehicle
                      </p>

                      <div className="flex items-center gap-3">
                        {vehicleImageUrl ? (
                          <img
                            src={vehicleImageUrl}
                            alt={`${vehicle?.brand || ""} ${
                              vehicle?.model || ""
                            }`}
                            className="h-14 w-20 rounded-lg object-cover"
                          />
                        ) : (
                          <div className="flex h-14 w-20 items-center justify-center rounded-lg bg-gray-100">
                            <Car className="h-6 w-6 text-gray-400" />
                          </div>
                        )}

                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-gray-900">
                            {vehicle?.brand} {vehicle?.model}
                          </p>

                          <p className="mt-1 text-xs text-gray-500">
                            {vehicle?.manufactureYear || ""}
                            {vehicle?.manufactureYear && vehicle?.color
                              ? " • "
                              : ""}
                            {vehicle?.color || ""}
                          </p>

                          <div className="mt-2 flex items-center gap-3 text-[10px] text-gray-500">
                            <span className="flex items-center gap-1">
                              <Users className="h-3 w-3" />
                              {vehicle?.seatingCapacity || ride.totalSeats}{" "}
                              Seats
                            </span>

                            {vehicle?.fuelType && (
                              <span>{vehicle.fuelType}</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-gray-200 bg-white shadow-sm">
              <CardContent className="px-6 py-5">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50">
                        <Users className="h-4 w-4 text-blue-600" />
                      </div>

                      <h2 className="text-sm font-semibold text-gray-900">
                        Select Your Seats
                      </h2>
                    </div>

                    <p className="mt-1 text-xs text-gray-500">
                      Select up to {requestedSeats}{" "}
                      {requestedSeats === 1 ? "seat" : "seats"} for this
                      booking.
                    </p>
                  </div>

                  <div className="rounded-lg bg-gray-50 px-3 py-2 text-right">
                    <p className="text-[10px] text-gray-400">Available</p>

                    <p className="text-sm font-semibold text-gray-900">
                      {ride.availableSeats}
                    </p>
                  </div>
                </div>

                {seatLoading ? (
                  <div className="flex h-[330px] items-center justify-center">
                    <div className="flex flex-col items-center gap-2">
                      <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
                      <p className="text-xs text-gray-500">Loading seats...</p>
                    </div>
                  </div>
                ) : (
                  <TooltipProvider>
                    <div className="flex flex-col items-center pt-4">
                      <div className="w-[260px] rounded-[55px] border-2 border-gray-200 bg-gray-50 px-5 py-4">
                        <div className="mx-auto mb-4 h-8 w-24 rounded-full border border-gray-200 bg-white" />

                        <div className="grid grid-cols-2 gap-3">
                          {Array.from(
                            {
                              length: ride.totalSeats,
                            },
                            (_, index) => index + 1,
                          ).map((seatNumber) => {
                            const isOccupied =
                              occupiedSeats.includes(seatNumber);
                            const isSelected =
                              selectedSeats.includes(seatNumber);
                            const passenger = getSeatPassenger(seatNumber);

                            if (seatNumber === 1) {
                              return (
                                <button
                                  key={seatNumber}
                                  type="button"
                                  disabled={
                                    isOccupied || bookingLoading || retryLoading
                                  }
                                  onClick={() => handleSeatSelect(seatNumber)}
                                  className={[
                                    "flex h-12 flex-col items-center justify-center rounded-lg border-2 transition-all",
                                    isOccupied
                                      ? "cursor-not-allowed border-gray-300 bg-gray-200 text-gray-400"
                                      : isSelected
                                        ? "border-blue-600 bg-blue-600 text-white shadow-sm"
                                        : "border-gray-200 bg-white text-gray-700 hover:border-blue-400 hover:bg-blue-50",
                                  ].join(" ")}
                                >
                                  {isOccupied ? (
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-300 text-xs font-bold text-gray-700 ring-2 ring-white">
                                          {getPassengerInitial(passenger)}
                                        </div>
                                      </TooltipTrigger>

                                      <TooltipContent
                                        side="top"
                                        align="center"
                                        className="w-52 bg-blue-400  rounded-xl p-3"
                                      >
                                        <div className="flex items-center  gap-3">
                                          {passenger?.profileImage ? (
                                            <img
                                              src={`http://localhost:8081/${passenger.profileImage}`}
                                              alt={`${passenger.firstName} ${passenger.lastName}`}
                                              className="h-10 w-10  rounded-full object-cover"
                                            />
                                          ) : (
                                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-50 text-sm font-bold text-blue-600">
                                              {getPassengerInitial(passenger)}
                                            </div>
                                          )}

                                          <div className="min-w-0">
                                            <p className="truncate text-xs font-semibold text-white-900">
                                              {passenger?.firstName}{" "}
                                              {passenger?.lastName}
                                            </p>

                                            <p className="mt-1 text-[10px] text-white-500">
                                              Seat {seatNumber}
                                            </p>
                                          </div>
                                        </div>
                                      </TooltipContent>
                                    </Tooltip>
                                  ) : isSelected ? (
                                    <Check className="h-4 w-4" />
                                  ) : (
                                    <span className="text-sm">💺</span>
                                  )}
                                  <span className="mt-0.5 text-[9px] font-semibold">
                                    Seat {seatNumber}
                                  </span>
                                </button>
                              );
                            }

                            return null;
                          })}

                          <div className="flex h-12 flex-col items-center justify-center rounded-lg border border-gray-200 bg-gray-100 text-gray-400">
                            <span className="text-sm">🔒</span>

                            <span className="mt-0.5 text-[9px] font-bold uppercase">
                              Driver
                            </span>
                          </div>
                        </div>

                        <div className="my-3 h-px bg-gray-200" />

                        <div className="grid grid-cols-3 gap-3">
                          {Array.from(
                            {
                              length: Math.max(0, ride.totalSeats - 1),
                            },
                            (_, index) => index + 2,
                          ).map((seatNumber) => {
                            const isOccupied =
                              occupiedSeats.includes(seatNumber);
                            const isSelected =
                              selectedSeats.includes(seatNumber);
                            const passenger = getSeatPassenger(seatNumber);

                            return (
                              <button
                                key={seatNumber}
                                type="button"
                                disabled={
                                  isOccupied || bookingLoading || retryLoading
                                }
                                onClick={() => handleSeatSelect(seatNumber)}
                                className={[
                                  "flex h-12 flex-col items-center justify-center rounded-lg border-2 transition-all",
                                  isOccupied
                                    ? "cursor-not-allowed border-gray-300 bg-gray-200 text-gray-400"
                                    : isSelected
                                      ? "border-blue-600 bg-blue-600 text-white shadow-sm"
                                      : "border-gray-200 bg-white text-gray-700 hover:border-blue-400 hover:bg-blue-50",
                                ].join(" ")}
                              >
                                {isOccupied ? (
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <div className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-300 text-xs font-bold text-gray-700 ring-2 ring-white">
                                        {getPassengerInitial(passenger)}
                                      </div>
                                    </TooltipTrigger>

                                    <TooltipContent
                                      side="top"
                                      align="center"
                                      className="w-52 bg-blue-400  rounded-xl p-3"
                                    >
                                      <div className="flex items-center  gap-3">
                                        {passenger?.profileImage ? (
                                          <img
                                            src={`http://localhost:8081/${passenger.profileImage}`}
                                            alt={`${passenger.firstName} ${passenger.lastName}`}
                                            className="h-10 w-10  rounded-full object-cover"
                                          />
                                        ) : (
                                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-50 text-sm font-bold text-blue-600">
                                            {getPassengerInitial(passenger)}
                                          </div>
                                        )}

                                        <div className="min-w-0">
                                          <p className="truncate text-xs font-semibold text-white-900">
                                            {passenger?.firstName}{" "}
                                            {passenger?.lastName}
                                          </p>

                                          <p className="mt-1 text-[10px] text-white-500">
                                            Seat {seatNumber}
                                          </p>
                                        </div>
                                      </div>
                                    </TooltipContent>
                                  </Tooltip>
                                ) : isSelected ? (
                                  <Check className="h-4 w-4" />
                                ) : (
                                  <span className="text-sm">💺</span>
                                )}
                                <span className="mt-0.5 text-[9px] font-semibold">
                                  Seat {seatNumber}
                                </span>
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      <div className="mt-4 flex items-center gap-5 text-[10px] text-gray-500">
                        <div className="flex items-center gap-2">
                          <span className="h-3 w-3 rounded bg-white ring-1 ring-gray-300" />
                          Available
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="h-3 w-3 rounded bg-blue-600" />
                          Selected
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="h-3 w-3 rounded bg-gray-300" />
                          Booked
                        </div>
                      </div>
                    </div>
                  </TooltipProvider>
                )}
              </CardContent>
            </Card>
          </div>

          <Card className="border-gray-200 bg-white shadow-sm lg:sticky lg:top-4">
            <CardContent className="p-5">
              <div className="flex items-center gap-3 border-b border-gray-100 pb-4">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50">
                  <Users className="h-5 w-5 text-blue-600" />
                </div>

                <div>
                  <h2 className="font-semibold text-gray-900">
                    Booking Summary
                  </h2>

                  <p className="mt-0.5 text-xs text-gray-500">
                    Review your booking
                  </p>
                </div>
              </div>

              <div className="mt-4 rounded-xl border border-gray-200 p-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">Selected seats</span>

                  <span className="font-semibold text-gray-900">
                    {selectedSeatCount}
                  </span>
                </div>

                {selectedSeatCount > 0 ? (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {selectedSeats.map((seat) => (
                      <span
                        key={seat}
                        className="rounded-lg bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700"
                      >
                        Seat {seat}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="mt-2 text-xs text-gray-400">
                    No seats selected yet
                  </p>
                )}
              </div>

              <div className="mt-3 rounded-xl bg-gray-50 p-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">Price per seat</span>

                  <span className="text-sm font-semibold text-gray-900">
                    ₹{ride.pricePerSeat.toLocaleString("en-IN")}
                  </span>
                </div>

                <div className="my-3 border-t border-gray-200" />

                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-gray-800">
                    Total price
                  </span>

                  <span className="text-xl font-bold text-gray-950">
                    ₹{totalBookingAmount.toLocaleString("en-IN")}
                  </span>
                </div>
              </div>

              <div className="mt-3 rounded-xl border border-blue-100 bg-blue-50/60 p-4">
                <div className="flex gap-3">
                  <ShieldCheck className="h-5 w-5 shrink-0 text-blue-600" />

                  <div>
                    <p className="text-xs font-semibold text-blue-900">
                      {bookingMode}
                    </p>

                    <p className="mt-1 text-[11px] leading-4 text-blue-700">
                      Your booking is protected and seat availability is updated
                      in real time.
                    </p>
                  </div>
                </div>
              </div>

              <Button
                type="button"
                disabled={
                  !canBook ||
                  seatLoading ||
                  bookingLoading ||
                  retryLoading ||
                  selectedSeatCount === 0
                }
                onClick={handleBookRide}
                className="mt-4 h-11 w-full rounded-xl text-sm font-semibold"
              >
                {bookingLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Booking...
                  </>
                ) : selectedSeatCount === 0 ? (
                  "Select a seat"
                ) : (
                  <>
                    Book Ride
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>

              {retryBooking && (
                <Button
                  type="button"
                  variant="outline"
                  disabled={retryLoading || bookingLoading}
                  onClick={handleRetryPayment}
                  className="mt-3 h-11 w-full rounded-xl border-blue-200 text-sm font-semibold text-blue-600 hover:bg-blue-50 hover:text-blue-700"
                >
                  {retryLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Preparing Payment...
                    </>
                  ) : (
                    "Retry Payment"
                  )}
                </Button>
              )}

              <div className="mt-3 flex items-center justify-center gap-2 text-[11px] text-gray-500">
                <ShieldCheck className="h-3.5 w-3.5 text-blue-600" />
                Secure & easy booking
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default RideDetail;
