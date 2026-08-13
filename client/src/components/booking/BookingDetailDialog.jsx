import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import api from "@/services/Api";
import { format } from "date-fns";
import {
  ArrowRight,
  Car,
  Clock,
  Loader2,
  MapPin,
  ShieldCheck,
  Star,
  User,
  Users,
} from "lucide-react";
import { useEffect, useState } from "react";

function BookingDetailDialog({ bookingId, open, onOpenChange }) {
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (!open || !bookingId) {
      return;
    }

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
    if (bookingStatus === "CONFIRMED") {
      return "border-green-200 bg-green-50 text-green-700";
    }

    if (bookingStatus === "CANCELLED") {
      return "border-red-200 bg-red-50 text-red-700";
    }

    if (bookingStatus === "PENDING") {
      return "border-amber-200 bg-amber-50 text-amber-700";
    }

    return "border-gray-200 bg-gray-50 text-gray-700";
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] w-[calc(100%-2rem)] max-w-2xl overflow-y-auto rounded-2xl p-0">
        {loading ? (
          <div className="flex min-h-[400px] items-center justify-center">
            <div className="flex flex-col items-center gap-3">
              <Loader2 className="h-7 w-7 animate-spin text-blue-600" />
              <p className="text-sm text-gray-500">
                Loading booking details...
              </p>
            </div>
          </div>
        ) : errorMessage ? (
          <div className="flex min-h-[400px] flex-col items-center justify-center px-6 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-50">
              <ShieldCheck className="h-6 w-6 text-red-500" />
            </div>

            <h3 className="mt-4 text-lg font-semibold text-gray-900">
              Unable to load booking
            </h3>

            <p className="mt-2 max-w-sm text-sm text-red-600">{errorMessage}</p>

            <Button
              type="button"
              variant="outline"
              onClick={getBookingDetail}
              className="mt-5"
            >
              Try Again
            </Button>
          </div>
        ) : booking ? (
          <>
            <DialogHeader className="border-b border-gray-100 px-6 py-5">
              <div className="flex items-start justify-between gap-4 pr-6">
                <div>
                  <DialogTitle className="text-xl font-bold text-gray-950">
                    Booking Details
                  </DialogTitle>

                  <DialogDescription className="mt-1 text-xs text-gray-500">
                    Booking ID: {booking._id}
                  </DialogDescription>
                </div>

                <Badge
                  variant="outline"
                  className={`shrink-0 ${getStatusClass()}`}
                >
                  {bookingStatus}
                </Badge>
              </div>
            </DialogHeader>

            <div className="space-y-5 px-6 py-5">
              <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                <div className="flex flex-wrap items-center gap-3">
                  <h2 className="text-lg font-bold text-gray-950">
                    {departure?.city}
                  </h2>

                  <ArrowRight className="h-4 w-4 text-gray-400" />

                  <h2 className="text-lg font-bold text-gray-950">
                    {destination?.city}
                  </h2>
                </div>

                {departureDate && (
                  <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-gray-500">
                    <span className="flex items-center gap-1.5">
                      <Clock className="h-3.5 w-3.5 text-blue-600" />
                      {format(departureDate, "EEE, MMM d")}
                    </span>

                    <span className="flex items-center gap-1.5">
                      <Clock className="h-3.5 w-3.5 text-blue-600" />
                      {format(departureDate, "hh:mm a")}
                    </span>
                  </div>
                )}
              </div>

              <div>
                <div className="mb-3 flex items-center gap-2">
                  <User className="h-4 w-4 text-blue-600" />

                  <h3 className="text-sm font-semibold text-gray-900">
                    Driver
                  </h3>
                </div>

                <div className="flex items-center justify-between rounded-xl border border-gray-200 p-4">
                  <div className="flex min-w-0 items-center gap-3">
                    {profileImageUrl ? (
                      <img
                        src={profileImageUrl}
                        alt={`${owner?.firstName || ""} ${
                          owner?.lastName || ""
                        }`}
                        className="h-12 w-12 rounded-full object-cover"
                      />
                    ) : (
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-blue-50 text-sm font-bold text-blue-600">
                        {owner?.firstName?.charAt(0)?.toUpperCase() || "U"}
                      </div>
                    )}

                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-gray-900">
                        {owner?.firstName} {owner?.lastName}
                      </p>

                      <p className="mt-1 text-xs text-gray-500">Ride owner</p>
                    </div>
                  </div>

                  {hasRating && (
                    <div className="flex shrink-0 items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1.5 text-xs font-semibold text-amber-700">
                      <Star className="h-3 w-3 fill-current" />
                      {Number(rating).toFixed(1)}
                    </div>
                  )}
                </div>
              </div>

              <Separator />

              <div>
                <div className="mb-3 flex items-center gap-2">
                  <Car className="h-4 w-4 text-blue-600" />

                  <h3 className="text-sm font-semibold text-gray-900">
                    Vehicle
                  </h3>
                </div>

                <div className="flex items-center gap-4 rounded-xl border border-gray-200 p-4">
                  {vehicleImageUrl ? (
                    <img
                      src={vehicleImageUrl}
                      alt={`${vehicle?.brand || ""} ${vehicle?.model || ""}`}
                      className="h-16 w-24 rounded-lg object-cover"
                    />
                  ) : (
                    <div className="flex h-16 w-24 items-center justify-center rounded-lg bg-gray-100">
                      <Car className="h-6 w-6 text-gray-400" />
                    </div>
                  )}

                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-gray-900">
                      {vehicle?.brand} {vehicle?.model}
                    </p>

                    <p className="mt-1 text-xs text-gray-500">
                      {vehicle?.manufactureYear || ""}
                      {vehicle?.manufactureYear && vehicle?.color ? " • " : ""}
                      {vehicle?.color || ""}
                    </p>

                    {vehicle?.registrationNumber && (
                      <p className="mt-2 text-xs font-medium text-gray-700">
                        {vehicle.registrationNumber}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <Separator />

              <div>
                <div className="mb-3 flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-blue-600" />

                  <h3 className="text-sm font-semibold text-gray-900">
                    Journey
                  </h3>
                </div>

                <div className="relative pl-5">
                  <div className="absolute bottom-4 left-[5px] top-4 w-px bg-gray-200" />

                  <div className="relative pb-5">
                    <div className="absolute -left-5 top-1 h-3 w-3 rounded-full bg-blue-600 ring-4 ring-blue-50" />

                    <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-400">
                      Pickup
                    </p>

                    <p className="mt-1 text-sm font-semibold text-gray-900">
                      {departure?.placeName || departure?.city}
                    </p>

                    {departure?.address && (
                      <p className="mt-1 text-xs text-gray-500">
                        {departure.address}
                      </p>
                    )}
                  </div>

                  <div className="relative">
                    <div className="absolute -left-5 top-1 h-3 w-3 rounded-full bg-gray-500 ring-4 ring-gray-100" />

                    <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-400">
                      Drop-off
                    </p>

                    <p className="mt-1 text-sm font-semibold text-gray-900">
                      {destination?.placeName || destination?.city}
                    </p>

                    {destination?.address && (
                      <p className="mt-1 text-xs text-gray-500">
                        {destination.address}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <Separator />

              <div>
                <div className="mb-3 flex items-center gap-2">
                  <Users className="h-4 w-4 text-blue-600" />

                  <h3 className="text-sm font-semibold text-gray-900">
                    Your Booking
                  </h3>
                </div>

                <div className="rounded-xl border border-gray-200 p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">Booked seats</span>

                    <span className="text-sm font-semibold text-gray-900">
                      {seatCount}
                    </span>
                  </div>

                  <div className="mt-3 flex flex-wrap gap-2">
                    {booking.seats?.map((seat) => (
                      <div
                        key={seat.seatNumber}
                        className="rounded-lg bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700"
                      >
                        Seat {seat.seatNumber}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <Separator />

              <div>
                <div className="mb-3 flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-blue-600" />

                  <h3 className="text-sm font-semibold text-gray-900">
                    Payment
                  </h3>
                </div>

                <div className="rounded-xl bg-gray-50 p-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Price per seat</span>

                    <span className="font-semibold text-gray-900">
                      ₹{(ride?.pricePerSeat || 0).toLocaleString("en-IN")}
                    </span>
                  </div>

                  <div className="mt-3 flex items-center justify-between text-sm">
                    <span className="text-gray-500">Seats</span>

                    <span className="font-semibold text-gray-900">
                      {seatCount}
                    </span>
                  </div>

                  <Separator className="my-3" />

                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-gray-800">Total</span>

                    <span className="text-xl font-bold text-gray-950">
                      ₹{Number(totalAmount).toLocaleString("en-IN")}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="border-t border-gray-100 px-6 py-4">
              <Button
                type="button"
                variant="outline"
                className="w-full"
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
