import mongoose from "mongoose";
import {
  followUser,
  getFollowerCount,
  getFollowStatus,
  unfollowUser,
} from "../services/userFollowService.js";

const follow = async (req, res) => {
  try {
    const followerId = req.user._id;
    const { userId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid user ID",
      });
    }

    const result = await followUser(followerId, userId);

    return res.status(200).json({
      success: true,
      message: "User followed successfully",
      ...result,
    });
  } catch (error) {
    console.error("Follow User Error:", error);

    return res.status(400).json({
      success: false,
      message: error.message || "Failed to follow user",
    });
  }
};

const unfollow = async (req, res) => {
  try {
    const followerId = req.user._id;
    const { userId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid user ID",
      });
    }

    const result = await unfollowUser(followerId, userId);

    return res.status(200).json({
      success: true,
      message: "User unfollowed successfully",
      ...result,
    });
  } catch (error) {
    console.error("Unfollow User Error:", error);

    return res.status(400).json({
      success: false,
      message: error.message || "Failed to unfollow user",
    });
  }
};

const getStatus = async (req, res) => {
  try {
    const followerId = req.user._id;
    const { userId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid user ID",
      });
    }

    const result = await getFollowStatus(followerId, userId);

    return res.status(200).json({
      success: true,
      ...result,
    });
  } catch (error) {
    console.error("Get Follow Status Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to get follow status",
    });
  }
};

const getCount = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid user ID",
      });
    }

    const followerCount = await getFollowerCount(userId);

    return res.status(200).json({
      success: true,
      followerCount,
    });
  } catch (error) {
    console.error("Get Follower Count Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to get follower count",
    });
  }
};

export { follow, unfollow, getStatus, getCount };
