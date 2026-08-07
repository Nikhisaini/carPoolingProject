import mongoose from "mongoose";

const rideSchema = new mongoose.Schema({
  driverId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  vehicleId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Vehicle",
    required: true,
  },
  fromCity: {
    type: String,
    required: true,
    trim: true,
  },
  toCity: {
    type: String,
    required: true,
    trim: true,
  },
  pickupLocation: {
    type: String,
    required: true,
    trim: true,
  },
  dropLocation: {
    type: String,
    required: true,
    trim: true,
  },
  departureDate: {
    type: Date,
    required: true,
  },
  departureTime: {
    type: String,
    required: true,
  },
  estimatedArrivalTime: {
    type: String,
  },
  totalSeats: {
    type: Number,
    required: true,
    min: 1,
  },
  availableSeats: {
    type: Number,
    required: true,
    min: 0,
  },
  pricePerSeat: {
    type: Number,
    required: true,
    min: 0,
  },
  preference: {
    petsAllowed: {
      type: Boolean,
      default: false,
    },
    luggageAllowed: {
      type: Boolean,
      default: false,
    },
  },
  description: {
    type: String,
    default: "",
  },
  status: {
    type: String,
    enum: ["Upcoming", "Ongoing", "Completed", "Cancelled"],
    default: "Upcoming",
  },
  isPublished: {
    type: Boolean,
    default: true,
  },
});
const Rides = mongoose.model("Rides", rideSchema);
export default Rides;
