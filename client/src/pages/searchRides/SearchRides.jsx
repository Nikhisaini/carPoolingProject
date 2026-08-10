import LocationAutocomplete from "@/components/maps/LocationAutocomplete";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ArrowRight, Minus, Plus, Search, Users } from "lucide-react";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

function SearchRides() {
  const navigate = useNavigate();
  const [departureLocation, setDepartureLocation] = useState(null);
  const [destinationLocation, setDestinationlocation] = useState(null);
  const [travelDate, setTravelDate] = useState("");
  const [seats, setSeats] = useState(1);
  const [errorMessage, setErrorMessage] = useState("");

  const handleDepartureChange = (location) => {
    setDepartureLocation(location);
    setErrorMessage("");
  };

  const handleDestinationChange = (location) => {
    setDestinationlocation(location);
    setErrorMessage("");
  };

  const increaseSeats = () => {
    setSeats((current) => current + 1);
  };
  const decreaseSeats = () => {
    setSeats((current) => Math.max(current - 1, 1));
  };

  const validateSearch = () => {
    if (!departureLocation) {
      setErrorMessage("Please select your departure location");
      return false;
    }
    if (!destinationLocation) {
      setErrorMessage("Please select your destination location");
      return false;
    }

    if (
      departureLocation.city?.toLowerCase() ===
      destinationLocation.city?.toLowerCase()
    ) {
      setErrorMessage("Departure and destination cities cannot be the same");
      return false;
    }
    if (!travelDate) {
      setErrorMessage("Please select your travel date");
      return false;
    }
    if (!Number.isInteger(seats) || seats < 1) {
      setErrorMessage("Please select at least one seat");
      return false;
    }
    return true;
  };

  const handleSearch = () => {
    setErrorMessage("");
    if (!validateSearch()) {
      return;
    }
    navigate("ride/results", {
      state: {
        departureLocation,
        destinationLocation,
        travelDate,
        seats,
      },
    });
  };
  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6">
        <p className="text-sm font-medium text-blue-600">Find a ride</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
          Where do you want to go?
        </h1>
        <p className="mt-2 text-gray-600">
          Search for available rides and find the one that suits you.
        </p>
      </div>

      {errorMessage && (
        <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4">
          <p className="text-sm font-medium text-red-700">{errorMessage}</p>
        </div>
      )}

      <Card className="border-gray-200 shadow-sm">
        <CardHeader className="border-b border-gray-100">
          <CardTitle className="flex items-center gap-2 text-xl">
            <Search className="h-5 w-5 text-blue-600" />
            Search rides
          </CardTitle>

          <CardDescription>
            Enter your journey details to find available rides.
          </CardDescription>
        </CardHeader>

        <CardContent className="p-6">
          <div className="grid gap-5 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                From
              </label>

              <LocationAutocomplete
                onPlaceSelect={handleDepartureChange}
                placeholder="Leaving from"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                To
              </label>

              <LocationAutocomplete
                onPlaceSelect={handleDestinationChange}
                placeholder="Going to"
              />
            </div>
          </div>

          {departureLocation && destinationLocation && (
            <div className="mt-5 rounded-xl border border-blue-100 bg-blue-50 p-4">
              <div className="flex flex-wrap items-center gap-x-3 gap-y-2 text-sm">
                <span className="font-semibold text-gray-900">
                  {departureLocation.city}
                </span>

                <ArrowRight className="h-4 w-4 text-blue-500" />

                <span className="font-semibold text-gray-900">
                  {destinationLocation.city}
                </span>
              </div>
            </div>
          )}

          <div className="mt-6 grid gap-5 md:grid-cols-2">
            <div>
              <label
                htmlFor="travelDate"
                className="mb-2 block text-sm font-medium text-gray-700"
              >
                Travel date
              </label>

              <input
                id="travelDate"
                type="date"
                value={travelDate}
                min={new Date().toISOString().split("T")[0]}
                onChange={(event) => {
                  setTravelDate(event.target.value);
                  setErrorMessage("");
                }}
                className="h-12 w-full rounded-xl border border-gray-300 bg-white px-4 text-base outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Passengers
              </label>

              <div className="flex h-12 items-center justify-between rounded-xl border border-gray-300 bg-white px-3">
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  disabled={seats <= 1}
                  onClick={decreaseSeats}
                  className="h-8 w-8 rounded-lg"
                >
                  <Minus className="h-4 w-4" />
                </Button>

                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-gray-500" />

                  <span className="font-semibold text-gray-900">{seats}</span>

                  <span className="text-sm text-gray-500">
                    {seats === 1 ? "passenger" : "passengers"}
                  </span>
                </div>

                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={increaseSeats}
                  className="h-8 w-8 rounded-lg"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          <div className="mt-8 border-t border-gray-100 pt-6">
            <Button
              type="button"
              onClick={handleSearch}
              className="h-12 w-full gap-2 rounded-xl bg-blue-600 text-white hover:bg-blue-700"
            >
              <Search className="h-5 w-5" />
              Search rides
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default SearchRides;
