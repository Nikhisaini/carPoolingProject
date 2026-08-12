import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import api from "@/services/Api";
import socket from "@/services/socket";
import { format } from "date-fns";
import {
  ArrowLeft,
  ArrowRight,
  Car,
  CheckCircle2,
  Clock,
  IndianRupee,
  Loader2,
  ShieldCheck,
  Star,
  User,
  Users,
} from "lucide-react";
import React, { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";

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
      console.log("Socket connected:", socket.id);

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

      setOccupiedSeats((currentSeats) => {
        return Array.from(new Set([...currentSeats, ...newlyBookedSeats]));
      });

      setSelectedSeats((currentSeats) => {
        return currentSeats.filter((seat) => !newlyBookedSeats.includes(seat));
      });

      setRide((currentRide) => {
        if (!currentRide) {
          return currentRide;
        }

        return {
          ...currentRide,
          availableSeats: data.availableSeats,
        };
      });
    };

    socket.on("ride:seat-booked", handleSeatBooked);

    return () => {
      socket.off("ride:seat-booked", handleSeatBooked);
    };
  }, [rideId]);

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
          res.data?.message || "unable to load seat availability",
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

      const res = await api.get(`/ride/getride/${rideId}`);

      if (!res.data?.success) {
        throw new Error(res.data?.message || "Unable to load ride details.");
      }

      setRide(res.data.ride);
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
      setBookingError("Please select at least one seat.");
      return;
    }

    try {
      setBookingLoading(true);
      setBookingError("");
      setBookingMessage("");

      const res = await api.post("/booking/book", {
        rideId,
        seats: selectedSeats,
      });

      if (!res.data?.success) {
        throw new Error(res.data?.message || "Unable to book ride.");
      }

      const booking = res.data.booking;

      setBookingMessage(
        booking?.status === "CONFIRMED"
          ? "Ride booked successfully."
          : "Booking request submitted successfully.",
      );

      setSelectedSeats([]);
    } catch (error) {
      console.error("Book Ride Error:", error);

      setBookingError(
        error.response?.data?.message ||
          error.message ||
          "Unable to book ride.",
      );

      /*
       * Refresh seat state because another user may
       * have taken one of the selected seats.
       */
      await getRideSeats();
    } finally {
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
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <button
          type="button"
          onClick={handleBack}
          className="mb-6 flex items-center gap-2 text-sm font-medium text-gray-600 transition hover:text-gray-900"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to rides
        </button>

        <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,1fr)_320px]">
          <div className="space-y-5">
            <Card className="border-gray-200 bg-white shadow-sm">
              <CardContent className="p-6 sm:p-7">
                <div>
                  <div className="flex items-center gap-3">
                    <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
                      {departure?.city}
                    </h1>

                    <ArrowRight className="h-5 w-5 text-gray-400" />

                    <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
                      {destination?.city}
                    </h1>
                  </div>

                  <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm">
                    <div className="flex items-center gap-2 text-gray-600">
                      <Clock className="h-4 w-4 text-blue-600" />
                      <span>{format(departureDate, "EEE, MMM d")}</span>
                      <span>•</span>
                      <span>{format(departureDate, "hh:mm a")}</span>
                    </div>

                    <div className="flex items-center gap-2 text-gray-600">
                      <Users className="h-4 w-4 text-blue-600" />

                      <span>
                        <strong className="text-gray-900">
                          {ride.availableSeats}
                        </strong>{" "}
                        {ride.availableSeats === 1 ? "seat" : "seats"} available
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-6 rounded-xl border border-gray-200 p-5">
                  <div className="relative">
                    <div className="absolute left-[5px] top-3 bottom-3 w-px bg-gray-200" />
                    <div className="relative flex gap-5">
                      <div className="relative z-10 mt-1 h-3 w-3 shrink-0 rounded-full bg-blue-600 ring-4 ring-blue-50" />

                      <div className="grid flex-1 grid-cols-[70px_1fr] gap-3">
                        <div className="text-sm font-medium text-gray-500">
                          {format(departureDate, "hh:mm a")}
                        </div>

                        <div>
                          <p className="text-xs font-medium uppercase tracking-wide text-blue-600">
                            Pickup
                          </p>

                          <h2 className="mt-1 text-base font-semibold text-gray-900">
                            {departure?.placeName || departure?.city}
                          </h2>

                          <p className="mt-1 text-sm text-gray-500">
                            {departure?.address || departure?.city}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="relative mt-8 flex gap-5">
                      <div className="relative z-10 mt-1 h-3 w-3 shrink-0 rounded-full bg-gray-700 ring-4 ring-gray-100" />

                      <div className="grid flex-1 grid-cols-[70px_1fr] gap-3">
                        <div className="text-sm font-medium text-gray-500">
                          {arrivalDate
                            ? format(arrivalDate, "hh:mm a")
                            : "Arrival"}
                        </div>

                        <div>
                          <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                            Drop-off
                          </p>

                          <h2 className="mt-1 text-base font-semibold text-gray-900">
                            {destination?.placeName || destination?.city}
                          </h2>

                          <p className="mt-1 text-sm text-gray-500">
                            {destination?.address || destination?.city}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-4 flex flex-col overflow-hidden rounded-xl border border-gray-200 sm:flex-row">
                  <div className="flex flex-1 items-center gap-4 p-4 sm:p-5">
                    {profileImageUrl ? (
                      <img
                        src={profileImageUrl}
                        alt={`${owner?.firstName || ""} ${
                          owner?.lastName || ""
                        }`}
                        className="h-14 w-14 shrink-0 rounded-full object-cover"
                      />
                    ) : (
                      <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-blue-50 text-lg font-bold text-blue-600">
                        {owner?.firstName?.charAt(0)?.toUpperCase() || "U"}
                      </div>
                    )}

                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-base font-semibold text-gray-900">
                          {owner?.firstName} {owner?.lastName}
                        </h3>

                        {hasRating && (
                          <span className="flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-xs font-semibold text-amber-700">
                            <Star className="h-3 w-3 fill-current" />
                            {Number(rating).toFixed(1)}
                          </span>
                        )}
                      </div>

                      <p className="mt-1 flex items-center gap-1.5 text-sm text-gray-500">
                        <User className="h-3.5 w-3.5" />
                        Ride owner
                      </p>
                    </div>
                  </div>

                  <div className="hidden w-px bg-gray-200 sm:block" />

                  <div className="flex flex-1 items-center gap-4 border-t border-gray-200 p-4 sm:border-t-0 sm:p-5">
                    {vehicleImageUrl ? (
                      <img
                        src={vehicleImageUrl}
                        alt={`${vehicle?.brand || ""} ${vehicle?.model || ""}`}
                        className="h-16 w-24 rounded-lg object-cover"
                      />
                    ) : (
                      <div className="flex h-16 w-24 items-center justify-center rounded-lg bg-gray-100">
                        <Car className="h-7 w-7 text-gray-400" />
                      </div>
                    )}
                    <div>
                      <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                        Vehicle
                      </p>
                      <h3 className="mt-1 text-base font-semibold text-gray-900">
                        {vehicle?.brand} {vehicle?.model}
                      </h3>

                      <p className="mt-1 text-sm text-gray-500">
                        {vehicle?.manufactureYear
                          ? `${vehicle.manufactureYear}`
                          : ""}
                        {vehicle?.manufactureYear && vehicle?.color
                          ? " • "
                          : ""}
                        {vehicle?.color || ""}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="lg:sticky lg:top-6">
            <Card className="border-gray-200 bg-white shadow-sm">
              <CardContent className="p-6">
                <div className="flex items-center justify-between border-b border-gray-100 pb-5">
                  <div className="flex items-center gap-3">
                    <Users className="h-5 w-5 text-blue-600" />

                    <span className="text-sm text-gray-600">
                      Passenger seats
                    </span>
                  </div>

                  <span className="text-sm font-semibold text-gray-900">
                    {ride.availableSeats}
                  </span>
                </div>

                <div className="pt-5">
                  <p className="text-sm font-semibold text-gray-900">
                    Select your seats
                  </p>

                  <p className="mt-1 text-xs text-gray-500">
                    Driver seat is locked. Select available passenger seats.
                  </p>

                  {seatLoading ? (
                    <div className="flex min-h-64 items-center justify-center">
                      <div className="flex flex-col items-center gap-3">
                        <Loader2 className="h-6 w-6 animate-spin text-blue-600" />

                        <p className="text-xs text-gray-500">
                          Loading seats...
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="mt-5">
                      {/* Car */}
                      <div className="mx-auto w-full max-w-[250px] rounded-[55px] border-2 border-gray-200 bg-gray-50 px-5 pb-6 pt-8">
                        {/* Front / windshield */}
                        <div className="mx-auto mb-6 h-12 w-28 rounded-[30px] border border-gray-200 bg-white" />

                        {/* Driver row */}
                        <div className="mb-4 grid grid-cols-2 gap-4">
                          <button
                            type="button"
                            disabled
                            className="flex h-16 flex-col items-center justify-center rounded-xl border-2 border-gray-200 bg-gray-100 text-gray-400"
                          >
                            <span className="text-xl">🔒</span>

                            <span className="mt-1 text-[10px] font-semibold uppercase tracking-wide">
                              Driver
                            </span>
                          </button>

                          <div />
                        </div>

                        {/* Passenger seats */}
                        <div className="grid grid-cols-2 gap-4">
                          {Array.from(
                            { length: ride.totalSeats },
                            (_, index) => index + 1,
                          ).map((seatNumber) => {
                            const isOccupied =
                              occupiedSeats.includes(seatNumber);

                            const isSelected =
                              selectedSeats.includes(seatNumber);

                            return (
                              <button
                                key={seatNumber}
                                type="button"
                                disabled={isOccupied || bookingLoading}
                                onClick={() => handleSeatSelect(seatNumber)}
                                className={[
                                  "flex h-16 flex-col items-center justify-center rounded-xl border-2 transition",
                                  isOccupied
                                    ? "cursor-not-allowed border-gray-300 bg-gray-200 text-gray-400"
                                    : isSelected
                                      ? "border-blue-600 bg-blue-600 text-white shadow-sm"
                                      : "border-gray-200 bg-white text-gray-700 hover:border-blue-400 hover:bg-blue-50",
                                ].join(" ")}
                              >
                                <span className="text-lg">
                                  {isOccupied ? "✕" : isSelected ? "✓" : "💺"}
                                </span>

                                <span className="mt-1 text-[11px] font-semibold">
                                  Seat {seatNumber}
                                </span>
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Legend */}
                      <div className="mt-5 flex flex-wrap justify-center gap-4 text-[11px] text-gray-500">
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
                  )}

                  {/* Booking summary */}
                  <div className="mt-6 rounded-xl bg-gray-50 p-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">
                        Selected seats
                      </span>

                      <span className="text-sm font-semibold text-gray-900">
                        {selectedSeatCount}
                      </span>
                    </div>

                    {selectedSeatCount > 0 && (
                      <div className="mt-2 flex items-center justify-between">
                        <span className="text-sm text-gray-500">Seats</span>

                        <span className="text-sm font-medium text-gray-900">
                          {selectedSeats.join(", ")}
                        </span>
                      </div>
                    )}

                    <div className="mt-4 border-t border-gray-200 pt-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-500">
                          {ride.pricePerSeat} × {selectedSeatCount}
                        </span>

                        <span className="text-xl font-bold text-gray-900">
                          ₹{totalBookingAmount.toLocaleString("en-IN")}
                        </span>
                      </div>
                    </div>
                  </div>

                  {bookingError && (
                    <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-600">
                      {bookingError}
                    </div>
                  )}

                  {bookingMessage && (
                    <div className="mt-4 rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-700">
                      {bookingMessage}
                    </div>
                  )}

                  <Button
                    type="button"
                    disabled={
                      !canBook ||
                      seatLoading ||
                      bookingLoading ||
                      selectedSeatCount === 0
                    }
                    onClick={handleBookRide}
                    className="mt-5 h-12 w-full rounded-xl text-base font-semibold"
                  >
                    {bookingLoading
                      ? "Booking..."
                      : selectedSeatCount === 0
                        ? "Select a seat"
                        : "Book Now"}

                    {!bookingLoading && selectedSeatCount > 0 && (
                      <ArrowRight className="ml-2 h-4 w-4" />
                    )}
                  </Button>

                  <div className="mt-4 flex items-center justify-center gap-2 text-xs text-gray-500">
                    <ShieldCheck className="h-4 w-4 text-blue-600" />
                    Secure & easy booking
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

export default RideDetail;
