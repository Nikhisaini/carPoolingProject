import mongoose from "mongoose";

const validateBooking = ({ rideId, seats }) => {
  if (!rideId) {
    return {
      success: false,
      message: "Ride ID is required",
    };
  }
  if (!mongoose.Types.ObjectId.isValid(rideId)) {
    return {
      success: false,
      message: "Invalid Ride ID",
    };
  }
  if (!Array.isArray(seats) || seats.length === 0) {
    return {
      success: false,
      message: "At least one seat must be selected",
    };
  }

  const normalizeSeats = seats.map(Number);
  const hasInvalidSeat = normalizeSeats.some(
    (seat) => !Number.isInteger(seat) || seat < 1,
  );
  if (hasInvalidSeat) {
    return {
      success: false,
      message: "Seat numbers nust be positive whole numbers",
    };
  }
  const uniqueSeats = new Set(normalizeSeats);
  if (uniqueSeats.size !== normalizeSeats.length) {
    return {
      success: false,
      message: "Duplicate seats are not allowd",
    };
  }
  return {
    success: true,
    data: {
      rideId,
      seats: normalizeSeats.sort((a, b) => a - b),
    },
  };
};

export default validateBooking;
