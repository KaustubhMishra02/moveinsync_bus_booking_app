const { validationResult } = require("express-validator");

const HttpError = require("../models/http-error");
const User = require("../models/user");
const Ticket = require("../models/ticket");
const bcrypt = require("bcryptjs");
const Route = require("../models/route");
const Bus = require("../models/bus");

const { DAYS_OF_WEEK } = require("../utils/utils");

const addBus = async (req, res) => {
  const { name, totalSeats, availableDays, routeIds } = req.body;

  try {
    const newBus = new Bus({
      name,
      totalSeats,
      availableDays,
      routes: routeIds, // Assooiate routes with this bus
    });

    await newBus.save();

    res.status(201).json({ message: "Bus added successfully", bus: newBus });
  } catch (error) {
    res.status(500).json({ message: "Error in adding bus", error });
  }
};

const updateBus = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(
      new HttpError(
        "Invalid inputs passed, please ensure correct data is entered.",
        422
      )
    );
  }

  const { name, totalSeats, availableDays, routeIds } = req.body;

  try {
    const bus = await Bus.findByIdAndUpdate(req.params.id, {
      $set: { name, totalSeats, availableDays }, // Specify fields to update
    });

    if (!bus) {
      return res.status(404).json({ message: "Bus not found" });
    }

    // Update new, associated routes if provided
    if (routeIds) {
      const routes = await Route.find({ _id: { $in: routeIds } });
      if (routes.length !== routeIds.length) {
        return res.status(400).json({ message: "Invalid route IDs provided" });
      }
      bus.routes = routes;
      await bus.save();
    }

    res.status(200).json({ message: "Bus updated successfully", bus });
  } catch (error) {
    res.status(500).json({ message: "Error updating bus", error });
  }
};

const deleteBus = async (req, res) => {
  try {
    const bus = await Bus.findByIdAndDelete(req.params.id);

    if (!bus) {
      return res.status(404).json({ message: "Bus not found" });
    }

    // Cancelling (deleting) all tickets related to this bus
    await Ticket.deleteMany({ bus: bus._id }); // Cascade deletion using foreign key reference

    res.status(200).json({ message: "Bus deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting bus", error });
  }
};

exports.addBus = addBus;
exports.updateBus = updateBus;
exports.deleteBus = deleteBus;
