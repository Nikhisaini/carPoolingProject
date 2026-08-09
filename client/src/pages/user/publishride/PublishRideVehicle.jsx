import React, { useEffect, useState } from "react";
import { ArrowLeft, ArrowRight, Car, Loader2 } from "lucide-react";
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

function PublishRideVehicle() {
  const navigate = useNavigate();
  const location = useLocation();

  const {
    departureLocation,
    destinationLocation,
    departureAt,
    selectedVehicleId: previousVehicleId,
  } = location.state || {};

  const [vehicles, setVehicles] = useState([]);
  const [selectedVehicleId, setSelectedVehicleId] = useState(
    previousVehicleId || "",
  );

  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (!departureLocation || !destinationLocation || !departureAt) {
      navigate("/publish-ride", { replace: true });
    }
  }, [departureLocation, destinationLocation, departureAt, navigate]);

  useEffect(() => {
    const getApprovedVehicles = async () => {
      try {
        setLoading(true);
        setErrorMessage("");

        const res = await api.get("/vehicle/my-vehicles");

        const myVehicles = res.data?.vehicles || [];

        const approvedVehicles = myVehicles.filter(
          (vehicle) => vehicle.verificationStatus === "Approved",
        );

        setVehicles(approvedVehicles);
      } catch (error) {
        console.error("Get Approved Vehicles Error:", error);

        setErrorMessage(
          error.response?.data?.message || "Unable to load your vehicles.",
        );
      } finally {
        setLoading(false);
      }
    };

    if (departureLocation && destinationLocation && departureAt) {
      getApprovedVehicles();
    }
  }, [departureLocation, destinationLocation, departureAt]);

  const selectedVehicle = vehicles.find(
    (vehicle) => vehicle._id === selectedVehicleId,
  );

  const handleContinue = () => {
    if (!selectedVehicleId) {
      return;
    }

    navigate("/publish-ride/seats", {
      state: {
        departureLocation,
        destinationLocation,
        departureAt,
        vehicleId: selectedVehicleId,
      },
    });
  };

  const handleBack = () => {
    navigate("/publish-ride/date-time", {
      state: {
        departureLocation,
        destinationLocation,
        departureAt,
        selectedVehicleId,
      },
    });
  };

  if (!departureLocation || !destinationLocation || !departureAt) {
    return null;
  }

  const isValid = selectedVehicleId !== "";

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-6">
        <p className="text-sm font-medium text-blue-600">Publish a ride</p>

        <h1 className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
          Which vehicle are you using?
        </h1>

        <p className="mt-2 text-gray-600">
          Select the approved vehicle you will use for this ride.
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
            <Car className="h-5 w-5 text-blue-600" />
            Select your vehicle
          </CardTitle>

          <CardDescription>
            Only admin-approved vehicles can be used to publish a ride.
          </CardDescription>
        </CardHeader>

        <CardContent className="p-6">
          {loading && (
            <div className="flex min-h-32 items-center justify-center">
              <div className="flex items-center gap-2 text-gray-600">
                <Loader2 className="h-5 w-5 animate-spin" />
                Loading your vehicles...
              </div>
            </div>
          )}

          {!loading && errorMessage && (
            <div className="rounded-xl border border-red-200 bg-red-50 p-4">
              <p className="text-sm font-medium text-red-700">{errorMessage}</p>
            </div>
          )}

          {!loading && !errorMessage && vehicles.length === 0 && (
            <div className="rounded-xl border border-gray-200 bg-gray-50 p-8 text-center">
              <Car className="mx-auto h-10 w-10 text-gray-400" />

              <h3 className="mt-4 text-lg font-semibold text-gray-900">
                No approved vehicles
              </h3>

              <p className="mx-auto mt-2 max-w-md text-sm text-gray-500">
                You need at least one approved vehicle before you can publish a
                ride.
              </p>

              <Button
                type="button"
                onClick={() => navigate("/add-vehicle")}
                className="mt-5"
              >
                Add vehicle
              </Button>
            </div>
          )}

          {!loading && !errorMessage && vehicles.length > 0 && (
            <div>
              <label
                htmlFor="vehicle"
                className="mb-2 block text-sm font-medium text-gray-700"
              >
                Your vehicle
              </label>

              <select
                id="vehicle"
                value={selectedVehicleId}
                onChange={(event) => setSelectedVehicleId(event.target.value)}
                className="h-12 w-full rounded-xl border border-gray-300 bg-white px-4 text-base outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              >
                <option value="">Select a vehicle</option>

                {vehicles.map((vehicle) => (
                  <option key={vehicle._id} value={vehicle._id}>
                    {vehicle.brand} {vehicle.model} —{" "}
                    {vehicle.registrationNumber}
                  </option>
                ))}
              </select>
            </div>
          )}

          {selectedVehicle && (
            <div className="mt-6 rounded-xl border border-blue-100 bg-blue-50 p-5">
              <p className="text-sm font-medium text-blue-700">
                Selected vehicle
              </p>

              <h3 className="mt-1 text-lg font-semibold text-gray-900">
                {selectedVehicle.brand} {selectedVehicle.model}
              </h3>

              <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4">
                <div>
                  <p className="text-xs text-gray-500">Year</p>
                  <p className="mt-1 font-medium text-gray-900">
                    {selectedVehicle.manufactureYear || "—"}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-gray-500">Color</p>
                  <p className="mt-1 font-medium text-gray-900">
                    {selectedVehicle.color || "—"}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-gray-500">Seats</p>
                  <p className="mt-1 font-medium text-gray-900">
                    {selectedVehicle.seatingCapacity || "—"}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-gray-500">Fuel</p>
                  <p className="mt-1 font-medium text-gray-900">
                    {selectedVehicle.fuelTypeId?.name || "—"}
                  </p>
                </div>
              </div>

              <div className="mt-4 border-t border-blue-100 pt-4">
                <p className="text-xs text-gray-500">Registration number</p>

                <p className="mt-1 font-medium text-gray-900">
                  {selectedVehicle.registrationNumber}
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
              disabled={!isValid || loading}
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

export default PublishRideVehicle;
