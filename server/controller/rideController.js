import mongoose from "mongoose";
import Ride from "../model/ride.js";
import RideLocation from "../model/RideLocation.js";
import RidePreference from "../model/ridePreference.js";
import validateRideVehicle from "../validations/validateRide.js";
import validateRideSearch from "../validations/validateRideSearch.js";
import { searchRides as searchRidesService } from "../services/rideService.js";

const publishRide = async (req, res) => {
  try {
    const userId = req.user._id;
    const {
      vehicleId,
      departureLocation,
      destinationLocation,
      departureAt,
      estimatedArrivalAt,
      totalSeats,
      pricePerSeat,
      bookingMode,
      description,
      preferences,
    } = req.body;

    if (!mongoose.Types.ObjectId.isValid(vehicleId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid vehicle ID",
      });
    }
    if (!departureLocation || !destinationLocation) {
      return res.status(400).json({
        success: false,
        message: "Departure and destination locations are required",
      });
    }

    if (!departureAt) {
      return res.status(400).json({
        success: false,
        message: "Departure date and time are required",
      });
    }

    if (totalSeats === undefined || totalSeats === null) {
      return res.status(400).json({
        success: false,
        message: "Total seats are required",
      });
    }

    if (pricePerSeat === undefined || pricePerSeat === null) {
      return res.status(400).json({
        success: false,
        message: "Price per seat is required",
      });
    }

    const vehicleValidation = await validateRideVehicle({
      userId,
      vehicleId,
    });

    if (!vehicleValidation.success) {
      return res.status(400).json({
        success: false,
        message: vehicleValidation.message,
      });
    }

    if (
      !departureLocation.city ||
      !departureLocation.address ||
      departureLocation.latitude === undefined ||
      departureLocation.longitude === undefined
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Departure location must contain city, address, latitude and longitude",
      });
    }

    if (
      !destinationLocation.city ||
      !destinationLocation.address ||
      destinationLocation.latitude === undefined ||
      destinationLocation.longitude === undefined
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Destination location must contain city, address, latitude and longitude",
      });
    }

    const sameLocation =
      Number(departureLocation.latitude) ===
        Number(destinationLocation.latitude) &&
      Number(departureLocation.longitude) ===
        Number(destinationLocation.longitude);

    if (sameLocation) {
      return res.status(400).json({
        success: false,
        message: "Departure and destination cannot be the same",
      });
    }

    const departureData = new Date(departureAt);

    if (Number.isNaN(departureData.getTime())) {
      return res.status(400).json({
        success: false,
        message: "Invalid departure date and time",
      });
    }

    if (departureData <= new Date()) {
      return res.status(400).json({
        success: false,
        message: "Departure date and time must be in the future",
      });
    }

    let arrivalDate = null;

    if (estimatedArrivalAt) {
      arrivalDate = new Date(estimatedArrivalAt);

      if (Number.isNaN(arrivalDate.getTime())) {
        return res.status(400).json({
          success: false,
          message: "Invalid estimated arrival date and time",
        });
      }
      if (arrivalDate <= departureData) {
        return res.status(400).json({
          success: false,
          message: "Estimated arrival time must be after departure time",
        });
      }
    }

    const seats = Number(totalSeats);

    if (!Number.isInteger(seats) || seats < 1) {
      return res.status(400).json({
        success: false,
        message: "Total seats must be a positive whole number",
      });
    }

    const maxPassengerSeats = vehicleValidation.vehicle.seatingCapacity - 1;

    if (seats > maxPassengerSeats) {
      return res.status(400).json({
        success: false,
        message: `You can publish a maximum of ${maxPassengerSeats} passenger seats for this vehicle`,
      });
    }

    if (!Number.isInteger(seats) || seats < 1) {
      return res.status(400).json({
        success: false,
        message: "Total seats must be a positive whole number",
      });
    }

    const price = Number(pricePerSeat);

    if (!Number.isFinite(price) || price <= 0) {
      return res.status(400).json({
        success: false,
        message: "Price per seat must be greater than 0",
      });
    }

    const selectedBookingMode = bookingMode || "AUTO";
    if (!["AUTO", "MANUAL"].includes(selectedBookingMode)) {
      return res.status(400).json({
        success: false,
        message: "Invalid booking mode",
      });
    }

    const session = await mongoose.startSession();
    let ride;
    try {
      await session.withTransaction(async () => {
        const [departureLocationDoc] = await RideLocation.create(
          [
            {
              city: departureLocation.city,
              state: departureLocation.state || "",
              country: departureLocation.country || "India",
              address: departureLocation.address,
              placeName: departureLocation.placeName || "",
              latitude: Number(departureLocation.latitude),
              longitude: Number(departureLocation.longitude),
              placeId: departureLocation.placeId || "",
            },
          ],
          { session },
        );
        const [destinationLocationDoc] = await RideLocation.create(
          [
            {
              city: destinationLocation.city,
              state: destinationLocation.state || "",
              country: destinationLocation.country || "India",
              address: destinationLocation.address,
              placeName: destinationLocation.placeName || "",
              latitude: Number(destinationLocation.latitude),
              longitude: Number(destinationLocation.longitude),
              placeId: destinationLocation.placeId || "",
            },
          ],
          { session },
        );
        [ride] = await Ride.create(
          [
            {
              ownerId: userId,
              vehicleId,
              departureLocationId: departureLocationDoc._id,
              destinationLocationId: destinationLocationDoc._id,
              departureAt: departureData,
              estimatedArrivalAt: arrivalDate,
              totalSeats: seats,
              availableSeats: seats,
              pricePerSeat: price,
              //   currency: "INR",
              bookingMode: selectedBookingMode,
              status: "PUBLISHED",
              description: description?.trim() || "",
              publishedAt: new Date(),
            },
          ],
          { session },
        );

        await RidePreference.create(
          [
            {
              rideId: ride._id,
              smokingAllowed: preferences?.smokingAllowed ?? false,
              petsAllowed: preferences?.petsAllowed ?? false,
              luggageAllowed: preferences?.luggageAllowed ?? true,
              musicAllowed: preferences?.musicAllowed ?? true,
              conversationAllowed: preferences?.conversationAllowed ?? true,
            },
          ],
          { session },
        );
      });
    } finally {
      await session.endSession();
    }
    return res.status(201).json({
      success: true,
      message: "Ride published successfully",
      rideId: ride._id,
    });
  } catch (error) {
    console.error("Publish Ride Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

const getRideById = async (req, res) => {
  try {
    const { rideId } = req.params;

    if (!rideId) {
      return res.status(400).json({
        success: false,
        message: "Ride ID is required",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(rideId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid ride ID",
      });
    }

    const ride = await Ride.findById(rideId)
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
      .lean();

    if (!ride) {
      return res.status(404).json({
        success: false,
        message: "Ride not found",
      });
    }

    const preference = await RidePreference.findOne({
      rideId: ride._id,
    }).lean();

    return res.status(200).json({
      success: true,
      message: "Ride fetched successfully",
      ride: {
        ...ride,
        preferences: preference,
      },
    });
  } catch (error) {
    console.error("Get Ride By ID Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

const getAllRides = async (req, res) => {
  try {
    const rides = await Ride.find({
      status: "PUBLISHED",
      availableSeats: { $gt: 0 },
      departureAt: { $gt: new Date() },
    })
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
      .lean();

    const rideIds = rides.map((ride) => ride._id);

    const preferences = await RidePreference.find({
      rideId: {
        $in: rideIds,
      },
    }).lean();

    const preferenceMap = new Map(
      preferences.map((preference) => [
        preference.rideId.toString(),
        preference,
      ]),
    );

    const ridesWithPreferences = rides.map((ride) => ({
      ...ride,
      preferences: preferenceMap.get(ride._id.toString()) || null,
    }));

    return res.status(200).json({
      success: true,
      message: "Rides fetched successfully",
      count: ridesWithPreferences.length,
      rides: ridesWithPreferences,
    });
  } catch (error) {
    console.error("Get All Rides Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

const searchRides = async (req, res) => {
  try {
    const { from, to, date, seats, page = 1, limit = 10 } = req.query;

    const validation = validateRideSearch({
      from,
      to,
      date,
      seats,
      page,
      limit,
    });

    if (!validation.success) {
      return res.status(400).json({
        success: false,
        message: validation.message,
      });
    }

    const result = await searchRidesService({
      departureCity: validation.data.departureCity,
      destinationCity: validation.data.destinationCity,
      travelDate: validation.data.travelDate,
      requestedSeats: validation.data.seats,
      page: validation.data.page,
      limit: validation.data.limit,
    });
    return res.status(200).json({
      success: true,
      message:
        result.rides.length > 0 ? "Rides found successfully" : "No rides found",
      data: result,
    });
  } catch (error) {
    console.error("Search Rides Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
export { publishRide, getRideById, getAllRides, searchRides };
