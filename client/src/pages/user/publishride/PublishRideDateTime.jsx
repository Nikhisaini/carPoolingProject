import React, { useEffect, useState } from "react";
import { ArrowLeft, ArrowRight, CalendarDays, Clock } from "lucide-react";
import { format, startOfDay } from "date-fns";
import { useLocation, useNavigate } from "react-router-dom";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

function PublishRideDateTime() {
  const navigate = useNavigate();
  const location = useLocation();

  const { departureLocation, destinationLocation, departureAt } =
    location.state || {};

  const [selectedDate, setSelectedDate] = useState(() => {
    if (!departureAt) {
      return null;
    }

    const date = new Date(departureAt);

    return isNaN(date.getTime()) ? null : date;
  });

  const [selectedTime, setSelectedTime] = useState(() => {
    if (!departureAt) {
      return "";
    }

    const date = new Date(departureAt);

    if (isNaN(date.getTime())) {
      return "";
    }

    return `${String(date.getHours()).padStart(2, "0")}:${String(
      date.getMinutes(),
    ).padStart(2, "0")}`;
  });

  const today = startOfDay(new Date());

  useEffect(() => {
    if (!departureLocation || !destinationLocation) {
      navigate("/publish-ride", { replace: true });
    }
  }, [departureLocation, destinationLocation, navigate]);

  if (!departureLocation || !destinationLocation) {
    return null;
  }

  const getDepartureDateTime = () => {
    if (!selectedDate || !selectedTime) {
      return null;
    }

    const [hours, minutes] = selectedTime.split(":").map(Number);

    const departureDateTime = new Date(selectedDate);

    departureDateTime.setHours(hours, minutes, 0, 0);

    return departureDateTime;
  };

  const isDepartureInFuture = () => {
    const departureDateTime = getDepartureDateTime();

    if (!departureDateTime) {
      return false;
    }

    return departureDateTime > new Date();
  };

  const handleContinue = () => {
    const departureDateTime = getDepartureDateTime();

    if (!departureDateTime || departureDateTime <= new Date()) {
      return;
    }

    navigate("/publish-ride/vehicle", {
      state: {
        ...location.state,
        departureLocation,
        destinationLocation,
        departureAt: departureDateTime.toISOString(),
      },
    });
  };

  const handleBack = () => {
    navigate("/publish-ride", {
      state: {
        ...location.state,
        departureLocation,
        destinationLocation,
        departureAt:
          selectedDate && selectedTime
            ? getDepartureDateTime()?.toISOString()
            : undefined,
      },
    });
  };

  const isValid = isDepartureInFuture();

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8">
        <p className="text-sm font-medium text-blue-600">Publish a ride</p>

        <h1 className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
          When are you going?
        </h1>

        <p className="mt-2 text-gray-600">
          Choose the date and time you will leave.
        </p>
      </div>

      {departureLocation && destinationLocation && (
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
      )}

      <Card className="border-gray-200 shadow-sm">
        <CardHeader className="border-b border-gray-100">
          <CardTitle className="flex items-center gap-2 text-xl">
            <CalendarDays className="h-5 w-5 text-blue-600" />
            Departure date
          </CardTitle>

          <CardDescription>Select the day you plan to leave.</CardDescription>
        </CardHeader>

        <CardContent className="p-6">
          <div className="flex justify-center">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              disabled={{ before: today }}
              className="rounded-xl border p-4 [--cell-size:3.25rem] sm:[--cell-size:3.5rem]"
            />
          </div>

          {selectedDate && (
            <div className="mt-6 rounded-xl border border-blue-100 bg-blue-50 p-4">
              <p className="text-sm font-medium text-blue-700">
                Selected departure date
              </p>

              <p className="mt-1 text-lg font-semibold text-gray-900">
                {format(selectedDate, "EEEE, MMMM d, yyyy")}
              </p>
            </div>
          )}

          <div className="mt-8">
            <div className="mb-3">
              <h2 className="flex items-center gap-2 text-lg font-semibold text-gray-900">
                <Clock className="h-5 w-5 text-blue-600" />
                What time will you leave?
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                Choose your planned departure time.
              </p>
            </div>

            <input
              type="time"
              value={selectedTime}
              onChange={(event) => setSelectedTime(event.target.value)}
              className="h-12 w-full rounded-xl border border-gray-300 bg-white px-4 text-base outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />

            {selectedDate && selectedTime && !isDepartureInFuture() && (
              <p className="mt-2 text-sm text-red-600">
                Departure time must be in the future.
              </p>
            )}
          </div>

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

export default PublishRideDateTime;
