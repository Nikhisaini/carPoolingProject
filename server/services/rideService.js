import Booking from "../model/bookings.js";
import Ride from "../model/ride.js";
import RideCheckIn from "../model/rideCheckIn.js";
import RideLocation from "../model/rideLocation.js";
import RidePreference from "../model/ridePreference.js";
import sendEmail from "../utils/sendEmail.js";

const normalizeCity = (value) => {
  return (
    value?.trim().toLowerCase().replace(/\s+/g, " ").replace(/[.,]/g, "") || ""
  );
};

const searchRides = async ({
  departureCity,
  destinationCity,
  travelDate,
  requestedSeats,
  page = 1,
  limit = 10,
}) => {
  const departureCityNormalized = normalizeCity(departureCity);
  const destinationCityNormalized = normalizeCity(destinationCity);

  if (!departureCityNormalized || !destinationCityNormalized) {
    return {
      rides: [],
      pagination: {
        page: 1,
        limit: 10,
        totalRides: 0,
        totalPages: 0,
        hasNextPage: false,
      },
    };
  }

  if (departureCityNormalized === destinationCityNormalized) {
    return {
      rides: [],
      pagination: {
        page: 1,
        limit: 10,
        totalRides: 0,
        totalPages: 0,
        hasNextPage: false,
      },
    };
  }

  const parsedDate = new Date(travelDate);

  if (Number.isNaN(parsedDate.getTime())) {
    return {
      rides: [],
      pagination: {
        page: 1,
        limit: 10,
        totalRides: 0,
        totalPages: 0,
        hasNextPage: false,
      },
    };
  }

  const year = parsedDate.getUTCFullYear();
  const month = parsedDate.getUTCMonth();
  const day = parsedDate.getUTCDate();

  const startOfDay = new Date(
    Date.UTC(year, month, day) - 5.5 * 60 * 60 * 1000,
  );

  const endOfDay = new Date(
    Date.UTC(year, month, day + 1) - 5.5 * 60 * 60 * 1000,
  );

  const safePage = Math.max(Number(page) || 1, 1);
  const safeLimit = Math.min(Math.max(Number(limit) || 10, 1), 50);
  const safeRequestedSeats = Math.max(Number(requestedSeats) || 1, 1);

  const skip = (safePage - 1) * safeLimit;

  const departureRegex = new RegExp(
    departureCityNormalized.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
    "i",
  );
  const destinationRegex = new RegExp(
    destinationCityNormalized.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
    "i",
  );

  const locations = await RideLocation.find({
    $or: [
      {
        cityNormalized: {
          $in: [departureCityNormalized, destinationCityNormalized],
        },
      },
      { cityNormalized: departureRegex },
      { cityNormalized: destinationRegex },
      { address: departureRegex },
      { address: destinationRegex },
      { placeName: departureRegex },
      { placeName: destinationRegex },
    ],
  })
    .select(
      "_id city cityNormalized state country address placeName latitude longitude placeId",
    )
    .lean();

  const departureLocationIds = [];
  const destinationLocationIds = [];

  for (const location of locations) {
    const locCity = location.cityNormalized || "";
    const locAddr = (location.address || "").toLowerCase();
    const locPlace = (location.placeName || "").toLowerCase();

    if (
      locCity === departureCityNormalized ||
      locCity.includes(departureCityNormalized) ||
      departureCityNormalized.includes(locCity) ||
      locAddr.includes(departureCityNormalized) ||
      locPlace.includes(departureCityNormalized)
    ) {
      departureLocationIds.push(location._id);
    }

    if (
      locCity === destinationCityNormalized ||
      locCity.includes(destinationCityNormalized) ||
      destinationCityNormalized.includes(locCity) ||
      locAddr.includes(destinationCityNormalized) ||
      locPlace.includes(destinationCityNormalized)
    ) {
      destinationLocationIds.push(location._id);
    }
  }

  if (
    departureLocationIds.length === 0 ||
    destinationLocationIds.length === 0
  ) {
    return {
      rides: [],
      pagination: {
        page: safePage,
        limit: safeLimit,
        totalRides: 0,
        totalPages: 0,
        hasNextPage: false,
      },
    };
  }

  const now = new Date();
  const effectiveStart = new Date(
    Math.max(startOfDay.getTime(), now.getTime()),
  );

  const rideFilter = {
    status: "PUBLISHED",
    departureLocationId: {
      $in: departureLocationIds,
    },
    destinationLocationId: {
      $in: destinationLocationIds,
    },
    departureAt: {
      $gte: effectiveStart,
      $lt: endOfDay,
    },
    availableSeats: {
      $gte: safeRequestedSeats,
    },
  };

  const totalRideCount = await Ride.countDocuments(rideFilter);

  const rides = await Ride.find(rideFilter)
    .populate({
      path: "ownerId",
      select: "firstName lastName profileImage",
    })
    .populate({
      path: "vehicleId",
      select:
        "brand model manufactureYear color registrationNumber seatingCapacity vehicleImages luggageCapacity airCondition verificationStatus licenceCategoryId fuelTypeId",
      populate: [
        {
          path: "licenceCategoryId",
          select: "name type",
        },
        {
          path: "fuelTypeId",
          select: "name",
        },
      ],
    })
    .populate({
      path: "departureLocationId",
      select:
        "city cityNormalized state country address placeName latitude longitude placeId",
    })
    .populate({
      path: "destinationLocationId",
      select:
        "city cityNormalized state country address placeName latitude longitude placeId",
    })
    .sort({
      departureAt: 1,
      _id: 1,
    })
    .skip(skip)
    .limit(safeLimit)
    .lean();

  const totalRides = totalRideCount;
  const totalPages = Math.ceil(totalRides / safeLimit);

  const rideIds = rides.map((ride) => ride._id);

  let preferences = [];

  if (rideIds.length > 0) {
    preferences = await RidePreference.find({
      rideId: {
        $in: rideIds,
      },
    })
      .select(
        "rideId smokingAllowed petsAllowed luggageAllowed musicAllowed conversationAllowed",
      )
      .lean();
  }

  const preferenceMap = new Map(
    preferences.map((preference) => [preference.rideId.toString(), preference]),
  );

  const ridesWithPreferences = rides.map((ride) => ({
    ...ride,
    preferences: preferenceMap.get(ride._id.toString()) || null,
  }));

  return {
    rides: ridesWithPreferences,
    pagination: {
      page: safePage,
      limit: safeLimit,
      totalRides,
      totalPages,
      hasNextPage: safePage < totalPages,
    },
  };
};

