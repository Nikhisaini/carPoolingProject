import Ride from "../model/ride.js";
import RideLocation from "../model/rideLocation.js";
import RidePreference from "../model/ridePreference.js";

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

  const locations = await RideLocation.find({
    cityNormalized: {
      $in: [departureCityNormalized, destinationCityNormalized],
    },
  })
    .select(
      "_id city cityNormalized state country address placeName latitude longitude placeId",
    )
    .lean();

  const departureLocationIds = [];
  const destinationLocationIds = [];

  for (const location of locations) {
    if (location.cityNormalized === departureCityNormalized) {
      departureLocationIds.push(location._id);
    }

    if (location.cityNormalized === destinationCityNormalized) {
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

export { searchRides };
