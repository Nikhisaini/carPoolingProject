import mongoose from "mongoose";
import Ride from "../model/ride.js";
import RidePreference from "../model/ridePreference.js";
import validateRideVehicle from "../validations/validateRide.js";
import validateRideSearch from "../validations/validateRideSearch.js";
import {
  completeRide,
  searchRides as searchRidesService,
} from "../services/rideService.js";
import RideLocation from "../model/rideLocation.js";
import Licence from "../model/licence.js";
import Vehicle from "../model/vehicle.js";
import Booking from "../model/bookings.js";
import BookingSeat from "../model/bookingSeat.js";
import UserFollow from "../model/userFollow.js";

const getPublishRideEligibility = async (req, res) => {
  try {
    const userId = req.user._id;
    const licence = await Licence.findOne({
      userId,
    }).lean();

    if (!licence) {
      return res.status(200).json({
        success: true,
        eligible: false,
        status: "LICENCE_NOT_ADDED",
        message: "Please add your driving licence before publishing a ride.",
        licence: null,
        vehicles: [],
      });
    }
    if (licence.verificationStatus === "Pending") {
      return res.status(200).json({
        success: true,
        eligible: false,
        status: "LICENCE_PENDING",
        message: "Your driving licence is waiting for admin approval.",
        licence: {
          id: licence._id,
          verificationStatus: licence.verificationStatus,
        },
        vehicles: [],
      });
    }

    if (licence.verificationStatus === "Rejected") {
      return res.status(200).json({
        success: true,
        eligible: false,
        status: "LICENCE_REJECTED",
        message:
          "Your driving licence was rejected. Please submit your licence again.",
        licence: {
          id: licence._id,
          verificationStatus: licence.verificationStatus,
        },
        vehicles: [],
      });
    }

    const vehicles = await Vehicle.find({
      ownerId: userId,
      drivingLicenceId: licence._id,
      isActive: true,
    })
      .populate("licenceCategoryId", "name type")
      .populate("fuelTypeId", "name")
      .lean();

    if (vehicles.length === 0) {
      return res.status(200).json({
        success: true,
        eligible: false,
        status: "VEHICLE_NOT_ADDED",
        message:
          "Your licence is approved. Please add a vehicle before publishing a ride.",
        licence: {
          id: licence._id,
          verificationStatus: licence.verificationStatus,
        },
        vehicles: [],
      });
    }

    const approvedVehicles = vehicles.filter(
      (vehicle) => vehicle.verificationStatus === "Approved",
    );

    if (approvedVehicles.length > 0) {
      return res.status(200).json({
        success: true,
        eligible: true,
        status: "ELIGIBLE",
        message: "You are eligible to publish a ride.",
        licence: {
          id: licence._id,
          verificationStatus: licence.verificationStatus,
        },
        vehicles: approvedVehicles,
      });
    }
    const hasPendingVehicle = vehicles.some(
      (vehicle) => vehicle.verificationStatus === "Pending",
    );

    if (hasPendingVehicle) {
      return res.status(200).json({
        success: true,
        eligible: false,
        status: "VEHICLE_PENDING",
        message: "Your vehicle is waiting for admin approval.",
        licence: {
          id: licence._id,
          verificationStatus: licence.verificationStatus,
        },
        vehicles,
      });
    }
    return res.status(200).json({
      success: true,
      eligible: false,
      status: "VEHICLE_REJECTED",
      message: "Your vehicle was rejected. Please add another vehicle.",
      licence: {
        id: licence._id,
        verificationStatus: licence.verificationStatus,
      },
      vehicles,
    });
  } catch (error) {
    console.error("Publish Ride Eligibility Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to check publish ride eligibility.",
    });
  }
};

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

    const validateLocation = (location, type) => {
      if (
        !location.city ||
        !location.address ||
        location.latitude === undefined ||
        location.longitude === undefined
      ) {
        return {
          success: false,
          message: `${type} location must contain city, address, latitude and longitude`,
        };
      }

      if (
        !location.cityNormalized ||
        typeof location.cityNormalized !== "string" ||
        !location.cityNormalized.trim()
      ) {
        return {
          success: false,
          message: `${type} location must contain cityNormalized`,
        };
      }

      return {
        success: true,
      };
    };

    const departureLocationValidation = validateLocation(
      departureLocation,
      "Departure",
    );

    if (!departureLocationValidation.success) {
      return res.status(400).json({
        success: false,
        message: departureLocationValidation.message,
      });
    }

    const destinationLocationValidation = validateLocation(
      destinationLocation,
      "Destination",
    );

    if (!destinationLocationValidation.success) {
      return res.status(400).json({
        success: false,
        message: destinationLocationValidation.message,
      });
    }

    const depLat = Number(departureLocation.latitude);
    const depLon = Number(departureLocation.longitude);
    const destLat = Number(destinationLocation.latitude);
    const destLon = Number(destinationLocation.longitude);

    const sameLocation = depLat === destLat && depLon === destLon;

    if (sameLocation) {
      return res.status(400).json({
        success: false,
        message: "Departure and destination cannot be the same location",
      });
    }

    // Calculate straight-line distance in km
    const R = 6371;
    const dLat = ((destLat - depLat) * Math.PI) / 180;
    const dLon = ((destLon - depLon) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((depLat * Math.PI) / 180) *
        Math.cos((destLat * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distanceKm = R * c;

    if (distanceKm < 1.5) {
      return res.status(400).json({
        success: false,
        message: "Departure and destination must be at least 1.5 km apart",
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

    const vehicleSeats = Number(vehicleValidation.vehicle.seatingCapacity);
    const maxPassengerSeats = vehicleSeats - 1;

    if (seats > maxPassengerSeats) {
      return res.status(400).json({
        success: false,
        message: `You can publish a maximum of ${maxPassengerSeats} passenger seats for this vehicle`,
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

    const createRideDocuments = async (opts = {}) => {
      const departureLocationDoc = new RideLocation({
        city: departureLocation.city.trim(),
        cityNormalized: departureLocation.cityNormalized.trim().toLowerCase(),
        state: departureLocation.state?.trim() || "",
        country: departureLocation.country?.trim() || "India",
        address: departureLocation.address.trim(),
        placeName: departureLocation.placeName?.trim() || "",
        latitude: depLat,
        longitude: depLon,
        placeId: departureLocation.placeId?.trim() || "",
      });
      await departureLocationDoc.save(opts);

      const destinationLocationDoc = new RideLocation({
        city: destinationLocation.city.trim(),
        cityNormalized: destinationLocation.cityNormalized.trim().toLowerCase(),
        state: destinationLocation.state?.trim() || "",
        country: destinationLocation.country?.trim() || "India",
        address: destinationLocation.address.trim(),
        placeName: destinationLocation.placeName?.trim() || "",
        latitude: destLat,
        longitude: destLon,
        placeId: destinationLocation.placeId?.trim() || "",
      });
      await destinationLocationDoc.save(opts);

      const createdRide = new Ride({
        ownerId: userId,
        vehicleId,
        departureLocationId: departureLocationDoc._id,
        destinationLocationId: destinationLocationDoc._id,
        departureAt: departureData,
        estimatedArrivalAt: arrivalDate,
        totalSeats: seats,
        availableSeats: seats,
        pricePerSeat: price,
        bookingMode: selectedBookingMode,
        status: "PUBLISHED",
        description: description?.trim() || "",
        publishedAt: new Date(),
      });
      await createdRide.save(opts);

      const createdPreference = new RidePreference({
        rideId: createdRide._id,
        smokingAllowed: preferences?.smokingAllowed ?? false,
        petsAllowed: preferences?.petsAllowed ?? false,
        luggageAllowed: preferences?.luggageAllowed ?? true,
        musicAllowed: preferences?.musicAllowed ?? true,
        conversationAllowed: preferences?.conversationAllowed ?? true,
      });
      await createdPreference.save(opts);

      return createdRide;
    };

    let ride;

    try {
      const session = await mongoose.startSession();
      try {
        await session.withTransaction(async () => {
          ride = await createRideDocuments({ session });
        });
      } finally {
        await session.endSession();
      }
    } catch (sessionError) {
      if (!ride) {
        ride = await createRideDocuments();
      }
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

const getMyRides = async (req, res) => {
  try {
    const userId = req.user._id;

    const rides = await Ride.find({
      ownerId: userId,
    })
      .populate("vehicleId")
      .populate("departureLocationId")
      .populate("destinationLocationId")
      .sort({ departureAt: -1 });

    return res.status(200).json({
      success: true,
      message: "My Rides fatched successfully",
      rides,
    });
  } catch (error) {
    console.error("Get My Rides Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
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
        select: "firstName lastName profileImage ",
      })
      .populate({
        path: "vehicleId",
        select:
          "brand model manufactureYear color registrationNumber seatingCapacity vehicleImages airCondition luggageCapacity verificationStatus vehicleTypeId fuelTypeId",
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

    const bookedSeats = await BookingSeat.find({
      rideId: ride._id,
      status: "CONFIRMED",
    })
      .populate({
        path: "bookingId",
        select: "passengerId",
        populate: {
          path: "passengerId",
          select: "firstName lastName profileImage averageRating ratingCount",
        },
      })
      .lean();
    const passengerIds = bookedSeats
      .map((seat) => seat.bookingId?.passengerId?._id)
      .filter(Boolean);

    const followerCounts = await UserFollow.aggregate([
      {
        $match: {
          followingId: { $in: passengerIds },
        },
      },
      {
        $group: {
          _id: "$followingId",
          count: { $sum: 1 },
        },
      },
    ]);

    const followerCountMap = new Map(
      followerCounts.map((item) => [item._id.toString(), item.count]),
    );

    const seats = bookedSeats.map((seat) => {
      const passenger = seat.bookingId?.passengerId;

      return {
        seatNumber: seat.seatNumber,
        passenger: passenger
          ? {
              _id: passenger._id,
              firstName: passenger.firstName,
              lastName: passenger.lastName,
              profileImage: passenger.profileImage,
              averageRating: passenger.averageRating || 0,
              ratingCount: passenger.ratingCount || 0,
              followersCount:
                followerCountMap.get(passenger._id.toString()) || 0,
            }
          : null,
      };
    });
    return res.status(200).json({
      success: true,
      message: "Ride fetched successfully",
      ride: {
        ...ride,
        preferences: preference,
        seats,
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

// const getAllRides = async (req, res) => {
//   try {
//     const rides = await Ride.find({
//       status: "PUBLISHED",
//       availableSeats: { $gt: 0 },
//       departureAt: { $gt: new Date() },
//     })
//       .populate({
//         path: "ownerId",
//         select: "firstName lastName profileImage",
//       })
//       .populate({
//         path: "vehicleId",
//         select:
//           "brand model manufactureYear color registrationNumber seatingCapacity vehicleImages airCondition luggageCapacity verificationStatus vehicleTypeId fuelTypeId",
//         populate: [
//           {
//             path: "vehicleTypeId",
//             select: "name",
//           },
//           {
//             path: "fuelTypeId",
//             select: "name",
//           },
//         ],
//       })
//       .populate({
//         path: "departureLocationId",
//         select:
//           "city state country address placeName latitude longitude placeId",
//       })
//       .populate({
//         path: "destinationLocationId",
//         select:
//           "city state country address placeName latitude longitude placeId",
//       })
//       .sort({ departureAt: 1 })
//       .lean();

//     const rideIds = rides.map((ride) => ride._id);

//     const preferences = await RidePreference.find({
//       rideId: {
//         $in: rideIds,
//       },
//     }).lean();

//     const preferenceMap = new Map(
//       preferences.map((preference) => [
//         preference.rideId.toString(),
//         preference,
//       ]),
//     );

//     const ridesWithPreferences = rides.map((ride) => ({
//       ...ride,
//       preferences: preferenceMap.get(ride._id.toString()) || null,
//     }));

//     return res.status(200).json({
//       success: true,
//       message: "Rides fetched successfully",
//       count: ridesWithPreferences.length,
//       rides: ridesWithPreferences,
//     });
//   } catch (error) {
//     console.error("Get All Rides Error:", error);

//     return res.status(500).json({
//       success: false,
//       message: "Internal server error",
//     });
//   }
// };

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

const cancelRide = async (req, res) => {
  try {
    const userId = req.user._id;
    const { rideId } = req.params;
    const { cancellationReason = "" } = req.body;

    if (!mongoose.Types.ObjectId.isValid(rideId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid ride ID",
      });
    }

    const ride = await Ride.findOne({
      _id: rideId,
      ownerId: userId,
    });

    if (!ride) {
      return res.status(404).json({
        success: false,
        message: "Ride not found",
      });
    }

    if (["STARTED", "COMPLETED", "CANCELLED"].includes(ride.status)) {
      return res.status(409).json({
        success: false,
        message: `Ride cannot be cancelled because it is already ${ride.status.toLowerCase()}`,
      });
    }

    if (ride.departureAt <= new Date()) {
      return res.status(409).json({
        success: false,
        message: "Ride cannot be cancelled after departure time",
      });
    }

    const session = await mongoose.startSession();

    try {
      await session.withTransaction(async () => {
        ride.status = "CANCELLED";
        ride.cancelledAt = new Date();

        await ride.save({ session });

        const bookings = await Booking.find({
          rideId: ride._id,
          status: {
            $in: ["PENDING", "CONFIRMED"],
          },
        }).session(session);

        for (const booking of bookings) {
          booking.status = "CANCELLED";
          booking.cancelledAt = new Date();
          booking.cancellationReason =
            cancellationReason.trim() || "Ride cancelled by driver";

          if (booking.paymentStatus === "PAID") {
            booking.paymentStatus = "REFUNDED";
          }

          await booking.save({ session });
        }

        await BookingSeat.updateMany(
          {
            rideId: ride._id,
            status: {
              $in: ["HELD", "CONFIRMED"],
            },
          },
          {
            $set: {
              status: "CANCELLED",
              cancelledAt: new Date(),
            },
          },
          { session },
        );
      });
    } finally {
      await session.endSession();
    }

    return res.status(200).json({
      success: true,
      message: "Ride cancelled successfully",
      rideId: ride._id,
    });
  } catch (error) {
    console.error("Cancel Ride Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

const startRide = async (req, res) => {
  try {
    const { rideId } = req.params;
    const driverId = req.user._id;

    if (!rideId) {
      return res.status(400).json({
        success: false,
        message: "Ride ID is required",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(rideId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid Ride ID",
      });
    }

    const ride = await Ride.findOne({
      _id: rideId,
      ownerId: driverId,
    });

    if (!ride) {
      return res.status(404).json({
        success: false,
        message: "Ride not found or you are not the owner",
      });
    }

    if (ride.status !== "PUBLISHED" && ride.status !== "FULL") {
      return res.status(400).json({
        success: false,
        message: `Ride cannot be started from ${ride.status} status`,
      });
    }

    ride.status = "STARTED";
    ride.startedAt = new Date();

    await ride.save();

    return res.status(200).json({
      success: true,
      message: "Ride started successfully",
      ride: {
        _id: ride._id,
        status: ride.status,
        startedAt: ride.startedAt,
      },
    });
  } catch (error) {
    console.error("Start Ride Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

const handleCompleteRide = async (req, res) => {
  try {
    const driverId = req.user._id;
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
        message: "Invalid Ride ID",
      });
    }

    const result = await completeRide({
      rideId,
      driverId,
    });

    return res.status(200).json({
      success: true,
      message: result.message,
      ride: result.ride,
      noShowCount: result.noShowCount,
    });
  } catch (error) {
    console.error("Complete Ride Error:", error);

    const businessErrors = [
      "Ride not found or you are not the driver",
      "Only a started ride can be completed",
      "All passengers must be verified or marked as no-show before completing the ride",
    ];

    const isBusinessError = businessErrors.some((message) =>
      error.message?.startsWith(message),
    );

    if (isBusinessError) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export {
  publishRide,
  getRideById,
  // getAllRides,
  searchRides,
  getPublishRideEligibility,
  getMyRides,
  cancelRide,
  startRide,
  handleCompleteRide,
};
