import mongoose from "mongoose";
import Ride from "../model/ride.js";
import BookingSeat from "../model/bookingSeat.js";
import Booking from "../model/bookings.js";
import { getIO } from "../socket/socketServer.js";

const createBooking = async ({ rideId, passengerId, seats }) => {
  const session = await mongoose.startSession();

  try {
    let booking;
    let remainingAvailableSeats;

    await session.withTransaction(async () => {
      const ride = await Ride.findOne({
        _id: rideId,
        status: {
          $in: ["PUBLISHED", "FULL"],
        },
      }).session(session);

      if (!ride) {
        throw new Error("Ride is not available for booking");
      }

      if (ride.departureAt <= new Date()) {
        throw new Error("This ride has already departed");
      }

      const numberOfSeats = seats.length;

      if (numberOfSeats > ride.availableSeats) {
        throw new Error(`Only ${ride.availableSeats} seat(s) are available`);
      }

      const invalidSeats = seats.filter(
        (seatNumber) => seatNumber < 1 || seatNumber > ride.totalSeats,
      );

      if (invalidSeats.length > 0) {
        throw new Error(`Seat number must be between 1 and ${ride.totalSeats}`);
      }

      const existingSeats = await BookingSeat.find({
        rideId,
        seatNumber: {
          $in: seats,
        },
        status: {
          $in: ["HELD", "CONFIRMED"],
        },
      })
        .session(session)
        .lean();

      if (existingSeats.length > 0) {
        const occupiedSeats = existingSeats.map((seat) => seat.seatNumber);

        throw new Error(
          `Seat(s) ${occupiedSeats.join(", ")} are no longer available`,
        );
      }

      const pricePerSeat = ride.pricePerSeat;
      const subtotal = numberOfSeats * pricePerSeat;
      const discountAmount = 0;
      const totalAmount = subtotal - discountAmount;

      const bookingStatus =
        ride.bookingMode === "AUTO" ? "CONFIRMED" : "PENDING";

      const [createdBooking] = await Booking.create(
        [
          {
            rideId,
            passengerId,
            numberOfSeats,
            pricePerSeat,
            subtotal,
            discountAmount,
            totalAmount,
            status: bookingStatus,
            bookedAt: new Date(),
            confirmedAt: bookingStatus === "CONFIRMED" ? new Date() : null,
          },
        ],
        {
          session,
        },
      );

      booking = createdBooking;

      const seatDocuments = seats.map((seatNumber) => ({
        bookingId: booking._id,
        rideId,
        seatNumber,
        status: bookingStatus === "CONFIRMED" ? "CONFIRMED" : "HELD",
        heldAt: new Date(),
        holdExpiresAt:
          bookingStatus === "CONFIRMED"
            ? null
            : new Date(Date.now() + 10 * 60 * 1000),
        confirmedAt: bookingStatus === "CONFIRMED" ? new Date() : null,
      }));

      await BookingSeat.insertMany(seatDocuments, {
        session,
      });

      ride.availableSeats -= numberOfSeats;

      if (ride.availableSeats === 0) {
        ride.status = "FULL";
      } else if (ride.status === "FULL") {
        ride.status = "PUBLISHED";
      }

      await ride.save({
        session,
      });

      remainingAvailableSeats = ride.availableSeats;
    });

    if (booking.status === "CONFIRMED") {
      const io = getIO();

      io.to(`ride:${rideId}`).emit("ride:seat-booked", {
        rideId: rideId.toString(),
        seatNumbers: seats,
        availableSeats: remainingAvailableSeats,
      });
    }

    return {
      success: true,
      booking,
    };
  } finally {
    await session.endSession();
  }
};

export { createBooking };
