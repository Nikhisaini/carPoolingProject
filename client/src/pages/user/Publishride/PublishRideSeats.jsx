import React, { useEffect, useMemo, useState } from "react";
import { ArrowLeft, ArrowRight, Minus, Plus, Users } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import api from "@/services/Api";

function PublishRideSeats() {
  const navigate = useNavigate();
  const location = useLocation();

  const {
    departureLocation,
    destinationLocation,
    departureAt,
    vehicleId,
    totalSeats: previousTotalSeats,
  } = location.state || {};

  const [totalSeats, setTotalSeats] = useState(previousTotalSeats || 1);

  const [vehicle, setVehicle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (
      !departureLocation ||
      !destinationLocation ||
      !departureAt ||
      !vehicleId
    ) {
      navigate("/publish-ride", { replace: true });
    }
  }, [
    departureLocation,
    destinationLocation,
    departureAt,
    vehicleId,
    navigate,
  ]);

  useEffect(() => {
    if (!vehicleId) {
      return;
    }

    const getVehicle = async () => {
      try {
        setLoading(true);
        setErrorMessage("");

        const res = await api.get("/vehicle/my-vehicles");

        const myVehicles = res.data?.vehicles || [];

        const selected = myVehicles.find(
          (item) =>
            item._id === vehicleId && item.verificationStatus === "Approved",
        );

        if (!selected) {
          setErrorMessage("Selected vehicle is no longer available.");
          return;
        }

        setVehicle(selected);
      } catch (error) {
        console.error("Get Vehicle Error:", error);

        setErrorMessage(
          error.response?.data?.message ||
            error.message ||
            "Unable to load vehicle.",
        );
      } finally {
        setLoading(false);
      }
    };

    getVehicle();
  }, [vehicleId]);

  const maxSeats = useMemo(() => {
    if (!vehicle?.seatingCapacity) {
      return 0;
    }

    return Math.max(vehicle.seatingCapacity - 1, 0);
  }, [vehicle]);

  useEffect(() => {
    if (maxSeats > 0 && totalSeats > maxSeats) {
      setTotalSeats(maxSeats);
    }
  }, [maxSeats, totalSeats]);

  const isValid =
    !loading &&
    !errorMessage &&
    vehicle &&
    maxSeats > 0 &&
    totalSeats >= 1 &&
    totalSeats <= maxSeats;

  const handleContinue = () => {
    if (!isValid) {
      return;
    }

    navigate("/publish-ride/price", {
      state: {
        departureLocation,
        destinationLocation,
        departureAt,
        vehicleId,
        totalSeats,
      },
    });
  };

  const handleBack = () => {
    navigate("/publish-ride/vehicle", {
      state: {
        departureLocation,
        destinationLocation,
        departureAt,
        selectedVehicleId: vehicleId,
      },
    });
  };

  const increaseSeats = () => {
    setTotalSeats((current) => Math.min(current + 1, maxSeats));
  };

  const decreaseSeats = () => {
    setTotalSeats((current) => Math.max(current - 1, 1));
  };

  if (
    !departureLocation ||
    !destinationLocation ||
    !departureAt ||
    !vehicleId
  ) {
    return null;
  }

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-6">
        <p className="text-sm font-medium text-blue-600">Publish a ride</p>

        <h1 className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
          How many seats are available?
        </h1>

        <p className="mt-2 text-gray-600">
          Choose how many passengers can join your ride.
        </p>
      </div>

      <div className="mb-6 rounded-xl border border-gray-200 bg-white px-5 py-4 shadow-sm">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
          <span className="font-semibold text-gray-900">
            {departureLocation.city}
          </span>

          <ArrowRight className="h-4 w-4 text-gray-400" />

          <span className="font-semibold text-gray-900">
            {destinationLocation.city}
          </span>
        </div>
      </div>

      <Card className="border-gray-200 shadow-sm">
        <CardHeader className="border-b border-gray-100">
          <CardTitle className="flex items-center gap-2 text-xl">
            <Users className="h-5 w-5 text-blue-600" />
            Available seats
          </CardTitle>

          <CardDescription>
            The driver occupies one seat. Choose the number of passenger seats
            you want to offer.
          </CardDescription>
        </CardHeader>

        <CardContent className="p-6">
          {loading && (
            <div className="flex min-h-40 items-center justify-center">
              <p className="text-sm text-gray-500">
                Loading vehicle information...
              </p>
            </div>
          )}

          {!loading && errorMessage && (
            <div className="rounded-xl border border-red-200 bg-red-50 p-4">
              <p className="text-sm font-medium text-red-700">{errorMessage}</p>
            </div>
          )}

          {!loading && !errorMessage && vehicle && (
            <div className="space-y-8">
              <div className="rounded-xl border border-gray-200 bg-gray-50 p-5">
                <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                  Selected vehicle
                </p>

                <h2 className="mt-1 text-lg font-semibold text-gray-900">
                  {vehicle.brand} {vehicle.model}
                </h2>

                <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-sm text-gray-500">
                  <span>
                    Registration:{" "}
                    <span className="font-medium text-gray-900">
                      {vehicle.registrationNumber}
                    </span>
                  </span>

                  <span>
                    Vehicle capacity:{" "}
                    <span className="font-medium text-gray-900">
                      {vehicle.seatingCapacity}
                    </span>
                  </span>
                </div>
              </div>

              <div className="rounded-xl border border-blue-100 bg-blue-50 p-6">
                <div className="text-center">
                  <p className="text-sm font-medium text-blue-700">
                    Passenger seats
                  </p>

                  <p className="mt-2 text-5xl font-bold text-gray-900">
                    {totalSeats}
                  </p>

                  <p className="mt-2 text-sm text-gray-500">
                    {totalSeats === 1
                      ? "passenger can book"
                      : "passengers can book"}
                  </p>
                </div>

                <div className="mt-6 flex items-center justify-center gap-5">
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    disabled={totalSeats <= 1}
                    onClick={decreaseSeats}
                    className="h-12 w-12 rounded-full"
                  >
                    <Minus className="h-5 w-5" />
                  </Button>

                  <div className="flex h-14 min-w-20 items-center justify-center rounded-xl border border-gray-200 bg-white px-5">
                    <span className="text-2xl font-semibold text-gray-900">
                      {totalSeats}
                    </span>
                  </div>

                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    disabled={totalSeats >= maxSeats}
                    onClick={increaseSeats}
                    className="h-12 w-12 rounded-full"
                  >
                    <Plus className="h-5 w-5" />
                  </Button>
                </div>

                <p className="mt-5 text-center text-sm text-gray-500">
                  You can offer up to{" "}
                  <span className="font-semibold text-gray-900">
                    {maxSeats}
                  </span>{" "}
                  passenger {maxSeats === 1 ? "seat" : "seats"}.
                </p>
              </div>
            </div>
          )}

          <div className="mt-8 flex items-center justify-between border-t border-gray-100 pt-6">
            <Button
              type="button"
              variant="outline"
              onClick={handleBack}
              className="h-11 gap-2 rounded-xl px-5"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>

            <Button
              type="button"
              disabled={!isValid}
              onClick={handleContinue}
              className="h-11 gap-2 rounded-xl px-6"
            >
              Continue
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default PublishRideSeats;
