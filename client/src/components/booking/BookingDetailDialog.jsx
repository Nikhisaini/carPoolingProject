import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import api from "@/services/Api";
import { format } from "date-fns";
import {
  ArrowDown,
  ArrowRight,
  CalendarDays,
  Car,
  Check,
  Clock3,
  Loader2,
  MapPin,
  ShieldCheck,
  Star,
  UserRound,
  Users,
} from "lucide-react";
import { useEffect, useState } from "react";

function BookingDetailDialog({ bookingId, open, onOpenChange }) {
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (!open || !bookingId) return;

    getBookingDetail();
  }, [open, bookingId]);

  const getBookingDetail = async () => {
    try {
      setLoading(true);
      setErrorMessage("");

      const res = await api.get(`/booking/detail/${bookingId}`);

      if (!res.data?.success) {
        throw new Error(res.data?.message || "Unable to load booking details.");
      }

      setBooking(res.data.booking);
    } catch (error) {
      console.error("Get Booking Detail Error:", error);

      setErrorMessage(
        error.response?.data?.message ||
          error.message ||
          "Unable to load booking details.",
      );
    } finally {
      setLoading(false);
    }
  };

  const ride = booking?.rideId;
  const owner = ride?.ownerId;
  const vehicle = ride?.vehicleId;
  const departure = ride?.departureLocationId;
  const destination = ride?.destinationLocationId;

  const departureDate = ride?.departureAt ? new Date(ride.departureAt) : null;

  const vehicleImage = vehicle?.vehicleImages?.[0];

  const vehicleImageUrl = vehicleImage
    ? `http://localhost:8081/${vehicleImage}`
    : null;

  const profileImageUrl = owner?.profileImage
    ? `http://localhost:8081/${owner.profileImage}`
    : null;

  const rating =
    owner?.averageRating ?? owner?.ratingAverage ?? owner?.rating ?? null;

  const hasRating =
    rating !== null && rating !== undefined && !Number.isNaN(Number(rating));

  const seatCount = booking?.seats?.length || 0;

  const totalAmount =
    booking?.totalAmount ??
    booking?.totalPrice ??
    (ride?.pricePerSeat || 0) * seatCount;

  const bookingStatus = booking?.status || "CONFIRMED";

  const getStatusClass = () => {
    switch (bookingStatus) {
      case "CONFIRMED":
        return "border-emerald-200 bg-emerald-50 text-emerald-700";

      case "CANCELLED":
        return "border-red-200 bg-red-50 text-red-700";

      case "PENDING":
        return "border-amber-200 bg-amber-50 text-amber-700";

      case "COMPLETED":
        return "border-slate-200 bg-slate-100 text-slate-700";

      default:
        return "border-slate-200 bg-slate-50 text-slate-600";
    }
  };

  const InfoCard = ({ icon: Icon, label, children }) => (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50">
          <Icon className="h-4 w-4 text-blue-600" />
        </div>

        <p className="text-xs font-medium text-slate-400">{label}</p>
      </div>

      <div className="mt-2 text-sm font-semibold text-slate-900">
        {children}
      </div>
    </div>
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[92vh] w-[calc(100%-1.5rem)] max-w-3xl flex-col gap-0 overflow-hidden rounded-3xl border-slate-200 bg-white p-0 shadow-2xl sm:w-full">
        {loading ? (
          <div className="flex min-h-[500px] flex-col items-center justify-center gap-3 bg-white">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-50">
              <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
            </div>

            <p className="text-sm font-medium text-slate-500">
              Loading booking details...
            </p>
          </div>
        ) : errorMessage ? (
          <div className="flex min-h-[500px] flex-col items-center justify-center px-6 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-red-50">
              <ShieldCheck className="h-6 w-6 text-red-500" />
            </div>

            <h3 className="mt-4 text-lg font-semibold text-slate-900">
              Unable to load booking
            </h3>

            <p className="mt-2 max-w-sm text-sm leading-6 text-red-600">
              {errorMessage}
            </p>

            <Button
              type="button"
              variant="outline"
              onClick={getBookingDetail}
              className="mt-5 rounded-xl"
            >
              Try Again
            </Button>
          </div>
        ) : booking ? (
          <>
            <DialogHeader className="shrink-0 border-b border-slate-100 bg-white px-6 pb-5 pt-6 sm:px-7">
              <div className="pr-7">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <p className="text-xs font-semibold uppercase tracking-[0.12em] text-blue-600">
                      Booking Details
                    </p>

                    <DialogTitle className="mt-1.5 truncate text-xl font-bold tracking-tight text-slate-950 sm:text-2xl">
                      {departure?.city || "Departure"}
                      <span className="mx-2 text-slate-300">→</span>
                      {destination?.city || "Destination"}
                    </DialogTitle>

                    <DialogDescription className="mt-1.5 truncate text-xs text-slate-400">
                      Booking ID: {booking._id}
                    </DialogDescription>
                  </div>

                  <Badge
                    variant="outline"
                    className={`shrink-0 rounded-full px-3 py-1 text-xs font-medium ${getStatusClass()}`}
                  >
                    {bookingStatus}
                  </Badge>
                </div>
              </div>
            </DialogHeader>

            <ScrollArea className="min-h-0 flex-1">
              <div className="space-y-6 px-6 py-6 sm:px-7">
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                  <InfoCard icon={CalendarDays} label="Date">
                    {departureDate
                      ? format(departureDate, "EEE, dd MMM yyyy")
                      : "--"}
                  </InfoCard>

                  <InfoCard icon={Clock3} label="Departure">
                    {departureDate ? format(departureDate, "hh:mm a") : "--"}
                  </InfoCard>

                  <InfoCard icon={ShieldCheck} label="Total Amount">
                    ₹{Number(totalAmount).toLocaleString("en-IN")}
                  </InfoCard>
                </div>

                <section>
                  <div className="mb-3 flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50">
                      <UserRound className="h-4 w-4 text-blue-600" />
                    </div>

                    <div>
                      <h3 className="text-sm font-semibold text-slate-900">
                        Driver
                      </h3>

                      <p className="text-xs text-slate-400">Ride owner</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                    <div className="flex min-w-0 items-center gap-3">
                      {profileImageUrl ? (
                        <img
                          src={profileImageUrl}
                          alt={`${owner?.firstName || ""} ${
                            owner?.lastName || ""
                          }`}
                          className="h-12 w-12 shrink-0 rounded-full object-cover ring-2 ring-slate-100"
                        />
                      ) : (
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-blue-50 text-sm font-bold text-blue-600">
                          {owner?.firstName?.charAt(0)?.toUpperCase() || "U"}
                        </div>
                      )}

                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-slate-900">
                          {owner?.firstName || ""} {owner?.lastName || ""}
                        </p>

                        <p className="mt-0.5 text-xs text-slate-400">Driver</p>
                      </div>
                    </div>

                    {hasRating && (
                      <div className="flex shrink-0 items-center gap-1 rounded-full bg-amber-50 px-3 py-1.5 text-xs font-semibold text-amber-700">
                        <Star className="h-3 w-3 fill-current" />
                        {Number(rating).toFixed(1)}
                      </div>
                    )}
                  </div>
                </section>

                <section>
                  <div className="mb-3 flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50">
                      <Car className="h-4 w-4 text-blue-600" />
                    </div>

                    <div>
                      <h3 className="text-sm font-semibold text-slate-900">
                        Vehicle
                      </h3>

                      <p className="text-xs text-slate-400">
                        Vehicle used for this ride
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                    <div className="h-16 w-24 shrink-0 overflow-hidden rounded-xl bg-slate-100">
                      {vehicleImageUrl ? (
                        <img
                          src={vehicleImageUrl}
                          alt={`${vehicle?.brand || ""} ${
                            vehicle?.model || ""
                          }`}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center">
                          <Car className="h-6 w-6 text-slate-400" />
                        </div>
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-slate-900">
                        {vehicle?.brand || "--"} {vehicle?.model || ""}
                      </p>

                      <p className="mt-1 text-xs text-slate-500">
                        {vehicle?.manufactureYear || "--"}
                        {vehicle?.manufactureYear && vehicle?.color
                          ? " • "
                          : ""}
                        {vehicle?.color || ""}
                      </p>

                      {vehicle?.registrationNumber && (
                        <p className="mt-1.5 text-xs font-medium text-slate-700">
                          {vehicle.registrationNumber}
                        </p>
                      )}
                    </div>
                  </div>
                </section>

                <section>
                  <div className="mb-3 flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50">
                      <MapPin className="h-4 w-4 text-blue-600" />
                    </div>

                    <div>
                      <h3 className="text-sm font-semibold text-slate-900">
                        Journey
                      </h3>

                      <p className="text-xs text-slate-400">
                        Pickup and destination
                      </p>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                    <div className="relative">
                      <div className="absolute bottom-7 left-[7px] top-7 w-px border-l border-dashed border-slate-300" />

                      <div className="relative flex gap-4">
                        <div className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-blue-600 ring-4 ring-blue-50" />

                        <div className="min-w-0 pb-7">
                          <p className="text-[10px] font-semibold uppercase tracking-wider text-blue-600">
                            Pickup
                          </p>

                          <p className="mt-1 text-sm font-semibold text-slate-900">
                            {departure?.placeName ||
                              departure?.city ||
                              "Departure"}
                          </p>

                          {departure?.address && (
                            <p className="mt-1 text-xs leading-5 text-slate-500">
                              {departure.address}
                            </p>
                          )}

                          {departureDate && (
                            <p className="mt-2 flex items-center gap-1.5 text-xs font-medium text-blue-600">
                              <Clock3 className="h-3.5 w-3.5" />
                              {format(departureDate, "hh:mm a")}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="relative flex gap-4">
                        <div className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-slate-500 ring-4 ring-slate-100" />

                        <div className="min-w-0">
                          <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                            Drop-off
                          </p>

                          <p className="mt-1 text-sm font-semibold text-slate-900">
                            {destination?.placeName ||
                              destination?.city ||
                              "Destination"}
                          </p>

                          {destination?.address && (
                            <p className="mt-1 text-xs leading-5 text-slate-500">
                              {destination.address}
                            </p>
                          )}

                          {ride?.estimatedArrivalAt && (
                            <p className="mt-2 flex items-center gap-1.5 text-xs font-medium text-slate-600">
                              <Clock3 className="h-3.5 w-3.5" />
                              {format(
                                new Date(ride.estimatedArrivalAt),
                                "hh:mm a",
                              )}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </section>

                <section>
                  <div className="mb-3 flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50">
                      <Users className="h-4 w-4 text-blue-600" />
                    </div>

                    <div>
                      <h3 className="text-sm font-semibold text-slate-900">
                        Your Booking
                      </h3>

                      <p className="text-xs text-slate-400">
                        Seats reserved for you
                      </p>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-500">
                        Booked seats
                      </span>

                      <span className="text-sm font-semibold text-slate-900">
                        {seatCount}
                      </span>
                    </div>

                    <div className="mt-4 flex flex-wrap gap-2">
                      {booking.seats?.map((seat) => (
                        <div
                          key={seat.seatNumber}
                          className="flex items-center gap-1.5 rounded-lg border border-blue-100 bg-blue-50 px-3 py-2 text-xs font-semibold text-blue-700"
                        >
                          <Check className="h-3.5 w-3.5" />
                          Seat {seat.seatNumber}
                        </div>
                      ))}
                    </div>
                  </div>
                </section>

                <section>
                  <div className="mb-3 flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50">
                      <ShieldCheck className="h-4 w-4 text-blue-600" />
                    </div>

                    <div>
                      <h3 className="text-sm font-semibold text-slate-900">
                        Payment
                      </h3>

                      <p className="text-xs text-slate-400">
                        Booking payment summary
                      </p>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-slate-200 bg-slate-50/60 p-5">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-500">Price per seat</span>

                      <span className="font-semibold text-slate-900">
                        ₹
                        {Number(ride?.pricePerSeat || 0).toLocaleString(
                          "en-IN",
                        )}
                      </span>
                    </div>

                    <div className="mt-3 flex items-center justify-between text-sm">
                      <span className="text-slate-500">Seats</span>

                      <span className="font-semibold text-slate-900">
                        {seatCount}
                      </span>
                    </div>

                    <Separator className="my-4" />

                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold text-slate-700">
                        Total Amount
                      </span>

                      <span className="text-xl font-bold text-slate-950">
                        ₹{Number(totalAmount).toLocaleString("en-IN")}
                      </span>
                    </div>
                  </div>
                </section>

                <div className="h-1" />
              </div>
            </ScrollArea>

            <div className="shrink-0 border-t border-slate-100 bg-white px-6 py-4 sm:px-7">
              <Button
                type="button"
                variant="outline"
                className="h-10 w-full rounded-xl border-slate-200 bg-white text-sm font-medium hover:bg-slate-50"
                onClick={() => onOpenChange(false)}
              >
                Close
              </Button>
            </div>
          </>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}

export default BookingDetailDialog;
