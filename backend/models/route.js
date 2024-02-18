const mongoose = require("mongoose");
const { DAYS_OF_WEEK } = require("../utils/utils");

const RouteSchema = new mongoose.Schema({
  origin: {
    type: String,
    required: true,
  },
  destination: {
    type: String,
    required: true,
  },
  distance: {
    type: Number,
  },
  estimatedTravelTime: {
    type: Number,
  },
  daysOfOperation: {
    type: [String],
    required: true,
    enum: DAYS_OF_WEEK,
  },
  price: {
    type: Number,
  },
});

module.exports = mongoose.model("Route", RouteSchema);