const completeRide = async ({ rideId, driverId }) => {
  const ride = await Ride.findOne({
    _id: rideId,
    ownerId: driverId,
  })
    .select("_id ownerId status completedAt")
    .lean();

  if (!ride) {
    throw new Error("Ride not found or you are not the driver");
  }

  if (ride.status !== "STARTED") {
    throw new Error("Only a started ride can be completed");
  }

  const bookings = await Booking.find({
    rideId,
    status: "CONFIRMED",
    paymentStatus: "PAID",
  })
    .populate({
      path: "passengerId",
      select: "firstName lastName email",
    })
    .lean();

  const bookingIds = bookings.map((booking) => booking._id);

  const checkIns = await RideCheckIn.find({
    rideId,
    bookingId: { $in: bookingIds },
  }).lean();

  const checkInMap = new Map(
    checkIns.map((checkIn) => [checkIn.bookingId.toString(), checkIn]),
  );

  const incompletePassengers = [];

  for (const booking of bookings) {
    const checkIn = checkInMap.get(booking._id.toString());

    if (!checkIn) {
      incompletePassengers.push({
        bookingId: booking._id,
        passengerId: booking.passengerId?._id,
        status: "NO_CHECK_IN",
      });

      continue;
    }

    if (!["VERIFIED", "NO_SHOW"].includes(checkIn.status)) {
      incompletePassengers.push({
        bookingId: booking._id,
        passengerId: booking.passengerId?._id,
        status: checkIn.status,
      });
    }
  }

  if (incompletePassengers.length > 0) {
    throw new Error(
      "All passengers must be verified or marked as no-show before completing the ride",
    );
  }

  const noShowPassengers = [];
  for (const booking of bookings) {
    const checkIn = checkInMap.get(booking._id.toString());

    if (checkIn?.status === "NO_SHOW" && booking.passengerId?.email) {
      noShowPassengers.push({
        booking,
        checkIn,
      });
    }
  }

  for (const { booking, checkIn } of noShowPassengers) {
    const passenger = booking.passengerId;

    const reasonText = {
      PASSENGER_NOT_ARRIVED: "Passenger did not arrive at the pickup location.",
      PASSENGER_NOT_REACHABLE: "Passenger could not be reached.",
      PASSENGER_REFUSED_TO_BOARD: "Passenger refused to board the ride.",
      OTHER: "Other reason.",
    };

    await sendEmail({
      to: passenger.email,
      subject: "Ride No-Show Notification",
      text: `Your ride has been completed.You were marked as a no-show by the driver.
      Reason: ${reasonText[checkIn.noShowReason] || checkIn.noShowReason}Note: ${checkIn.noShowNote || "No additional note provided."}`,
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6;">
          <h2>Ride No-Show Notification</h2>
          <p>
            Hello ${passenger.firstName || "Passenger"},
          </p>
          <p>
            Your ride has been completed by the driver.
          </p>
          <p>
            You were marked as <strong>NO-SHOW</strong>.
          </p>
          <p>
            <strong>Reason:</strong><br/>
            ${reasonText[checkIn.noShowReason] || checkIn.noShowReason}
          </p>
          <p>
            <strong>Driver Note:</strong><br/>
            ${checkIn.noShowNote || "No additional note provided."}
          </p>
          <p>
            If you believe this was incorrect, please contact support.
          </p>
        </div>
      `,
    });
  }

  await Booking.updateMany(
    {
      rideId,
      status: "CONFIRMED",
      paymentStatus: "PAID",
    },
    {
      $set: {
        status: "COMPLETED",
        completedAt: new Date(),
      },
    },
  );
  const completedAt = new Date();
  const updatedRide = await Ride.findByIdAndUpdate(
    rideId,
    {
      $set: {
        status: "COMPLETED",
        completedAt,
      },
    },
    {
      new: true,
    },
  ).lean();

  return {
    success: true,
    message: "Ride completed successfully",
    ride: updatedRide,
    noShowCount: noShowPassengers.length,
  };
};

export { searchRides, completeRide };
