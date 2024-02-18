const mongoose = require("mongoose");
const { DAYS_OF_WEEK } = require("../utils/utils");

const busSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
  },
  totalSeats: {
    type: Number,
    required: true,
    min: 1,
  },
  currentOccupancy: {
    type: Number,
    default: 0,
    min: 0,
    max: 20,
  },
  availableDays: {
    type: [String],
    required: true,
    enum: DAYS_OF_WEEK,
  },
  estimatedTimeofArrival: {
    type: String,
  },
  estimatedTimeofDeparture: {
    type: String,
  },
  routes: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Route",
    },
  ],
});

module.exports = mongoose.model("Bus", busSchema);
