import Booking from "../model/bookings.js";
import Review from "../model/reviews.js";
import User from "../model/user.js";

const createReview = async (req, res) => {
  try {
    const reviewerId = req.user._id;
    const { bookingId, rating, review } = req.body;

    if (!bookingId || rating === undefined) {
      return res.status(400).json({
        success: false,
        message: "Booking ID and rating are required",
      });
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: "Rating must be between  1 and 5",
      });
    }
    const booking = await Booking.findById(bookingId).populate({
      path: "rideId",
      select: "ownerId status",
    });

    if (!booking) {
      return res.status(400).json({
        success: false,
        message: "Booking not found",
      });
    }
    if (!booking.rideId) {
      return res.status(400).json({
        success: false,
        message: "Ride not found",
      });
    }

    if (
      booking.status !== "COMPLETED" ||
      booking.rideId.status !== "COMPLETED"
    ) {
      return res.status(400).json({
        success: false,
        message: "Review is available only after the ride is completed",
      });
    }

    const driverId = booking.rideId.ownerId;
    const passengerId = booking.passengerId;

    let revieweeId;

    if (reviewerId.equals(passengerId)) {
      revieweeId = driverId;
    } else if (reviewerId.equals(driverId)) {
      revieweeId = passengerId;
    } else {
      return res.status(403).json({
        success: false,
        message: "You are not a participant of this ride",
      });
    }

    if (reviewerId.equals(revieweeId)) {
      return res.status(400).json({
        success: false,
        message: "You cannot review yourself",
      });
    }

    const existingReview = await Review.findOne({
      bookingId,
      reviewerId,
      revieweeId,
    });

    if (existingReview) {
      return res.status(409).json({
        success: false,
        message: "You have already reviewed this ride",
      });
    }
    const reviewee = await User.findById(revieweeId);

    if (!reviewee) {
      return res.status(404).json({
        success: false,
        message: "Reviewee not found",
      });
    }

    const newReview = await Review.create({
      bookingId,
      reviewerId,
      revieweeId,
      rating,
      review: review || "",
    });
    const newRatingCount = reviewee.ratingCount + 1;

    const newAverageRating =
      (reviewee.averageRating * reviewee.ratingCount + rating) / newRatingCount;

    reviewee.ratingCount = newRatingCount;
    reviewee.averageRating = Number(newAverageRating.toFixed(1));

    await reviewee.save();

    return res.status(201).json({
      success: true,
      message: "Review submitted successfully",
      review: newReview,
    });
  } catch (error) {
    console.error("Create Review Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to submit review",
    });
  }
};

const getUserReviews = async (req, res) => {
  try {
    const { userId } = req.params;

    const reviews = await Review.find({
      revieweeId: userId,
    })
      .populate("reviewerId", "firstName lastName profileImage")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      message: "Reviews fetched successfully",
      reviews,
    });
  } catch (error) {
    console.error("Get User Reviews Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch reviews",
    });
  }
};

const getBookingReviewStatus = async (req, res) => {
  try {
    const userId = req.user._id;
    const { bookingId } = req.params;

    const booking = await Booking.findById(bookingId).populate({
      path: "rideId",
      select: "ownerId status",
    });

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    if (
      booking.status !== "COMPLETED" ||
      booking.rideId?.status !== "COMPLETED"
    ) {
      return res.status(200).json({
        success: true,
        canReview: false,
        hasReviewed: false,
        review: null,
        message: "Review is available after the ride is completed",
      });
    }

    const driverId = booking.rideId.ownerId;
    const passengerId = booking.passengerId;

    let revieweeId = null;

    if (userId.equals(passengerId)) {
      revieweeId = driverId;
    } else if (userId.equals(driverId)) {
      revieweeId = passengerId;
    } else {
      return res.status(403).json({
        success: false,
        message: "You are not a participant of this ride",
      });
    }

    const existingReview = await Review.findOne({
      bookingId,
      reviewerId: userId,
      revieweeId,
    }).populate("revieweeId", "firstName lastName profileImage averageRating");

    return res.status(200).json({
      success: true,
      canReview: !existingReview,
      hasReviewed: !!existingReview,
      review: existingReview,
      reviewee: existingReview?.revieweeId || null,
    });
  } catch (error) {
    console.error("Get Booking Review Status Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to get review status",
    });
  }
};
export { createReview, getUserReviews, getBookingReviewStatus };
