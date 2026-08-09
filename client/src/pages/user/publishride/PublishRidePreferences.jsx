import React, { useEffect, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  MessageCircle,
  Music,
  PawPrint,
  Cigarette,
  Luggage,
} from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

function PublishRidePreferences() {
  const navigate = useNavigate();
  const location = useLocation();

  const {
    departureLocation,
    destinationLocation,
    departureAt,
    vehicleId,
    totalSeats,
    pricePerSeat,
  } = location.state || {};

  const [preferences, setPreferences] = useState({
    smokingAllowed: false,
    petsAllowed: false,
    luggageAllowed: true,
    musicAllowed: true,
    conversationAllowed: true,
  });

  /*
   * =====================================================
   * PROTECT PAGE
   * =====================================================
   */
  useEffect(() => {
    if (
      !departureLocation ||
      !destinationLocation ||
      !departureAt ||
      !vehicleId ||
      !totalSeats ||
      !pricePerSeat
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
    navigate,
  ]);

  /*
   * =====================================================
   * TOGGLE PREFERENCE
   * =====================================================
   */
  const handleToggle = (key) => {
    setPreferences((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  /*
   * =====================================================
   * CONTINUE
   * =====================================================
   */
  const handleContinue = () => {
    navigate("/publish-ride/review", {
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

  /*
   * =====================================================
   * BACK
   * =====================================================
   */
  const handleBack = () => {
    navigate("/publish-ride/price", {
      state: {
        departureLocation,
        destinationLocation,
        departureAt,
        vehicleId,
        totalSeats,
        pricePerSeat,
      },
    });
  };

  /*
   * =====================================================
   * PROTECTED RENDER
   * =====================================================
   */
  if (
    !departureLocation ||
    !destinationLocation ||
    !departureAt ||
    !vehicleId ||
    !totalSeats ||
    !pricePerSeat
  ) {
    return null;
  }

  /*
   * =====================================================
   * PREFERENCE OPTIONS
   * =====================================================
   */
  const preferenceOptions = [
    {
      key: "smokingAllowed",
      title: "Smoking",
      description: "Passengers can smoke during the ride.",
      icon: Cigarette,
    },
    {
      key: "petsAllowed",
      title: "Pets",
      description: "Passengers can bring pets.",
      icon: PawPrint,
    },
    {
      key: "luggageAllowed",
      title: "Luggage",
      description: "Passengers can bring luggage.",
      icon: Luggage,
    },
    {
      key: "musicAllowed",
      title: "Music",
      description: "Music can be played during the ride.",
      icon: Music,
    },
    {
      key: "conversationAllowed",
      title: "Conversation",
      description: "Passengers can talk during the ride.",
      icon: MessageCircle,
    },
  ];

  return (
    <div className="mx-auto w-full max-w-3xl">
      {/* =====================================================
          HEADER
      ===================================================== */}
      <div className="mb-6">
        <p className="text-sm font-medium text-blue-600">Publish a ride</p>

        <h1 className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
          Set your ride preferences
        </h1>

        <p className="mt-2 text-gray-600">
          Let passengers know what they can expect during the ride.
        </p>
      </div>

      {/* =====================================================
          ROUTE SUMMARY
      ===================================================== */}
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

      {/* =====================================================
          CARD
      ===================================================== */}
      <Card className="border-gray-200 shadow-sm">
        <CardHeader className="border-b border-gray-100">
          <CardTitle className="text-xl">Passenger preferences</CardTitle>

          <CardDescription>
            Choose what is allowed during your ride.
          </CardDescription>
        </CardHeader>

        <CardContent className="p-6">
          {/* =================================================
              PREFERENCES
          ================================================= */}
          <div className="space-y-3">
            {preferenceOptions.map((option) => {
              const Icon = option.icon;
              const enabled = preferences[option.key];

              return (
                <button
                  key={option.key}
                  type="button"
                  onClick={() => handleToggle(option.key)}
                  className={`flex w-full items-center justify-between rounded-xl border p-4 text-left transition ${
                    enabled
                      ? "border-blue-200 bg-blue-50"
                      : "border-gray-200 bg-white hover:bg-gray-50"
                  }`}
                >
                  <div className="flex min-w-0 items-center gap-4">
                    <div
                      className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${
                        enabled
                          ? "bg-blue-100 text-blue-600"
                          : "bg-gray-100 text-gray-500"
                      }`}
                    >
                      <Icon className="h-5 w-5" />
                    </div>

                    <div className="min-w-0">
                      <p className="font-medium text-gray-900">
                        {option.title}
                      </p>

                      <p className="mt-1 text-sm text-gray-500">
                        {option.description}
                      </p>
                    </div>
                  </div>

                  {/* Custom toggle */}
                  <div
                    className={`ml-4 flex h-6 w-11 shrink-0 items-center rounded-full p-1 transition ${
                      enabled ? "bg-blue-600" : "bg-gray-300"
                    }`}
                  >
                    <div
                      className={`h-4 w-4 rounded-full bg-white shadow-sm transition-transform ${
                        enabled ? "translate-x-5" : "translate-x-0"
                      }`}
                    />
                  </div>
                </button>
              );
            })}
          </div>

          {/* =================================================
              SUMMARY
          ================================================= */}
          <div className="mt-7 rounded-xl border border-gray-200 bg-gray-50 p-5">
            <p className="text-sm font-medium text-gray-700">
              Your preferences
            </p>

            <div className="mt-4 flex flex-wrap gap-2">
              {preferenceOptions.map((option) => (
                <span
                  key={option.key}
                  className={`rounded-full px-3 py-1.5 text-xs font-medium ${
                    preferences[option.key]
                      ? "bg-blue-100 text-blue-700"
                      : "bg-gray-200 text-gray-600"
                  }`}
                >
                  {option.title}:{" "}
                  {preferences[option.key] ? "Allowed" : "Not allowed"}
                </span>
              ))}
            </div>
          </div>

          {/* =================================================
              NAVIGATION
          ================================================= */}
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

export default PublishRidePreferences;
