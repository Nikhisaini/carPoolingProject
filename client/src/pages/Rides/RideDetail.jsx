import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import api from "@/services/Api";
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
import { useNavigate, useParams } from "react-router-dom";

function RideDetail() {
  const { rideId } = useParams();
  const navigate = useNavigate();

  const [ride, setRide] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    getRideDetail();
  }, [rideId]);

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

  const handleBookRide = () => {
    navigate(`/ride/${rideId}/book`);
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
                      Seats available
                    </span>
                  </div>
                  <span className="text-sm font-semibold text-gray-900">
                    {ride.availableSeats}
                  </span>
                </div>

                <div className="flex items-center justify-between border-b border-gray-100 py-5">
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                    <span className="text-sm text-gray-600">Booking</span>
                  </div>
                  <span className="text-sm font-medium text-gray-900">
                    {bookingMode}
                  </span>
                </div>

                <div className="pt-5">
                  <p className="text-sm text-gray-500">Price per passenger</p>
                  <div className="mt-1 flex items-center">
                    <IndianRupee className="h-6 w-6 text-gray-900" />
                    <span className="text-3xl font-bold tracking-tight text-gray-900">
                      {ride.pricePerSeat}
                    </span>
                  </div>

                  <Button
                    type="button"
                    disabled={!canBook}
                    onClick={handleBookRide}
                    className="mt-5 h-12 w-full rounded-xl text-base font-semibold"
                  >
                    {ride.status !== "PUBLISHED"
                      ? "Ride unavailable"
                      : ride.availableSeats <= 0
                        ? "Ride is full"
                        : departureDate <= new Date()
                          ? "Ride has started"
                          : "Book Now"}

                    {canBook && <ArrowRight className="ml-2 h-4 w-4" />}
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
