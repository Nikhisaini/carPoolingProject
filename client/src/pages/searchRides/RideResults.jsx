import React, { useEffect, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  Car,
  Clock,
  IndianRupee,
  Loader2,
  MapPin,
  Users,
} from "lucide-react";
import { format } from "date-fns";
import { useLocation, useNavigate } from "react-router-dom";
import api from "@/services/Api";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

function RideResults() {
  const location = useLocation();
  const navigate = useNavigate();

  const { departureLocation, destinationLocation, travelDate, seats } =
    location.state || {};

  const from = departureLocation?.city;
  const to = destinationLocation?.city;
  const date = travelDate;

  const [rides, setRides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    totalRides: 0,
    totalPages: 0,
    hasNextPage: false,
  });

  useEffect(() => {
    if (!from || !to || !date || !seats) {
      navigate("/search", { replace: true });
    }
  }, [from, to, date, seats, navigate]);

  const getRides = async (page = 1) => {
    try {
      setLoading(true);
      setErrorMessage("");

      const res = await api.get("/ride/search", {
        params: {
          from,
          to,
          date,
          seats,
          page,
          limit: 10,
        },
      });

      const result = res.data?.data;

      setRides(result?.rides || []);

      setPagination(
        result?.pagination || {
          page,
          limit: 10,
          totalRides: 0,
          totalPages: 0,
          hasNextPage: false,
        },
      );
    } catch (error) {
      console.error("Search Rides Error:", error);

      setErrorMessage(
        error.response?.data?.message ||
          error.message ||
          "Unable to load rides.",
      );

      setRides([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!from || !to || !date || !seats) {
      return;
    }

    getRides(1);
  }, [from, to, date, seats]);

  const handlePreviousPage = () => {
    if (pagination.page <= 1) {
      return;
    }

    getRides(pagination.page - 1);
  };

  const handleNextPage = () => {
    if (!pagination.hasNextPage) {
      return;
    }

    getRides(pagination.page + 1);
  };

  const handleViewRide = (rideId) => {
    navigate(`/ride/${rideId}`);
  };

  const handleBackToSearch = () => {
    navigate("/search");
  };

  if (!from || !to || !date || !seats) {
    return null;
  }

  const formattedSearchDate = new Date(`${date}T00:00:00`);

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-7">
        <p className="text-sm font-medium text-blue-600">Search results</p>

        <h1 className="mt-1 text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
          Available rides
        </h1>

        <p className="mt-1 text-sm text-gray-500">
          Choose a ride that works best for you.
        </p>
      </div>

      <Card className="mb-5 border-gray-200 shadow-sm">
        <CardContent className="p-4">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-blue-600" />

              <span className="text-sm font-semibold text-gray-900">
                {from}
              </span>
            </div>

            <ArrowRight className="h-4 w-4 text-gray-400" />

            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-blue-600" />

              <span className="text-sm font-semibold text-gray-900">{to}</span>
            </div>

            <div className="hidden h-5 w-px bg-gray-200 sm:block" />

            <div className="flex items-center gap-2 text-sm text-gray-600">
              <CalendarDays className="h-4 w-4" />

              {format(formattedSearchDate, "EEE, MMM d, yyyy")}
            </div>

            <div className="hidden h-5 w-px bg-gray-200 sm:block" />

            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Users className="h-4 w-4" />
              {seats} {Number(seats) === 1 ? "seat" : "seats"}
            </div>
          </div>
        </CardContent>
      </Card>

      {loading && (
        <div className="flex min-h-64 items-center justify-center rounded-xl border border-gray-200 bg-white">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="h-7 w-7 animate-spin text-blue-600" />

            <p className="text-sm text-gray-500">
              Searching for available rides...
            </p>
          </div>
        </div>
      )}

      {!loading && errorMessage && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-6">
          <h3 className="font-semibold text-red-800">Unable to load rides</h3>

          <p className="mt-1 text-sm text-red-600">{errorMessage}</p>

          <Button
            type="button"
            onClick={() => getRides(pagination.page)}
            className="mt-4"
          >
            Try again
          </Button>
        </div>
      )}

      {!loading && !errorMessage && rides.length === 0 && (
        <Card className="border-gray-200 shadow-sm">
          <CardContent className="flex min-h-64 flex-col items-center justify-center p-8 text-center">
            <Car className="h-12 w-12 text-gray-400" />

            <h2 className="mt-4 text-xl font-semibold text-gray-900">
              No rides found
            </h2>

            <p className="mt-2 max-w-md text-sm text-gray-500">
              We couldn't find any rides matching your search. Try another date,
              route, or number of seats.
            </p>

            <Button
              type="button"
              variant="outline"
              onClick={handleBackToSearch}
              className="mt-5 gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Modify search
            </Button>
          </CardContent>
        </Card>
      )}

      {!loading && !errorMessage && rides.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600">
              {pagination.totalRides}{" "}
              {pagination.totalRides === 1 ? "ride" : "rides"} found
            </p>

            {pagination.totalPages > 0 && (
              <p className="text-sm text-gray-500">
                Page {pagination.page} of {pagination.totalPages}
              </p>
            )}
          </div>

          {rides.map((ride) => {
            const departureDate = new Date(ride.departureAt);
            const owner = ride.ownerId;
            const vehicle = ride.vehicleId;
            const departure = ride.departureLocationId;
            const destination = ride.destinationLocationId;

            return (
              <Card
                key={ride._id}
                className="border-gray-200 shadow-sm transition hover:border-gray-300 hover:shadow-md"
              >
                <CardContent className="p-4 sm:p-5">
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-3">
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-base font-semibold text-gray-900">
                            {departure?.city}
                          </p>

                          <p className="mt-0.5 truncate text-xs text-gray-500">
                            {departure?.placeName || departure?.address}
                          </p>
                        </div>

                        <div className="flex shrink-0 items-center gap-1">
                          <div className="h-px w-8 bg-gray-300" />

                          <ArrowRight className="h-4 w-4 text-gray-400" />

                          <div className="h-px w-8 bg-gray-300" />
                        </div>

                        <div className="min-w-0 flex-1">
                          <p className="truncate text-base font-semibold text-gray-900">
                            {destination?.city}
                          </p>

                          <p className="mt-0.5 truncate text-xs text-gray-500">
                            {destination?.placeName || destination?.address}
                          </p>
                        </div>
                      </div>

                      <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2">
                        <div className="flex items-center gap-1.5 text-sm text-gray-600">
                          <CalendarDays className="h-4 w-4 text-gray-400" />

                          {format(departureDate, "EEE, MMM d")}
                        </div>

                        <div className="flex items-center gap-1.5 text-sm font-medium text-gray-900">
                          <Clock className="h-4 w-4 text-gray-400" />

                          {format(departureDate, "hh:mm a")}
                        </div>

                        <div className="flex items-center gap-1.5 text-sm text-gray-600">
                          <Users className="h-4 w-4 text-gray-400" />
                          {ride.availableSeats} seats available
                        </div>
                      </div>
                    </div>

                    <div className="hidden h-16 w-px bg-gray-200 lg:block" />

                    <div className="flex items-center gap-3">
                      {owner?.profileImage ? (
                        <img
                          src={`http://localhost:8081/${owner.profileImage}`}
                          alt={`${owner.firstName} ${owner.lastName}`}
                          className="h-10 w-10 shrink-0 rounded-full object-cover"
                        />
                      ) : (
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-100 text-sm font-semibold text-blue-600">
                          {owner?.firstName?.charAt(0)}
                        </div>
                      )}

                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-gray-900">
                          {owner?.firstName} {owner?.lastName}
                        </p>

                        <div className="mt-0.5 flex items-center gap-1.5 text-xs text-gray-500">
                          <Car className="h-3.5 w-3.5" />

                          <span className="truncate">
                            {vehicle?.brand} {vehicle?.model}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="hidden h-16 w-px bg-gray-200 lg:block" />

                    <div className="flex items-center justify-between gap-4 lg:min-w-32 lg:flex-col lg:items-end lg:gap-2">
                      <div>
                        <div className="flex items-center gap-0.5">
                          <IndianRupee className="h-4 w-4 text-gray-900" />

                          <span className="text-xl font-bold text-gray-900">
                            {ride.pricePerSeat}
                          </span>
                        </div>

                        <p className="text-right text-xs text-gray-500">
                          per seat
                        </p>
                      </div>

                      <Button
                        type="button"
                        onClick={() => handleViewRide(ride._id)}
                        className="h-9 gap-1.5 rounded-lg px-4"
                      >
                        View ride
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}

          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-between rounded-xl border border-gray-200 bg-white p-3 shadow-sm">
              <Button
                type="button"
                variant="outline"
                disabled={loading || pagination.page <= 1}
                onClick={handlePreviousPage}
                className="gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Previous
              </Button>

              <span className="text-sm text-gray-600">
                Page {pagination.page} of {pagination.totalPages}
              </span>

              <Button
                type="button"
                variant="outline"
                disabled={loading || !pagination.hasNextPage}
                onClick={handleNextPage}
                className="gap-2"
              >
                Next
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      )}

      {!loading && rides.length > 0 && (
        <div className="mt-5">
          <Button
            type="button"
            variant="ghost"
            onClick={handleBackToSearch}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Modify search
          </Button>
        </div>
      )}
    </div>
  );
}

export default RideResults;
