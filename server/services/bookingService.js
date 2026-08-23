import mongoose from "mongoose";
import Ride from "../model/ride.js";
import BookingSeat from "../model/bookingSeat.js";
import Booking from "../model/bookings.js";
import { getIO } from "../socket/socketServer.js";
import { createRazorpayOrder } from "./razorpayService.js";

const createBooking = async ({
  rideId,
  passengerId,
  seats,
  pickupLocationId,
  dropoffLocationId,
}) => {
  const performBookingWrites = async (session = null) => {
    const opts = session ? { session } : {};

    const rideQuery = Ride.findOne({
      _id: rideId,
      status: {
        $in: ["PUBLISHED", "FULL"],
      },
    });
    if (session) rideQuery.session(session);
    const ride = await rideQuery;

    if (!ride) {
      throw new Error("Ride is not available for booking");
    }

    if (ride.ownerId.toString() === passengerId.toString()) {
      throw new Error("You cannot book your own ride");
    }

    if (ride.departureAt <= new Date()) {
      throw new Error("This ride has already departed");
    }

    const existingBookingQuery = Booking.findOne({
      rideId,
      passengerId,
      status: {
        $in: ["PENDING", "CONFIRMED", "COMPLETED"],
      },
    });
    if (session) existingBookingQuery.session(session);
    const existingBooking = await existingBookingQuery;

    if (existingBooking) {
      throw new Error("You have already booked this ride");
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

    const seatQuery = BookingSeat.find({
      rideId,
      seatNumber: {
        $in: seats,
      },
      status: {
        $in: ["HELD", "CONFIRMED"],
      },
    });
    if (session) seatQuery.session(session);
    const existingSeats = await seatQuery.lean();

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

    const bookingStatus = "PENDING";

    const createdBooking = new Booking({
      rideId,
      passengerId,
      pickupLocationId: pickupLocationId || ride.departureLocationId,
      dropoffLocationId: dropoffLocationId || ride.destinationLocationId,
      numberOfSeats,
      pricePerSeat,
      subtotal,
      discountAmount,
      totalAmount,
      status: bookingStatus,
      paymentStatus: "PENDING",
      bookedAt: new Date(),
      confirmedAt: bookingStatus === "CONFIRMED" ? new Date() : null,
    });
    await createdBooking.save(opts);

    const holdExpiresAt = new Date(Date.now() + 10 * 60 * 1000);
    const seatDocuments = seats.map((seatNumber) => ({
      bookingId: createdBooking._id,
      rideId,
      seatNumber,
      status: "HELD",
      heldAt: new Date(),
      holdExpiresAt,
      confirmedAt: null,
    }));

    await BookingSeat.insertMany(seatDocuments, opts);

    ride.availableSeats -= numberOfSeats;
    if (ride.availableSeats === 0) {
      ride.status = "FULL";
    } else if (ride.status === "FULL") {
      ride.status = "PUBLISHED";
    }

    await ride.save(opts);

    return createdBooking;
  };

  let booking;

  try {
    const session = await mongoose.startSession();
    try {
      await session.withTransaction(async () => {
        booking = await performBookingWrites(session);
      });
    } finally {
      await session.endSession();
    }
  } catch (sessionError) {
    if (!booking) {
      booking = await performBookingWrites();
    }
  }
  const razorpayOrder = await createRazorpayOrder({
    amount: booking.totalAmount,
    currency: "INR",
    receipt: booking._id.toString(),
  });

  booking.razorpayOrderId = razorpayOrder.id;
  await booking.save();

  return {
    success: true,
    booking,
    razorpayOrder: {
      id: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
    },
  };
};

const retryBookingPayment = async ({ bookingId, passengerId }) => {
  const booking = await Booking.findOne({
    _id: bookingId,
    passengerId,
    status: "PENDING",
    paymentStatus: {
      $in: ["PENDING", "FAILED"],
    },
  });

  if (!booking) {
    throw new Error("Booking is not available for payment retry");
  }

  const bookingSeats = await BookingSeat.find({
    bookingId: booking._id,
    status: "HELD",
  }).lean();

  if (bookingSeats.length === 0) {
    throw new Error("Booking seats are no longer available");
  }

  const expiredSeats = bookingSeats.some(
    (seat) => seat.holdExpiresAt && new Date(seat.holdExpiresAt) <= new Date(),
  );

  if (expiredSeats) {
    await BookingSeat.updateMany(
      {
        bookingId: booking._id,
        status: "HELD",
      },
      {
        $set: {
          status: "CANCELLED",
          cancelledAt: new Date(),
        },
      },
    );

    booking.status = "CANCELLED";
    booking.cancelledAt = new Date();
    booking.cancellationReason = "Payment hold expired";

    await booking.save();

    // Restore ride availableSeats
    await Ride.findByIdAndUpdate(booking.rideId, {
      $inc: { availableSeats: booking.numberOfSeats },
      $set: { status: "PUBLISHED" },
    });

    throw new Error("Payment time expired. Please select the seats again");
  }

  const razorpayOrder = await createRazorpayOrder({
    amount: booking.totalAmount,
    currency: "INR",
    receipt: booking._id.toString(),
  });

  booking.razorpayOrderId = razorpayOrder.id;
  booking.paymentStatus = "PENDING";

  await booking.save();

  return {
    booking,
    razorpayOrder: {
      id: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
    },
  };
};

export { createBooking, retryBookingPayment };
