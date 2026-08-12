import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import api from "@/services/Api";
import {
  ArrowRight,
  Badge,
  CalendarDays,
  CarFront,
  Clock3,
  IndianRupee,
  MapPin,
  MoreHorizontal,
  Search,
  Users,
} from "lucide-react";
import React, { useEffect, useState } from "react";

function MyRides() {
  const [rides, setRides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const getMyRides = async () => {
    try {
      setLoading(true);
      const res = await api.get("ride/my-rides");
      setRides(res.data.rides);
    } catch (error) {
      console.log("Get my ride Error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getMyRides();
  }, []);

  const filteredRides = rides.filter((ride) => {
    const departure =
      ride.departureLocationId?.name || ride.departureLocationId?.address || "";

    const destination =
      ride.destinationLocationId?.name ||
      ride.destinationLocationId?.address ||
      "";

    return `${departure} ${destination}`
      .toLowerCase()
      .includes(search.toLowerCase());
  });

  const getStatusVariant = (status) => {
    switch (status) {
      case "PUBLISHED":
        return "default";
      case "FULL":
        return "secondary";
      case "COMPLETED":
        return "outline";
      case "CANCELLED":
        return "destructive";
      default:
        return "secondary";
    }
  };

  const formatDate = (date) => {
    if (!date) return "N/A";

    return new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const formatTime = (date) => {
    if (!date) return "N/A";

    return new Date(date).toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-6xl space-y-6 p-6">
        <div className="h-10 w-48 animate-pulse rounded-lg bg-muted" />

        <div className="h-10 w-full max-w-md animate-pulse rounded-lg bg-muted" />

        {[1, 2, 3].map((item) => (
          <div key={item} className="h-64 animate-pulse rounded-xl bg-muted" />
        ))}
      </div>
    );
  }
  return (
    <div className="min-h-screen bg-muted/30">
      <div className="mx-auto max-w-6xl space-y-6 p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm font-medium text-primary">Ride Management</p>
            <h1 className="mt-1 text-3xl font-bold tracking-tight">My Rides</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Manage the rides you have published.
            </p>
          </div>

          <Badge variant="secondary" className="w-fit px-3 py-1.5">
            {rides.length} {rides.length === 1 ? "Ride" : "Rides"}
          </Badge>
        </div>

        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

          <Input
            placeholder="Search rides..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>

        {filteredRides.length === 0 && (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-16 text-center">
              <div className="mb-4 rounded-full bg-muted p-4">
                <MapPin className="h-6 w-6 text-muted-foreground" />
              </div>
              <h2 className="text-lg font-semibold">No rides found</h2>
              <p className="mt-1 max-w-sm text-sm text-muted-foreground">
                You don't have any rides matching your search.
              </p>
            </CardContent>
          </Card>
        )}

        <div className="space-y-5">
          {filteredRides.map((ride) => {
            const departure =
              ride.departureLocationId?.name ||
              ride.departureLocationId?.address ||
              "Departure";

            const destination =
              ride.destinationLocationId?.name ||
              ride.destinationLocationId?.address ||
              "Destination";

            return (
              <Card
                key={ride._id}
                className="overflow-hidden transition-shadow hover:shadow-md"
              >
                <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <Badge variant={getStatusVariant(ride.status)}>
                        {ride.status}
                      </Badge>
                      <Badge variant="outline">{ride.bookingMode}</Badge>
                    </div>
                    <p className="mt-2 text-xs text-muted-foreground">
                      Published {formatDate(ride.publishedAt || ride.createdAt)}
                    </p>
                  </div>

                  <Button variant="ghost" size="icon" className="rounded-full">
                    <MoreHorizontal className="h-5 w-5" />
                  </Button>
                </CardHeader>

                <CardContent className="space-y-6">
                  <div className="grid items-center gap-6 md:grid-cols-[1fr_auto_1fr]">
                    <div className="flex items-start gap-3">
                      <div className="mt-1 rounded-full bg-primary/10 p-2">
                        <MapPin className="h-4 w-4 text-primary" />
                      </div>

                      <div>
                        <p className="text-xs text-muted-foreground">
                          Departure
                        </p>
                        <p className="mt-1 font-semibold">{departure}</p>
                        <p className="mt-1 text-sm text-muted-foreground">
                          {formatTime(ride.departureAt)}
                        </p>
                      </div>
                    </div>

                    <ArrowRight className="hidden h-5 w-5 text-muted-foreground md:block" />

                    <div className="flex items-start gap-3">
                      <div className="mt-1 rounded-full bg-primary/10 p-2">
                        <MapPin className="h-4 w-4 text-primary" />
                      </div>

                      <div>
                        <p className="text-xs text-muted-foreground">
                          Destination
                        </p>
                        <p className="mt-1 font-semibold">{destination}</p>
                        <p className="mt-1 text-sm text-muted-foreground">
                          {formatTime(ride.estimatedArrivalAt)}
                        </p>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div className="grid grid-cols-2 gap-5 md:grid-cols-4">
                    <div className="flex items-center gap-3">
                      <CalendarDays className="h-4 w-4 text-muted-foreground" />

                      <div>
                        <p className="text-xs text-muted-foreground">Date</p>

                        <p className="text-sm font-medium">
                          {formatDate(ride.departureAt)}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <Clock3 className="h-4 w-4 text-muted-foreground" />

                      <div>
                        <p className="text-xs text-muted-foreground">
                          Departure
                        </p>

                        <p className="text-sm font-medium">
                          {formatTime(ride.departureAt)}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <Users className="h-4 w-4 text-muted-foreground" />

                      <div>
                        <p className="text-xs text-muted-foreground">Seats</p>

                        <p className="text-sm font-medium">
                          {ride.availableSeats} / {ride.totalSeats}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <IndianRupee className="h-4 w-4 text-muted-foreground" />

                      <div>
                        <p className="text-xs text-muted-foreground">
                          Price / Seat
                        </p>

                        <p className="text-sm font-semibold">
                          ₹{ride.pricePerSeat}
                        </p>
                      </div>
                    </div>
                  </div>

                  {ride.vehicleId && (
                    <>
                      <Separator />

                      <div className="flex items-center gap-3">
                        <div className="rounded-lg bg-muted p-2">
                          <CarFront className="h-5 w-5" />
                        </div>

                        <div>
                          <p className="text-xs text-muted-foreground">
                            Vehicle
                          </p>

                          <p className="text-sm font-semibold">
                            {ride.vehicleId.brand} {ride.vehicleId.model}
                          </p>

                          {ride.vehicleId.registrationNumber && (
                            <p className="text-xs text-muted-foreground">
                              {ride.vehicleId.registrationNumber}
                            </p>
                          )}
                        </div>
                      </div>
                    </>
                  )}

                  {ride.description && (
                    <p className="rounded-lg bg-muted/50 p-3 text-sm text-muted-foreground">
                      {ride.description}
                    </p>
                  )}
                </CardContent>

                <CardFooter className="justify-end gap-2 border-t bg-muted/20 px-6 py-4">
                  <Button variant="outline">View Details</Button>

                  <Button>Manage Ride</Button>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default MyRides;
