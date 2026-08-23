import cron from "node-cron";
import BookingSeat from "../model/bookingSeat.js";
import Booking from "../model/bookings.js";
import Ride from "../model/ride.js";
import { getIO } from "../socket/socketServer.js";

const cleanupExpiredSeatHolds = async () => {
  try {
    const now = new Date();

    const expiredSeats = await BookingSeat.find({
      status: "HELD",
      holdExpiresAt: { $lte: now },
    }).lean();

    if (!expiredSeats || expiredSeats.length === 0) {
      return;
    }

    const expiredSeatIds = expiredSeats.map((seat) => seat._id);
    const bookingIds = [
      ...new Set(expiredSeats.map((seat) => seat.bookingId.toString())),
    ];

    // Mark seats as EXPIRED
    await BookingSeat.updateMany(
      { _id: { $in: expiredSeatIds } },
      {
        $set: {
          status: "EXPIRED",
          cancelledAt: now,
        },
      },
    );

    // Cancel pending bookings associated with these seats
    await Booking.updateMany(
      {
        _id: { $in: bookingIds },
        status: "PENDING",
        paymentStatus: { $in: ["PENDING", "FAILED"] },
      },
      {
        $set: {
          status: "CANCELLED",
          paymentStatus: "FAILED",
          cancelledAt: now,
          cancellationReason: "Payment hold expired",
        },
      },
    );

    const seatsByRide = new Map();
    for (const seat of expiredSeats) {
      const rideIdStr = seat.rideId.toString();
      if (!seatsByRide.has(rideIdStr)) {
        seatsByRide.set(rideIdStr, []);
      }
      seatsByRide.get(rideIdStr).push(seat.seatNumber);
    }

    const io = getIO();

    for (const [rideIdStr, seatNumbers] of seatsByRide.entries()) {
      const count = seatNumbers.length;

      const updatedRide = await Ride.findByIdAndUpdate(
        rideIdStr,
        {
          $inc: { availableSeats: count },
          $set: { status: "PUBLISHED" },
        },
        { new: true },
      );

      if (io && updatedRide) {
        io.to(`ride:${rideIdStr}`).emit("ride:seat-released", {
          rideId: rideIdStr,
          releasedSeats: seatNumbers,
          availableSeats: updatedRide.availableSeats,
        });
      }
    }
  } catch (error) {
    console.error("Seat hold cleanup cron error:", error);
  }
};

const startSeatHoldCleanupCron = () => {
  cron.schedule("*/1 * * * *", cleanupExpiredSeatHolds);
};

export default startSeatHoldCleanupCron;
