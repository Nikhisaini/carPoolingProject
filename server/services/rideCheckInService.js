import Booking from "../model/bookings.js";
import Ride from "../model/ride.js";
import RideCheckIn from "../model/rideCheckIn.js";
import crypto from "crypto";
import sendEmail from "../utils/sendEmail.js";

const sendRideCheckInOtp = async ({ rideId, bookingId, driverId }) => {
  const ride = await Ride.findById(rideId).select("ownerId status").lean();

  if (!ride) {
    throw new Error("Ride not found");
  }

  if (ride.ownerId.toString() !== driverId.toString()) {
    throw new Error("Only the ride driver can send the OTP");
  }
  const booking = await Booking.findOne({
    _id: bookingId,
    rideId,
    status: "CONFIRMED",
    paymentStatus: "PAID",
  })
    .populate({
      path: "passengerId",
      select: "firstName lastName email",
    })
    .lean();

  if (!booking) {
    throw new Error("Confirmed booking not found");
  }

  const passenger = booking.passengerId;

  if (!passenger?.email) {
    throw new Error("Passenger email not found");
  }

  let checkIn = await RideCheckIn.findOne({
    bookingId,
  });

  if (!checkIn) {
    checkIn = await RideCheckIn.create({
      rideId,
      bookingId,
      passengerId: passenger._id,
      status: "WAITING",
    });
  }

  if (checkIn.status === "VERIFIED") {
    throw new Error("Passenger has already been verified");
  }

  const otp = crypto.randomInt(100000, 1000000).toString();
  const otpHash = crypto.createHash("sha256").update(otp).digest("hex");
  const otpSentAt = new Date();

  const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000);

  checkIn.otpHash = otpHash;
  checkIn.otpSentAt = otpSentAt;
  checkIn.otpExpiresAt = otpExpiresAt;
  checkIn.otpAttempts = 0;
  checkIn.status = "OTP_SENT";

  await checkIn.save();

  await sendEmail({
    to: passenger.email,
    subject: "Ride Check-In OTP",
    text: `Your ride check-in OTP is ${otp}. It is valid for 10 minutes.`,
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6;">
        <h2>Ride Check-In Verification</h2>
        <p>Hello ${passenger.firstName || "Passenger"},</p>
        <p>
          Your driver has initiated the ride check-in verification.
        </p>
        <p>Your OTP is:</p>
        <div
          style="
            display: inline-block;
            padding: 12px 20px;
            background: #f1f5f9;
            border-radius: 8px;
            font-size: 28px;
            font-weight: bold;
            letter-spacing: 6px;
          "
        >
          ${otp}
        </div>
        <p>
          This OTP is valid for <strong>10 minutes</strong>.
        </p>
        <p>
          Do not share this OTP with anyone except for completing
          your ride check-in.
        </p>
      </div>
    `,
  });
  return {
    success: true,
    message: "OTP sent successfully to passenger",
    checkIn: {
      _id: checkIn._id,
      bookingId: checkIn.bookingId,
      rideId: checkIn.rideId,
      passengerId: checkIn.passengerId,
      status: checkIn.status,
      otpSentAt: checkIn.otpSentAt,
      otpExpiresAt: checkIn.otpExpiresAt,
    },
  };
};

const verifyRideCheckInOtp = async ({ bookingId, driverId, otp }) => {
  if (!otp || !/^\d{6}$/.test(otp)) {
    throw new Error("OTP must be a 6-digit number");
  }

  const checkIn = await RideCheckIn.findOne({
    bookingId,
  });

  if (!checkIn) {
    throw new Error("Ride check-in not found");
  }

  const ride = await Ride.findOne({
    _id: checkIn.rideId,
    ownerId: driverId,
  })
    .select("_id ownerId")
    .lean();

  if (!ride) {
    throw new Error("Only the ride driver can verify the passenger");
  }

  if (checkIn.status === "VERIFIED") {
    throw new Error("Passenger has already been verified");
  }

  if (checkIn.status !== "OTP_SENT") {
    throw new Error("OTP has not been sent");
  }

  if (!checkIn.otpHash || !checkIn.otpExpiresAt) {
    throw new Error("Invalid OTP request");
  }

  if (new Date() > checkIn.otpExpiresAt) {
    throw new Error("OTP has expired");
  }

  if (checkIn.otpAttempts >= 5) {
    throw new Error("Maximum OTP attempts exceeded");
  }

  const hashOtp = crypto.createHash("sha256").update(otp).digest("hex");

  if (hashOtp !== checkIn.otpHash) {
    checkIn.otpAttempts += 1;

    await checkIn.save();

    const remainingAttempts = Math.max(0, 5 - checkIn.otpAttempts);

    throw new Error(`Invalid OTP. ${remainingAttempts} attempt(s) remaining`);
  }

  checkIn.status = "VERIFIED";
  checkIn.verifiedAt = new Date();

  checkIn.otpHash = null;
  checkIn.otpExpiresAt = null;
  checkIn.otpSentAt = null;
  checkIn.otpAttempts = 0;

  await checkIn.save();

  return {
    success: true,
    message: "Passenger arrival verified successfully",

    checkIn: {
      _id: checkIn._id,
      bookingId: checkIn.bookingId,
      rideId: checkIn.rideId,
      passengerId: checkIn.passengerId,
      status: checkIn.status,
      verifiedAt: checkIn.verifiedAt,
    },
  };
};

const markPassengerNoShow = async ({
  rideId,
  bookingId,
  driverId,
  noShowReason,
  noShowNote = "",
}) => {
  const allowedReasons = [
    "PASSENGER_NOT_ARRIVED",
    "PASSENGER_NOT_REACHABLE",
    "PASSENGER_REFUSED_TO_BOARD",
    "OTHER",
  ];
  if (!allowedReasons.includes(noShowReason)) {
    throw new Error("Invalid No-Show reason");
  }

  const ride = await Ride.findOne({
    _id: rideId,
    ownerId: driverId,
  })
    .select("_id ownerId status")
    .lean();

  if (ride.status !== "STARTED") {
    throw new Error("Only a started ride can mark passenger as no-show");
  }

  const booking = await Booking.findOne({
    _id: bookingId,
    rideId,
    status: "CONFIRMED",
    paymentStatus: "PAID",
  })
    .populate({
      path: "passengerId",
      select: "firstName lastName email",
    })
    .lean();

  if (!booking) {
    throw new Error("Confirmed booking not found");
  }
  const checkIn = await RideCheckIn.findOne({
    bookingId,
  });

  console.log("No Show Check-In Debug:", {
    bookingId,
    rideId,
    checkIn,
  });

  if (!checkIn) {
    throw new Error("Ride check-in not found for this booking");
  }

  if (checkIn.rideId.toString() !== rideId.toString()) {
    throw new Error("Ride check-in belongs to a different ride");
  }
  if (checkIn.status === "VERIFIED") {
    throw new Error("Passenger has already verified");
  }
  if (checkIn.status === "NO_SHOW") {
    throw new Error("Passenger is already marked as No show");
  }
  checkIn.status = "NO_SHOW";
  checkIn.noShowAt = new Date();
  checkIn.noShowReason = noShowReason;
  checkIn.noShowNote = noShowNote.trim();

  checkIn.otpSentAt = null;
  checkIn.otpHash = null;
  checkIn.otpExpiresAt = null;

  await checkIn.save();

  return {
    success: true,
    message: "Passenger marked no_show successfully",
    _id: checkIn._id,
    bookingId: checkIn.bookingId,
    rideId: checkIn.rideId,
    passengerId: checkIn.passengerId,
    status: checkIn.status,
    noShowNote: checkIn.noShowNote,
    noShowReason: checkIn.noShowReason,
    noShowAt: checkIn.noShowAt,
  };
};

export { sendRideCheckInOtp, verifyRideCheckInOtp, markPassengerNoShow };
