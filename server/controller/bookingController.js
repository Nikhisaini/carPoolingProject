import { createBooking } from "../services/bookingService.js";
import validateBooking from "../validations/validateBooking.js";

const bookRide = async (req, res) => {
  try {
    const passengerId = req.user._id;
    const { rideId, seats } = req.body;

    const validation = validateBooking({
      rideId,
      seats,
    });
    if (!validateBooking) {
      return res.status(400).json({
        success: false,
        message: validation.message,
      });
    }

    const result = await createBooking({
      rideId: validation.data.rideId,
      passengerId,
      seats: validation.data.seats,
    });

    return res.status(201).json({
      success: true,
      message:
        result.booking.status === "CONFIRMED"
          ? "Ride booked successfully"
          : "Booking request submitted successfully",
      booking: result.booking,
    });
  } catch (error) {
    console.error("Book Ride Error", error);
    if (error?.code === 11000) {
      return res.status(404).json({
        success: false,
        message: "One or more selected seats are not available",
      });
    }
    const businessErrors = [
      "Ride is not available for booking",
      "This ride has already departed",
      "only",
      "Seat number must be between",
      "are no longer available",
    ];

    const isBusinessError = businessErrors.some((message) =>
      error.message?.startsWith(message),
    );
    if (!businessErrors) {
      return res.status(409).json({
        success: false,
        message: error.message,
      });
    }
    return res.status(500).json({
      success: false,
      messsage: "Internal Server Error",
    });
  }
};

export { bookRide };
