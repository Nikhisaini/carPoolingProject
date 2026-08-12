import React, { useEffect, useState } from "react";
import {
  ArrowLeft,
  CalendarDays,
  Car,
  CheckCircle2,
  Clock,
  IndianRupee,
  Loader2,
  MapPin,
  PawPrint,
  Cigarette,
  Luggage,
  Music,
  MessageCircle,
  Users,
} from "lucide-react";
import { format } from "date-fns";
import { useLocation, useNavigate } from "react-router-dom";

import api from "@/services/Api";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

function PublishRideReview() {
  const navigate = useNavigate();
  const location = useLocation();

  const {
    departureLocation,
    destinationLocation,
    departureAt,
    vehicleId,
    totalSeats,
    pricePerSeat,
    preferences,
  } = location.state || {};

  const [vehicle, setVehicle] = useState(null);
  const [loadingVehicle, setLoadingVehicle] = useState(true);
  const [publishing, setPublishing] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (
      !departureLocation ||
      !destinationLocation ||
      !departureAt ||
      !vehicleId ||
      !totalSeats ||
      !pricePerSeat ||
      !preferences
    ) {
      navigate("/publish-ride", { replace: true });
    }
  }, [
    departureLocation,
    destinationLocation,
    departureAt,
    vehicleId,
    totalSeats,
    pricePerSeat,
    preferences,
    navigate,
  ]);

  useEffect(() => {
    const getVehicle = async () => {
      try {
        setLoadingVehicle(true);
        setErrorMessage("");

        const res = await api.get(`/vehicle/${vehicleId}`);

        const vehicleData = res.data?.vehicle || res.data?.data?.vehicle;

        if (!vehicleData) {
          throw new Error("Vehicle information not found.");
        }

        setVehicle(vehicleData);
      } catch (error) {
        console.error("Get Vehicle Error:", error);

        setErrorMessage(
          error.response?.data?.message ||
            error.message ||
            "Unable to load vehicle information.",
        );
      } finally {
        setLoadingVehicle(false);
      }
    };

    if (vehicleId) {
      getVehicle();
    }
  }, [vehicleId]);

  const departureDate = departureAt ? new Date(departureAt) : null;

  const handlePublish = async () => {
    try {
      setPublishing(true);
      setErrorMessage("");

      const payload = {
        vehicleId,

        departureLocation: {
          city: departureLocation.city?.trim() || "",
          cityNormalized:
            departureLocation.cityNormalized?.trim().toLowerCase() || "",
          state: departureLocation.state?.trim() || "",
          country: departureLocation.country?.trim() || "India",
          address: departureLocation.address?.trim() || "",
          placeName: departureLocation.placeName?.trim() || "",
          latitude: Number(departureLocation.latitude),
          longitude: Number(departureLocation.longitude),
          placeId: departureLocation.placeId?.trim() || "",
        },

        destinationLocation: {
          city: destinationLocation.city?.trim() || "",
          cityNormalized:
            destinationLocation.cityNormalized?.trim().toLowerCase() || "",
          state: destinationLocation.state?.trim() || "",
          country: destinationLocation.country?.trim() || "India",
          address: destinationLocation.address?.trim() || "",
          placeName: destinationLocation.placeName?.trim() || "",
          latitude: Number(destinationLocation.latitude),
          longitude: Number(destinationLocation.longitude),
          placeId: destinationLocation.placeId?.trim() || "",
        },

        departureAt,
        totalSeats: Number(totalSeats),
        pricePerSeat: Number(pricePerSeat),
        bookingMode: "AUTO",

        preferences: {
          smokingAllowed: Boolean(preferences.smokingAllowed),
          petsAllowed: Boolean(preferences.petsAllowed),
          luggageAllowed: Boolean(preferences.luggageAllowed),
          musicAllowed: Boolean(preferences.musicAllowed),
          conversationAllowed: Boolean(preferences.conversationAllowed),
        },
      };

      if (
        !payload.departureLocation.cityNormalized ||
        !payload.destinationLocation.cityNormalized
      ) {
        throw new Error("Invalid departure or destination city.");
      }

      const res = await api.post("/ride/publish", payload);

      if (!res.data?.success) {
        throw new Error(res.data?.message || "Unable to publish ride.");
      }

      navigate("/my-rides", {
        replace: true,
      });
    } catch (error) {
      console.error("Publish Ride Error:", error);

      setErrorMessage(
        error.response?.data?.message ||
          error.message ||
          "Unable to publish ride.",
      );
    } finally {
      setPublishing(false);
    }
  };

  const handleBack = () => {
    navigate("/publish-ride/preferences", {
      state: {
        departureLocation,
        destinationLocation,
        departureAt,
        vehicleId,
        totalSeats,
        pricePerSeat,
        preferences,
      },
    });
  };

  if (
    !departureLocation ||
    !destinationLocation ||
    !departureAt ||
    !vehicleId ||
    !totalSeats ||
    !pricePerSeat ||
    !preferences
  ) {
    return null;
  }

  const preferenceOptions = [
    {
      key: "smokingAllowed",
      label: "Smoking",
      icon: Cigarette,
    },
    {
      key: "petsAllowed",
      label: "Pets",
      icon: PawPrint,
    },
    {
      key: "luggageAllowed",
      label: "Luggage",
      icon: Luggage,
    },
    {
      key: "musicAllowed",
      label: "Music",
      icon: Music,
    },
    {
      key: "conversationAllowed",
      label: "Conversation",
      icon: MessageCircle,
    },
  ];

  return (
    <div className="mx-auto w-full max-w-4xl">
      <div className="mb-6">
        <p className="text-sm font-medium text-blue-600">Publish a ride</p>

        <h1 className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
          Review your ride
        </h1>

        <p className="mt-2 text-gray-600">
          Check all the details before publishing your ride.
        </p>
      </div>

      {errorMessage && (
        <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4">
          <p className="text-sm font-medium text-red-700">{errorMessage}</p>
        </div>
      )}

      <Card className="mb-6 border-gray-200 shadow-sm">
        <CardHeader className="border-b border-gray-100">
          <CardTitle className="flex items-center gap-2 text-xl">
            <MapPin className="h-5 w-5 text-blue-600" />
            Route
          </CardTitle>

          <CardDescription>Your departure and destination</CardDescription>
        </CardHeader>

        <CardContent className="p-6">
          <div className="grid gap-6 sm:grid-cols-2">
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                Leaving from
              </p>

              <p className="mt-1 font-semibold text-gray-900">
                {departureLocation.placeName || departureLocation.city}
              </p>

              <p className="mt-1 text-sm text-gray-500">
                {departureLocation.address}
              </p>
            </div>

            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                Going to
              </p>

              <p className="mt-1 font-semibold text-gray-900">
                {destinationLocation.placeName || destinationLocation.city}
              </p>

              <p className="mt-1 text-sm text-gray-500">
                {destinationLocation.address}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="mb-6 border-gray-200 shadow-sm">
        <CardHeader className="border-b border-gray-100">
          <CardTitle className="flex items-center gap-2 text-xl">
            <CalendarDays className="h-5 w-5 text-blue-600" />
            Date & time
          </CardTitle>
        </CardHeader>

        <CardContent className="grid gap-6 p-6 sm:grid-cols-2">
          <div className="flex items-start gap-3">
            <CalendarDays className="mt-0.5 h-5 w-5 text-gray-500" />

            <div>
              <p className="text-xs text-gray-500">Departure date</p>

              <p className="mt-1 font-semibold text-gray-900">
                {departureDate && format(departureDate, "EEEE, MMMM d, yyyy")}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Clock className="mt-0.5 h-5 w-5 text-gray-500" />

            <div>
              <p className="text-xs text-gray-500">Departure time</p>

              <p className="mt-1 font-semibold text-gray-900">
                {departureDate && format(departureDate, "hh:mm a")}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="mb-6 border-gray-200 shadow-sm">
        <CardHeader className="border-b border-gray-100">
          <CardTitle className="flex items-center gap-2 text-xl">
            <Car className="h-5 w-5 text-blue-600" />
            Vehicle
          </CardTitle>
        </CardHeader>

        <CardContent className="p-6">
          {loadingVehicle ? (
            <div className="flex items-center gap-2 text-gray-500">
              <Loader2 className="h-5 w-5 animate-spin" />
              Loading vehicle...
            </div>
          ) : vehicle ? (
            <div className="flex flex-col gap-5 sm:flex-row">
              {vehicle.vehicleImages?.[0] && (
                <img
                  src={`http://localhost:8081/${vehicle.vehicleImages[0]}`}
                  alt={`${vehicle.brand} ${vehicle.model}`}
                  className="h-40 w-full rounded-xl object-cover sm:w-56"
                />
              )}

              <div>
                <h3 className="text-xl font-semibold text-gray-900">
                  {vehicle.brand} {vehicle.model}
                </h3>

                <div className="mt-3 grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-500">Registration</p>
                    <p className="mt-1 font-medium text-gray-900">
                      {vehicle.registrationNumber}
                    </p>
                  </div>

                  <div>
                    <p className="text-gray-500">Color</p>
                    <p className="mt-1 font-medium text-gray-900">
                      {vehicle.color || "—"}
                    </p>
                  </div>

                  <div>
                    <p className="text-gray-500">Fuel</p>
                    <p className="mt-1 font-medium text-gray-900">
                      {vehicle.fuelTypeId?.name || "—"}
                    </p>
                  </div>

                  <div>
                    <p className="text-gray-500">Seats</p>
                    <p className="mt-1 font-medium text-gray-900">
                      {vehicle.seatingCapacity || "—"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ) : null}
        </CardContent>
      </Card>

      <Card className="mb-6 border-gray-200 shadow-sm">
        <CardHeader className="border-b border-gray-100">
          <CardTitle className="text-xl">Seats & price</CardTitle>
        </CardHeader>

        <CardContent className="grid gap-6 p-6 sm:grid-cols-3">
          <div className="flex items-start gap-3">
            <Users className="h-5 w-5 text-gray-500" />

            <div>
              <p className="text-xs text-gray-500">Passenger seats</p>

              <p className="mt-1 text-lg font-semibold text-gray-900">
                {totalSeats}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <IndianRupee className="h-5 w-5 text-gray-500" />

            <div>
              <p className="text-xs text-gray-500">Price per seat</p>

              <p className="mt-1 text-lg font-semibold text-gray-900">
                ₹{pricePerSeat}
              </p>
            </div>
          </div>

          <div>
            <p className="text-xs text-gray-500">Maximum passenger fare</p>

            <p className="mt-1 text-lg font-semibold text-gray-900">
              ₹{Number(totalSeats) * Number(pricePerSeat)}
            </p>
          </div>
        </CardContent>
      </Card>

      <Card className="mb-6 border-gray-200 shadow-sm">
        <CardHeader className="border-b border-gray-100">
          <CardTitle className="text-xl">Ride preferences</CardTitle>

          <CardDescription>
            What passengers can expect during the ride.
          </CardDescription>
        </CardHeader>

        <CardContent className="p-6">
          <div className="grid gap-3 sm:grid-cols-2">
            {preferenceOptions.map((option) => {
              const Icon = option.icon;
              const allowed = preferences[option.key];

              return (
                <div
                  key={option.key}
                  className={`flex items-center justify-between rounded-xl border p-4 ${
                    allowed
                      ? "border-blue-100 bg-blue-50"
                      : "border-gray-200 bg-gray-50"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon
                      className={`h-5 w-5 ${
                        allowed ? "text-blue-600" : "text-gray-400"
                      }`}
                    />

                    <span className="font-medium text-gray-900">
                      {option.label}
                    </span>
                  </div>

                  <span
                    className={`text-sm font-medium ${
                      allowed ? "text-blue-700" : "text-gray-500"
                    }`}
                  >
                    {allowed ? "Allowed" : "Not allowed"}
                  </span>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <Card className="border-blue-100 bg-blue-50 shadow-sm">
        <CardContent className="p-6">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-blue-600" />

            <div>
              <h3 className="font-semibold text-gray-900">Ready to publish?</h3>

              <p className="mt-1 text-sm text-gray-600">
                Your ride will become available for passengers after publishing.
              </p>
            </div>
          </div>

          <div className="mt-6 flex items-center justify-between border-t border-blue-100 pt-6">
            <Button
              type="button"
              variant="outline"
              onClick={handleBack}
              disabled={publishing}
              className="h-11 gap-2 rounded-xl px-5"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>

            <Button
              type="button"
              onClick={handlePublish}
              disabled={publishing || loadingVehicle || !vehicle}
              className="h-11 gap-2 rounded-xl bg-blue-600 px-6 text-white hover:bg-blue-700"
            >
              {publishing ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Publishing...
                </>
              ) : (
                <>
                  Publish ride
                  <CheckCircle2 className="h-4 w-4" />
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default PublishRideReview;
