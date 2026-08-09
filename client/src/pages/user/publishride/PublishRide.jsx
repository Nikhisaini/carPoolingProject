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

function PublishRide() {
  const navigate = useNavigate();
  const location = useLocation();

  // =====================================================
  // STATE
  // =====================================================

  const [departureLocation, setDepartureLocation] = useState(null);
  const [destinationLocation, setDestinationLocation] = useState(null);

  // =====================================================
  // RESTORE PREVIOUS STATE
  // =====================================================
  // When user comes back from Page 2, React component can
  // be mounted again. Restore the locations passed through
  // React Router state.
  // =====================================================

  useEffect(() => {
    const previousState = location.state;

    if (previousState?.departureLocation) {
      setDepartureLocation(previousState.departureLocation);
    }

    if (previousState?.destinationLocation) {
      setDestinationLocation(previousState.destinationLocation);
    }
  }, [location.state]);

  // =====================================================
  // LOCATION SELECT
  // =====================================================

  const handleDepartureSelect = (locationData) => {
    setDepartureLocation(locationData);
  };

  const handleDestinationSelect = (locationData) => {
    setDestinationLocation(locationData);
  };

  // =====================================================
  // CONTINUE
  // =====================================================

  const handleContinue = () => {
    if (!departureLocation || !destinationLocation) {
      return;
    }

    navigate("/publish-ride/date-time", {
      state: {
        ...location.state,
        departureLocation,
        destinationLocation,
      },
    });
  };

  // =====================================================
  // VALIDATION
  // =====================================================

  const isValid = departureLocation !== null && destinationLocation !== null;

  // =====================================================
  // UI
  // =====================================================

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
      {/* =====================================================
          HEADER
      ===================================================== */}

      <div className="mb-8">
        <p className="text-sm font-medium text-blue-600">Publish a ride</p>

        <h1 className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
          Where are you going?
        </h1>

        <p className="mt-2 text-gray-600">
          Tell us where your journey starts and where you're going.
        </p>
      </div>

      {/* =====================================================
          ROUTE CARD
      ===================================================== */}

      <Card className="overflow-visible border-gray-200 shadow-sm">
        <CardHeader className="border-b border-gray-100">
          <CardTitle className="text-xl">Your route</CardTitle>

          <CardDescription>
            Choose your departure and destination locations.
          </CardDescription>
        </CardHeader>

        <CardContent className="overflow-visible p-6">
          {/* =================================================
              LOCATION INPUTS
          ================================================= */}

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

          {/* =================================================
              ROUTE PREVIEW
          ================================================= */}

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

          {/* =================================================
              NAVIGATION
          ================================================= */}

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
