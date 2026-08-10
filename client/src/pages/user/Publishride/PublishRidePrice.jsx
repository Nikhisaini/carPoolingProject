import React, { useEffect, useMemo, useState } from "react";
import { ArrowLeft, ArrowRight, IndianRupee } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

function PublishRidePrice() {
  const navigate = useNavigate();
  const location = useLocation();

  const {
    departureLocation,
    destinationLocation,
    departureAt,
    vehicleId,
    totalSeats,
  } = location.state || {};

  const [pricePerSeat, setPricePerSeat] = useState(
    location.state?.pricePerSeat?.toString() || "",
  );

  // =====================================================
  // PROTECT PAGE
  // =====================================================

  useEffect(() => {
    if (
      !departureLocation ||
      !destinationLocation ||
      !departureAt ||
      !vehicleId ||
      !totalSeats
    ) {
      navigate("/publish-ride", { replace: true });
    }
  }, [
    departureLocation,
    destinationLocation,
    departureAt,
    vehicleId,
    totalSeats,
    navigate,
  ]);

  // =====================================================
  // VALIDATION
  // =====================================================

  const isValid = useMemo(() => {
    if (!pricePerSeat) {
      return false;
    }

    const price = Number(pricePerSeat);

    return Number.isInteger(price) && price > 0;
  }, [pricePerSeat]);

  // =====================================================
  // CONTINUE
  // =====================================================

  const handleContinue = () => {
    if (!isValid) {
      return;
    }

    navigate("/publish-ride/preferences", {
      state: {
        departureLocation,
        destinationLocation,
        departureAt,
        vehicleId,
        totalSeats,
        pricePerSeat: Number(pricePerSeat),
      },
    });
  };

  // =====================================================
  // BACK
  // =====================================================

  const handleBack = () => {
    navigate("/publish-ride/seats", {
      state: {
        departureLocation,
        destinationLocation,
        departureAt,
        vehicleId,
        totalSeats,
      },
    });
  };

  // =====================================================
  // PROTECTED RENDER
  // =====================================================

  if (
    !departureLocation ||
    !destinationLocation ||
    !departureAt ||
    !vehicleId ||
    !totalSeats
  ) {
    return null;
  }

  return (
    <div className="mx-auto w-full max-w-3xl">
      {/* HEADER */}

      <div className="mb-6">
        <p className="text-sm font-medium text-blue-600">Publish a ride</p>

        <h1 className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
          What is your price per seat?
        </h1>

        <p className="mt-2 text-gray-600">
          Set the amount passengers will pay for one seat.
        </p>
      </div>

      {/* ROUTE SUMMARY */}

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

      {/* CARD */}

      <Card className="border-gray-200 shadow-sm">
        <CardHeader className="border-b border-gray-100">
          <CardTitle className="flex items-center gap-2 text-xl">
            <IndianRupee className="h-5 w-5 text-blue-600" />
            Price per seat
          </CardTitle>

          <CardDescription>
            Choose a fair price for each passenger seat.
          </CardDescription>
        </CardHeader>

        <CardContent className="p-6">
          {/* PRICE */}

          <div>
            <label
              htmlFor="pricePerSeat"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              Price per seat
            </label>

            <div className="relative">
              <IndianRupee className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />

              <input
                id="pricePerSeat"
                type="number"
                min="1"
                step="1"
                value={pricePerSeat}
                onChange={(event) => setPricePerSeat(event.target.value)}
                placeholder="e.g. 500"
                className="h-12 w-full rounded-xl border border-gray-300 bg-white pl-10 pr-4 text-base outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            <p className="mt-2 text-sm text-gray-500">
              Passengers will pay this amount for one seat.
            </p>

            {pricePerSeat && !isValid && (
              <p className="mt-2 text-sm text-red-600">
                Please enter a valid price greater than ₹0.
              </p>
            )}
          </div>

          {/* SUMMARY */}

          {isValid && (
            <div className="mt-7 rounded-xl border border-blue-100 bg-blue-50 p-5">
              <p className="text-sm font-medium text-blue-700">Ride pricing</p>

              <div className="mt-3 grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-500">Available seats</p>

                  <p className="mt-1 text-lg font-semibold text-gray-900">
                    {totalSeats}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-gray-500">Price per seat</p>

                  <p className="mt-1 text-lg font-semibold text-gray-900">
                    ₹{pricePerSeat}
                  </p>
                </div>
              </div>

              <div className="mt-4 border-t border-blue-100 pt-4">
                <p className="text-xs text-gray-500">Maximum possible fare</p>

                <p className="mt-1 text-lg font-semibold text-gray-900">
                  ₹{Number(pricePerSeat) * Number(totalSeats)}
                </p>

                <p className="mt-1 text-xs text-gray-500">
                  If all available seats are booked.
                </p>
              </div>
            </div>
          )}

          {/* NAVIGATION */}

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

export default PublishRidePrice;
