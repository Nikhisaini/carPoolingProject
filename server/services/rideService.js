import Ride from "../model/ride.js";
import RideLocation from "../model/rideLocation.js";
import RidePreference from "../model/ridePreference.js";

const escapeRegex = (value) => {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
};

const searchRides = async ({
  departureCity,
  destinationCity,
  travelDate,
  requestedSeats,
  page,
  limit,
}) => {
  const skip = (page - 1) * limit;
  const startOfDay = new Date(travelDate);
  const endOfDay = new Date(startOfDay);
  endOfDay.setUTCDate(endOfDay.getUTCDate() + 1);
  const safeDepartureCity = escapeRegex(departureCity);
  const safeDestinationCity = escapeRegex(destinationCity);

  const locations = await RideLocation.find({
    $or: [
      {
        city: {
          $regex: `^${safeDepartureCity}$`,
          $options: "i",
        },
      },
      {
        city: {
          $regex: `^${safeDestinationCity}$`,
          $options: "i",
        },
      },
    ],
  })
    .select("_id city")
    .lean();

  const departureLocationIds = [];
  const destinationLocationIds = [];

  for (const location of locations) {
    const city = location.city.toLowerCase();

    if (city === departureCity.toLowerCase()) {
      departureLocationIds.push(location._id);
    }

    if (city === destinationCity.toLowerCase()) {
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
        page,
        limit,
        totalRides: 0,
        totalPages: 0,
        hasNextPage: false,
      },
    };
  }

  const rideFilter = {
    status: "PUBLISHED",
    departureLocationId: {
      $in: departureLocationIds,
    },
    destinationLocationId: {
      $in: destinationLocationIds,
    },
    departureAt: {
      $gte: startOfDay,
      $lt: endOfDay,
    },
    availableSeats: {
      $gte: requestedSeats,
    },
  };
  const [totalRides, rides] = await Promise.all([
    Ride.countDocuments(rideFilter),

    Ride.find(rideFilter)
      .populate({
        path: "ownerId",
        select: "firstName lastName profileImage",
      })
      .populate({
        path: "vehicleId",
        select:
          "brand model manufactureYear color registrationNumber seatingCapacity vehicleImages airCondition luggageCapacity verificationStatus vehicleTypeId fuelTypeId",
        populate: [
          {
            path: "vehicleTypeId",
            select: "name",
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
          "city state country address placeName latitude longitude placeId",
      })
      .populate({
        path: "destinationLocationId",
        select:
          "city state country address placeName latitude longitude placeId",
      })
      .sort({ departureAt: 1 })
      .skip(skip)
      .limit(limit)
      .lean(),
  ]);

  const totalPages = Math.ceil(totalRides / limit);
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
      page,
      limit,
      totalRides,
      totalPages,
      hasNextPage: page < totalPages,
    },
  };
};

export { searchRides };
