import React, { useEffect, useState } from "react";
import { ArrowRight, MapPin } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";

import LocationAutocomplete from "@/components/maps/LocationAutocomplete";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import api from "@/services/Api";

const normalizeCity = (value) => {
  return (
    value?.trim().toLowerCase().replace(/\s+/g, " ").replace(/[.,]/g, "") || ""
  );
};

function PublishRide() {
  const navigate = useNavigate();
  const location = useLocation();

  const [loading, setLoading] = useState(true);
  const [eligibility, setEligibility] = useState(null);
  const [departureLocation, setDepartureLocation] = useState(null);
  const [destinationLocation, setDestinationLocation] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const checkEligibility = async () => {
      try {
        setLoading(true);

        const res = await api.get("/ride/publish-eligibility");

        setEligibility(res.data);
      } catch (error) {
        console.error("Eligibility check error:", error);

        setEligibility({
          eligible: false,
          status: "ERROR",
          message: "Failed to check publish ride eligibility",
        });
      } finally {
        setLoading(false);
      }
    };

    checkEligibility();
  }, []);

  useEffect(() => {
    const previousState = location.state;

    if (previousState?.departureLocation) {
      setDepartureLocation(previousState.departureLocation);
    }

    if (previousState?.destinationLocation) {
      setDestinationLocation(previousState.destinationLocation);
    }
  }, [location.state]);

  const handleDepartureSelect = (locationData) => {
    setErrorMessage("");
    setDepartureLocation(locationData);
  };

  const handleDestinationSelect = (locationData) => {
    setErrorMessage("");
    setDestinationLocation(locationData);
  };

  const handleContinue = () => {
    setErrorMessage("");

    if (!eligibility?.eligible) {
      return;
    }

    if (!departureLocation) {
      setErrorMessage("Please select your departure location");
      return;
    }

    if (!destinationLocation) {
      setErrorMessage("Please select your destination location");
      return;
    }

    const departureCity =
      departureLocation.cityNormalized || normalizeCity(departureLocation.city);

    const destinationCity =
      destinationLocation.cityNormalized ||
      normalizeCity(destinationLocation.city);

    if (!departureCity || !destinationCity) {
      setErrorMessage(
        "Please select valid departure and destination locations",
      );
      return;
    }

    if (departureCity === destinationCity) {
      setErrorMessage("Departure and destination cities cannot be the same");
      return;
    }

    if (
      departureLocation.latitude === undefined ||
      departureLocation.longitude === undefined ||
      destinationLocation.latitude === undefined ||
      destinationLocation.longitude === undefined
    ) {
      setErrorMessage("Please select both locations from the suggestions");
      return;
    }

    navigate("/publish-ride/date-time", {
      state: {
        ...location.state,
        departureLocation: {
          ...departureLocation,
          cityNormalized: departureCity,
        },
        destinationLocation: {
          ...destinationLocation,
          cityNormalized: destinationCity,
        },
      },
    });
  };

  const isValid =
    eligibility?.eligible &&
    departureLocation !== null &&
    destinationLocation !== null &&
    normalizeCity(departureLocation?.city) !==
      normalizeCity(destinationLocation?.city);

  if (loading) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center">
        {" "}
        <p className="text-sm text-gray-500">Checking eligibility... </p>{" "}
      </div>
    );
  }

  if (!eligibility?.eligible) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center px-4">
        {" "}
        <Card className="w-full max-w-xl rounded-2xl border-gray-200 shadow-lg">
          {" "}
          <CardHeader className="px-8 pt-8 text-center">
            {" "}
            <CardTitle className="text-2xl font-bold">
              Cannot Publish Ride{" "}
            </CardTitle>
            <CardDescription className="mt-2 text-base">
              {eligibility?.message ||
                "You are not eligible to publish a ride."}
            </CardDescription>
            <CardContent className="py-5">
              <Button
                onClick={() => navigate("/add-vehicle")}
                className="h-12 w-full rounded-xl bg-slate-900 text-base font-semibold hover:bg-slate-800"
              >
                Add your vehicle
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardContent>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
      {" "}
      <div className="mb-8">
        {" "}
        <p className="text-sm font-medium text-blue-600">Publish a ride </p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
          Where are you going?
        </h1>
        <p className="mt-2 text-gray-600">
          Tell us where your journey starts and where you're going.
        </p>
      </div>
      {errorMessage && (
        <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4">
          <p className="text-sm font-medium text-red-700">{errorMessage}</p>
        </div>
      )}
      <Card className="overflow-visible border-gray-200 shadow-sm">
        <CardHeader className="border-b border-gray-100">
          <CardTitle className="text-xl">Your route</CardTitle>

          <CardDescription>
            Choose your departure and destination locations.
          </CardDescription>
        </CardHeader>

        <CardContent className="overflow-visible p-6">
          <div className="space-y-5">
            <div className="relative">
              <LocationAutocomplete
                label="Leaving from"
                placeholder="Search your departure location"
                onPlaceSelect={handleDepartureSelect}
                value={departureLocation}
              />
            </div>

            <div className="relative">
              <LocationAutocomplete
                label="Going to"
                placeholder="Search your destination location"
                onPlaceSelect={handleDestinationSelect}
                value={destinationLocation}
              />
            </div>
          </div>

          {departureLocation && destinationLocation && (
            <div className="mt-6 rounded-xl border border-blue-100 bg-blue-50 p-4">
              <div className="flex items-center gap-3">
                <div className="flex flex-col items-center">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600">
                    <MapPin className="h-4 w-4 text-white" />
                  </div>

                  <div className="my-1 h-6 w-px bg-blue-300" />

                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-800">
                    <MapPin className="h-4 w-4 text-white" />
                  </div>
                </div>

                <div className="min-w-0 flex-1 space-y-5">
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                      Leaving from
                    </p>

                    <p className="mt-1 truncate font-semibold text-gray-900">
                      {departureLocation.placeName || departureLocation.city}
                    </p>

                    <p className="truncate text-sm text-gray-500">
                      {departureLocation.address}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                      Going to
                    </p>

                    <p className="mt-1 truncate font-semibold text-gray-900">
                      {destinationLocation.placeName ||
                        destinationLocation.city}
                    </p>

                    <p className="truncate text-sm text-gray-500">
                      {destinationLocation.address}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="mt-8 flex justify-end border-t border-gray-100 pt-6">
            <Button
              type="button"
              disabled={!isValid}
              onClick={handleContinue}
              className="h-12 min-w-32 gap-2 rounded-xl px-6"
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

export default PublishRide;
