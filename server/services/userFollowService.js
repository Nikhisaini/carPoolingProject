import Booking from "../model/bookings.js";
import Ride from "../model/ride.js";
import UserFollow from "../model/userFollow.js";

const canFollowUser = async (followerId, followingId) => {
  if (followerId.toString() === followingId.toString()) {
    return false;
  }

  const passengerBooking = await Booking.findOne({
    passengerId: followerId,
    status: "COMPLETED",
  })
    .populate({
      path: "rideId",
      match: {
        ownerId: followingId,
        status: "COMPLETED",
      },
      select: "_id",
    })
    .lean();

  if (passengerBooking?.rideId) {
    return true;
  }

  const driverRide = await Ride.findOne({
    ownerId: followerId,
    status: "COMPLETED",
  })
    .select("_id")
    .lean();

  if (!driverRide) {
    return false;
  }

  const completedBooking = await Booking.findOne({
    passengerId: followingId,
    status: "COMPLETED",
  })
    .populate({
      path: "rideId",
      match: {
        _id: {
          $in: [driverRide._id],
        },
        ownerId: followerId,
        status: "COMPLETED",
      },
      select: "_id",
    })
    .lean();

  return !!completedBooking?.rideId;
};

const followUser = async (followerId, followingId) => {
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

  await UserFollow.create({
    followerId,
    followingId,
  });

  const followerCount = await UserFollow.countDocuments({
    followingId,
  });

  return {
    isFollowing: true,
    followerCount,
  };
};

const unfollowUser = async (followerId, followingId) => {
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

export { followUser, unfollowUser, getFollowStatus, getFollowerCount };
