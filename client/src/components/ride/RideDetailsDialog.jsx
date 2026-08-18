import { useEffect, useState } from "react";
import { format } from "date-fns";
import {
  CalendarDays,
  CarFront,
  Check,
  Cigarette,
  Clock3,
  IndianRupee,
  Luggage,
  MapPin,
  MessageCircle,
  Music,
  PawPrint,
  UserRound,
  Users,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import api from "@/services/Api";
import { toast } from "sonner";

function RideDetailsDialog({ rideId, open, onOpenChange }) {
  const [ride, setRide] = useState(null);
  const [loading, setLoading] = useState(false);
  const [followStates, setFollowStates] = useState({});
  const [followLoading, setFollowLoading] = useState({});

  useEffect(() => {
    if (!open || !rideId) return;

    const getRideDetails = async () => {
      try {
        setLoading(true);

        const res = await api.get(`/ride/${rideId}`);

        if (!res.data?.success) {
          throw new Error(res.data?.message || "Failed to fetch ride");
        }

        setRide(res.data.ride);
      } catch (error) {
        console.error("Get Ride Details Error:", error);
      } finally {
        setLoading(false);
      }
    };

    getRideDetails();
  }, [open, rideId]);

  useEffect(() => {
    if (!open || !ride || ride.status !== "COMPLETED") return;

    const loadFollowStatuses = async () => {
      try {
        const passengers = ride.seats
          ?.map((seat) => seat.passenger)
          .filter((passenger) => passenger?._id);

        if (!passengers?.length) return;

        const results = await Promise.all(
          passengers.map(async (passenger) => {
            try {
              const res = await api.get(`/follow/status/${passenger._id}`);

              return {
                userId: passenger._id,
                isFollowing: res.data?.isFollowing || false,
                followerCount: res.data?.followerCount || 0,
              };
            } catch (error) {
              console.error(`Follow status error for ${passenger._id}:`, error);

              return {
                userId: passenger._id,
                isFollowing: false,
                followerCount: 0,
              };
            }
          }),
        );

        const states = {};

        results.forEach((item) => {
          states[item.userId] = {
            isFollowing: item.isFollowing,
            followerCount: item.followerCount,
          };
        });

        setFollowStates(states);
      } catch (error) {
        console.error("Load Follow Status Error:", error);
      }
    };

    loadFollowStatuses();
  }, [open, ride]);

  const formatDate = (date) => {
    if (!date) return "--";

    return format(new Date(date), "EEE, dd MMM yyyy");
  };

  const formatTime = (date) => {
    if (!date) return "--";

    return format(new Date(date), "hh:mm a");
  };

  const getStatusClass = (status) => {
    switch (status) {
      case "PUBLISHED":
        return "border-blue-200 bg-blue-50 text-blue-700";
      case "FULL":
        return "border-slate-200 bg-slate-100 text-slate-700";
      case "STARTED":
        return "border-emerald-200 bg-emerald-50 text-emerald-700";
      case "COMPLETED":
        return "border-slate-200 bg-slate-100 text-slate-600";
      case "CANCELLED":
        return "border-red-200 bg-red-50 text-red-700";
      default:
        return "border-slate-200 bg-slate-100 text-slate-600";
    }
  };

  const handleFollowToggle = async (userId) => {
    try {
      setFollowLoading((prev) => ({
        ...prev,
        [userId]: true,
      }));

      const currentState = followStates[userId]?.isFollowing;
      let res;
      if (currentState) {
        res = await api.delete(`/follow/${userId}`);
      } else {
        res = await api.post(`/follow/${userId}`);
      }

      if (!res.data?.success) {
        throw new Error(res.data?.message || "Failed to update follow");
      }

      setFollowStates((prev) => ({
        ...prev,
        [userId]: {
          isFollowing: res.data.isFollowing,
          followerCount: res.data.followerCount,
        },
      }));
    } catch (error) {
      console.error("Follow Toggle Error:", error);
      toast.error(error.response?.data?.message || error.message);
    } finally {
      setFollowLoading((prev) => ({
        ...prev,
        [userId]: false,
      }));
    }
  };

  const PreferenceItem = ({ icon: Icon, label, allowed }) => (
    <div className="flex items-center justify-between rounded-xl border bg-muted/30 px-3.5 py-3">
      <div className="flex items-center gap-2.5">
        <Icon className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm font-medium">{label}</span>
      </div>

      <span
        className={
          allowed
            ? "text-xs font-medium text-emerald-600"
            : "text-xs font-medium text-muted-foreground"
        }
      >
        {allowed ? "Allowed" : "Not allowed"}
      </span>
    </div>
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-hidden rounded-3xl p-0 sm:max-w-2xl">
        <ScrollArea className="max-h-[90vh]">
          {loading ? (
            <div className="space-y-5 p-6">
              <div className="space-y-3">
                <div className="h-3 w-24 animate-pulse rounded bg-muted" />
                <div className="h-7 w-64 animate-pulse rounded bg-muted" />
              </div>

              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {[1, 2, 3].map((item) => (
                  <div
                    key={item}
                    className="h-24 animate-pulse rounded-2xl bg-muted"
                  />
                ))}
              </div>

              <div className="h-52 animate-pulse rounded-2xl bg-muted" />
              <div className="h-28 animate-pulse rounded-2xl bg-muted" />
            </div>
          ) : !ride ? (
            <div className="flex min-h-64 items-center justify-center p-6">
              <p className="text-sm text-muted-foreground">
                Unable to load ride details.
              </p>
            </div>
          ) : (
            <>
              <div className="border-b bg-gradient-to-br from-blue-50 via-white to-white px-6 pb-5 pt-6">
                <DialogHeader>
                  <div className="flex items-start justify-between gap-4 pr-8">
                    <div className="min-w-0">
                      <p className="text-xs font-semibold uppercase tracking-wider text-blue-600">
                        Ride Details
                      </p>

                      <DialogTitle className="mt-1 text-xl font-bold tracking-tight">
                        {ride.departureLocationId?.city || "Departure"}

                        <span className="mx-2 font-normal text-muted-foreground">
                          →
                        </span>

                        {ride.destinationLocationId?.city || "Destination"}
                      </DialogTitle>
                    </div>

                    <Badge
                      variant="outline"
                      className={getStatusClass(ride.status)}
                    >
                      {ride.status}
                    </Badge>
                  </div>
                </DialogHeader>

                <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3">
                  <div className="rounded-2xl border bg-white p-4 shadow-sm">
                    <CalendarDays className="h-4 w-4 text-blue-600" />

                    <p className="mt-3 text-xs text-muted-foreground">Date</p>

                    <p className="mt-1 text-sm font-semibold">
                      {formatDate(ride.departureAt)}
                    </p>
                  </div>

                  <div className="rounded-2xl border bg-white p-4 shadow-sm">
                    <Clock3 className="h-4 w-4 text-blue-600" />

                    <p className="mt-3 text-xs text-muted-foreground">
                      Departure
                    </p>

                    <p className="mt-1 text-sm font-semibold">
                      {formatTime(ride.departureAt)}
                    </p>
                  </div>

                  <div className="col-span-2 rounded-2xl border bg-white p-4 shadow-sm sm:col-span-1">
                    <IndianRupee className="h-4 w-4 text-blue-600" />

                    <p className="mt-3 text-xs text-muted-foreground">
                      Per Seat
                    </p>

                    <p className="mt-1 text-sm font-semibold">
                      ₹{ride.pricePerSeat || 0}
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-6 px-6 py-6">
                <section>
                  <h3 className="mb-3 text-sm font-semibold">Route</h3>

                  <div className="rounded-2xl border p-4">
                    <div className="flex gap-3">
                      <div className="flex flex-col items-center">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-50">
                          <MapPin className="h-4 w-4 text-blue-600" />
                        </div>

                        <div className="my-1 h-10 border-l border-dashed border-slate-300" />

                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-50">
                          <MapPin className="h-4 w-4 text-blue-600" />
                        </div>
                      </div>

                      <div className="min-w-0 flex-1 space-y-6">
                        <div>
                          <p className="text-xs text-muted-foreground">
                            Departure
                          </p>

                          <p className="mt-1 font-semibold">
                            {ride.departureLocationId?.address || "--"}
                          </p>

                          <p className="mt-1 text-xs text-muted-foreground">
                            {ride.departureLocationId?.city},{" "}
                            {ride.departureLocationId?.state}
                          </p>

                          <p className="mt-1 text-xs font-semibold text-blue-600">
                            {formatTime(ride.departureAt)}
                          </p>
                        </div>

                        <div>
                          <p className="text-xs text-muted-foreground">
                            Destination
                          </p>

                          <p className="mt-1 font-semibold">
                            {ride.destinationLocationId?.address || "--"}
                          </p>

                          <p className="mt-1 text-xs text-muted-foreground">
                            {ride.destinationLocationId?.city},{" "}
                            {ride.destinationLocationId?.state}
                          </p>

                          <p className="mt-1 text-xs font-semibold text-blue-600">
                            {formatTime(ride.estimatedArrivalAt)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </section>

                <section>
                  <h3 className="mb-3 text-sm font-semibold">Vehicle</h3>

                  <div className="flex items-center gap-4 rounded-2xl border p-4">
                    <div className="h-16 w-20 shrink-0 overflow-hidden rounded-xl bg-muted">
                      {ride.vehicleId?.vehicleImages?.[0] ? (
                        <img
                          src={`http://localhost:8081/${ride.vehicleId.vehicleImages[0]}`}
                          alt="Vehicle"
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center">
                          <CarFront className="h-7 w-7 text-muted-foreground" />
                        </div>
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="font-semibold">
                        {ride.vehicleId?.brand || ""}{" "}
                        {ride.vehicleId?.model || ""}
                      </p>

                      <p className="mt-1 text-sm text-muted-foreground">
                        {ride.vehicleId?.color || "--"} ·{" "}
                        {ride.vehicleId?.manufactureYear || "--"}
                      </p>

                      <p className="mt-1 text-xs font-medium text-muted-foreground">
                        {ride.vehicleId?.registrationNumber || "--"}
                      </p>
                    </div>

                    <div className="text-right">
                      <p className="text-xs text-muted-foreground">Seats</p>

                      <p className="text-sm font-semibold">
                        {ride.vehicleId?.seatingCapacity || 0}
                      </p>
                    </div>
                  </div>
                </section>

                <section>
                  <h3 className="mb-3 text-sm font-semibold">
                    Seats & Booking
                  </h3>

                  <div className="grid grid-cols-3 gap-3">
                    <div className="rounded-2xl border bg-muted/30 p-4 text-center">
                      <Users className="mx-auto h-4 w-4 text-blue-600" />

                      <p className="mt-2 text-xs text-muted-foreground">
                        Total
                      </p>

                      <p className="mt-1 text-sm font-semibold">
                        {ride.totalSeats}
                      </p>
                    </div>

                    <div className="rounded-2xl border bg-muted/30 p-4 text-center">
                      <Users className="mx-auto h-4 w-4 text-emerald-600" />

                      <p className="mt-2 text-xs text-muted-foreground">
                        Available
                      </p>

                      <p className="mt-1 text-sm font-semibold">
                        {ride.availableSeats}
                      </p>
                    </div>

                    <div className="rounded-2xl border bg-muted/30 p-4 text-center">
                      <Users className="mx-auto h-4 w-4 text-blue-600" />

                      <p className="mt-2 text-xs text-muted-foreground">
                        Booked
                      </p>

                      <p className="mt-1 text-sm font-semibold">
                        {(ride.totalSeats || 0) - (ride.availableSeats || 0)}
                      </p>
                    </div>
                  </div>

                  <div className="mt-3 flex items-center justify-between rounded-2xl border px-4 py-3">
                    <span className="text-sm text-muted-foreground">
                      Booking Mode
                    </span>

                    <Badge variant="secondary">{ride.bookingMode}</Badge>
                  </div>
                </section>

                {ride.preferences && (
                  <section>
                    <h3 className="mb-3 text-sm font-semibold">
                      Ride Preferences
                    </h3>

                    <div className="grid gap-2 sm:grid-cols-2">
                      <PreferenceItem
                        icon={Cigarette}
                        label="Smoking"
                        allowed={ride.preferences.smokingAllowed}
                      />

                      <PreferenceItem
                        icon={PawPrint}
                        label="Pets"
                        allowed={ride.preferences.petsAllowed}
                      />

                      <PreferenceItem
                        icon={Luggage}
                        label="Luggage"
                        allowed={ride.preferences.luggageAllowed}
                      />

                      <PreferenceItem
                        icon={Music}
                        label="Music"
                        allowed={ride.preferences.musicAllowed}
                      />

                      <PreferenceItem
                        icon={MessageCircle}
                        label="Conversation"
                        allowed={ride.preferences.conversationAllowed}
                      />
                    </div>
                  </section>
                )}

                {ride.description && (
                  <section>
                    <h3 className="mb-3 text-sm font-semibold">Description</h3>

                    <div className="rounded-2xl border bg-muted/30 p-4 text-sm leading-6 text-muted-foreground">
                      {ride.description}
                    </div>
                  </section>
                )}

                {ride.seats?.length > 0 && (
                  <section>
                    <div className="mb-3 flex items-center justify-between">
                      <h3 className="text-sm font-semibold">Passengers</h3>

                      <span className="text-xs text-muted-foreground">
                        {ride.seats.length} booked
                      </span>
                    </div>

                    <div className="space-y-2">
                      {ride.seats.map((seat) => {
                        const passengerId = seat.passenger?._id;

                        const followState = followStates[passengerId];

                        const isFollowing = followState?.isFollowing || false;

                        const isFollowLoading =
                          followLoading[passengerId] || false;

                        return (
                          <div
                            key={seat.seatNumber}
                            className="flex items-center gap-3 rounded-2xl border px-3.5 py-3"
                          >
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-muted">
                              {seat.passenger?.profileImage ? (
                                <img
                                  src={`http://localhost:8081/${seat.passenger.profileImage}`}
                                  alt="Passenger"
                                  className="h-full w-full object-cover"
                                />
                              ) : (
                                <UserRound className="h-4 w-4 text-muted-foreground" />
                              )}
                            </div>

                            <div className="min-w-0 flex-1">
                              <p className="truncate text-sm font-medium">
                                {seat.passenger?.firstName || ""}{" "}
                                {seat.passenger?.lastName || ""}
                              </p>

                              <div className="flex items-center gap-2">
                                <p className="text-xs text-muted-foreground">
                                  Seat {seat.seatNumber}
                                </p>

                                {ride.status === "COMPLETED" && followState && (
                                  <>
                                    <span className="text-xs text-muted-foreground">
                                      •
                                    </span>

                                    <span className="text-xs text-muted-foreground">
                                      {followState.followerCount || 0} followers
                                    </span>
                                  </>
                                )}
                              </div>
                            </div>

                            {ride.status === "COMPLETED" && passengerId && (
                              <Button
                                size="sm"
                                variant={isFollowing ? "outline" : "default"}
                                disabled={isFollowLoading}
                                onClick={() => handleFollowToggle(passengerId)}
                                className="shrink-0 rounded-xl"
                              >
                                {isFollowLoading
                                  ? "..."
                                  : isFollowing
                                    ? "Following"
                                    : "Follow"}
                              </Button>
                            )}

                            <Check className="h-4 w-4 shrink-0 text-emerald-500" />
                          </div>
                        );
                      })}
                    </div>
                  </section>
                )}
              </div>
            </>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}

export default RideDetailsDialog;
