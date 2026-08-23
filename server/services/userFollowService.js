import Booking from "../model/bookings.js";
import Ride from "../model/ride.js";
import UserFollow from "../model/userFollow.js";

const canFollowUser = async (followerId, followingId) => {
  if (followerId.toString() === followingId.toString()) {
    return false;
  }

  // 1. Check if follower was a passenger on any completed ride driven by followingId
  const driverRides = await Ride.find({
    ownerId: followingId,
    status: "COMPLETED",
  }).select("_id");

  if (driverRides.length > 0) {
    const driverRideIds = driverRides.map((r) => r._id);
    const bookingExists = await Booking.exists({
      passengerId: followerId,
      rideId: { $in: driverRideIds },
      status: "COMPLETED",
    });
    if (bookingExists) return true;
  }

  // 2. Check if follower was the driver for any completed ride taken by followingId
  const myRides = await Ride.find({
    ownerId: followerId,
    status: "COMPLETED",
  }).select("_id");

  if (myRides.length > 0) {
    const myRideIds = myRides.map((r) => r._id);
    const passengerBookingExists = await Booking.exists({
      passengerId: followingId,
      rideId: { $in: myRideIds },
      status: "COMPLETED",
    });
    if (passengerBookingExists) return true;
  }

  // 3. Check if both users were co-passengers on the same completed ride
  const myPassengerBookings = await Booking.find({
    passengerId: followerId,
    status: "COMPLETED",
  }).select("rideId");

  if (myPassengerBookings.length > 0) {
    const sharedRideIds = myPassengerBookings.map((b) => b.rideId);
    const coPassengerBookingExists = await Booking.exists({
      passengerId: followingId,
      rideId: { $in: sharedRideIds },
      status: "COMPLETED",
    });
    if (coPassengerBookingExists) return true;
  }

  return false;
};

const followUser = async (followerId, followingId) => {
  if (followerId.toString() === followingId.toString()) {
    throw new Error("You cannot follow yourself");
  }

  const allowed = await canFollowUser(followerId, followingId);

  if (!allowed) {
    throw new Error(
      "You can follow this user only after completing a ride together",
    );
  }

  const existingFollow = await UserFollow.findOne({
    followerId,
    followingId,
  });

  if (existingFollow) {
    throw new Error("You are already following this user");
  }

  try {
    await UserFollow.create({
      followerId,
      followingId,
    });
  } catch (error) {
    if (error.code === 11000) {
      throw new Error("You are already following this user");
    }
    throw error;
  }

  const followerCount = await UserFollow.countDocuments({
    followingId,
  });

  return {
    isFollowing: true,
    followerCount,
  };
};

const unfollowUser = async (followerId, followingId) => {
  if (followerId.toString() === followingId.toString()) {
    throw new Error("You cannot unfollow yourself");
  }

  const deletedFollow = await UserFollow.findOneAndDelete({
    followerId,
    followingId,
  });

  if (!deletedFollow) {
    throw new Error("You are not following this user");
  }

  const followerCount = await UserFollow.countDocuments({
    followingId,
  });

  return {
    isFollowing: false,
    followerCount,
  };
};

const getFollowStatus = async (followerId, followingId) => {
  const existingFollow = await UserFollow.exists({
    followerId,
    followingId,
  });

  const followerCount = await UserFollow.countDocuments({
    followingId,
  });

  return {
    isFollowing: !!existingFollow,
    followerCount,
  };
};

const getFollowerCount = async (userId) => {
  return UserFollow.countDocuments({
    followingId: userId,
  });
};

export {
  followUser,
  unfollowUser,
  getFollowStatus,
  getFollowerCount,
  canFollowUser,
};
