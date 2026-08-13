import Booking from "../model/bookings.js";
import BookingSeat from "../model/bookingSeat.js";
import { retryBookingPayment } from "../services/bookingService.js";
import { verifyRazorpayPayment } from "../services/razorpayService.js";
import { getIO } from "../socket/socketServer.js";

const verifyPayment = async (req, res) => {
  try {
    const passengerId = req.user._id;
    const { razorpayOrderId, razorpayPaymentId, razorpaySignature } = req.body;

    console.log("Payment Verify:", {
      razorpayOrderId,
      passengerId: passengerId.toString(),
    });

    const booking = await Booking.findOne({
      razorpayOrderId,
    });
    if (!booking) {
      return res.status(400).json({
        success: false,
        message: "Booking not found",
      });
    }
    const isValidPayment = verifyRazorpayPayment({
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature,
    });

    if (!isValidPayment) {
      booking.paymentStatus = "FAILED";
      await booking.save();

      return res.status(400).json({
        success: false,
        message: "Payment verification failed",
      });
    }

    booking.paymentStatus = "PAID";
    booking.razorpayPaymentId = razorpayPaymentId;
    booking.razorpaySignature = razorpaySignature;
    booking.paidAt = new Date();
    booking.status = "CONFIRMED";
    booking.confirmedAt = new Date();

    await booking.save();

    await BookingSeat.updateMany(
      {
        bookingId: booking._id,
        status: "HELD",
      },
      {
        $set: {
          status: "CONFIRMED",
          confirmedAt: new Date(),
          holdExpiresAt: null,
        },
      },
    );

    const bookingSeats = await BookingSeat.find({
      bookingId: booking._id,
      status: "CONFIRMED",
    })
      .select("seatNumber")
      .lean();

    const seatNumbers = bookingSeats.map((seat) => seat.seatNumber);
    const io = getIO();
    io.to(`ride:${booking.rideId}`).emit("ride:seat-booked", {
      rideId: booking.rideId.toString(),
      seatNumbers,
    });
    console.log(razorpayOrderId, razorpayPaymentId, razorpaySignature);

    return res.status(200).json({
      success: true,
      message: "Payment Details recieved",
    });
  } catch (error) {
    console.log("Verify payment error", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

const retryPayment = async (req, res) => {
  try {
    const passengerId = req.user._id;
    const { bookingId } = req.body;

    if (!bookingId) {
      return res.status(400).json({
        success: false,
        message: "Booking ID is required",
      });
    }

    const result = await retryBookingPayment({
      bookingId,
      passengerId,
    });

    return res.status(200).json({
      success: true,
      message: "Payment retry order created successfully",
      booking: result.booking,
      razorpayOrder: result.razorpayOrder,
    });
  } catch (error) {
    console.error("Retry Payment Error:", error);

    const businessErrors = [
      "Booking not found",
      "Payment has already been completed",
      "Booking is no longer available for payment",
      "Booking seats are no longer available",
      "Payment time has expired",
    ];

    const isBusinessError = businessErrors.some((message) =>
      error.message?.startsWith(message),
    );

    if (isBusinessError) {
      return res.status(409).json({
        success: false,
        message: error.message,
      });
    }

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

export { verifyPayment, retryPayment };
