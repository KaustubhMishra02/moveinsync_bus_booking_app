const { validationResult } = require("express-validator");

const HttpError = require("../models/http-error");
const User = require("../models/user");
const Ticket = require("../models/ticket");
const bcrypt = require("bcrypt");
const Route = require("../models/route");
const Bus = require("../models/bus");
const mongoose = require("mongoose");
const jwt = require('jsonwebtoken');

const {
  DAYS_OF_WEEK,
  SECRET_KEY,
  ADMIN_EMAIL,
  ADMIN_PASSWORD,
} = require("../utils/utils");

const signup = async (req, res, next) => {
  const { name, email, password } = req.body;

  let existingUser;
  try {
    existingUser = await User.findOne({ email: email });
  } catch (err) {
    const error = new HttpError(
      "Signing up failed, please try again later.",
      500
    );
    return next(error);
  }

  if (existingUser) {
    const error = new HttpError(
      "User exists already, please login instead.",
      409
    );
    return next(error);
  }

  let hashedPassword;
  try {
    hashedPassword = await bcrypt.hash(password, 12);
  } catch (err) {
    const error = new HttpError(
      "Could not create user, please try again.",
      500
    );
    return next(error);
  }

  const createdUser = new User({
    name,
    email,
    passwordHash: hashedPassword,
    bookedTickets: [],
  });

  try {
    await createdUser.save();
  } catch (err) {
    const error = new HttpError(
      "User creation failed, please try again later.",
      500
    );
    return next(error);
  }

  let token;
  try {
    token = jwt.sign(
      { userId: createdUser.id, email: createdUser.email },
      SECRET_KEY,
      { expiresIn: "1h" }
    );
  } catch (err) {
    const error = new HttpError(
      "Signing up failed, please try again later.",
      500
    );
    return next(error);
  }

  res
    .status(201)
    .json({ userId: createdUser.id, email: createdUser.email, token: token });
};

const login = async (req, res, next) => {
  const { email, password } = req.body;
  let token;

  if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
    try {
      token = jwt.sign(
        { userId: existingUser.id, email: existingUser.email, admin: true },
        SECRET_KEY,
        { expiresIn: "1h" }
      );
    } catch (err) {
      const error = new HttpError(
        "Logging in failed, please try again later.",
        500
      );
      return next(error);
    }
  }

  let existingUser;

  try {
    existingUser = await User.findOne({ email: email });
  } catch (err) {
    const error = new HttpError(
      "Logging in failed, please try again later.",
      500
    );
    return next(error);
  }

  if (!existingUser) {
    const error = new HttpError(
      "Invalid credentials, could not log you in.",
      403
    );
    return next(error);
  }

  let isValidPassword = false;
  try {
    isValidPassword = await bcrypt.compare(password, existingUser.passwordHash);
  } catch (err) {
    const error = new HttpError(
      "Could not log you in, please check your credentials and try again.",
      500
    );
    return next(error);
  }

  if (!isValidPassword) {
    const error = new HttpError(
      "Invalid credentials, could not log you in.",
      403
    );
    return next(error);
  }

  try {
    token = jwt.sign(
      { userId: existingUser.id, email: existingUser.email },
      'supersecret_dont_share',
      { expiresIn: '1h' }
    );
  } catch (err) {
    const error = new HttpError(
      'Logging in failed, please try again later.',
      500
    );
    return next(error);
  }

  res.json({
    userId: existingUser.id,
    email: existingUser.email,
    token:token
  });
};

const browseBuses = async (req, res) => {
  const { source, destination, date } = req.body;
  try {
    const date_object = new Date(date);
    const matchingRoutes = await Route.find({
      origin: source,
      destination: destination,
      daysOfOperation: DAYS_OF_WEEK[date_object.getDay()],
    });

    const givenDay = DAYS_OF_WEEK[date_object.getDay()];
    const availableBuses = await Bus.aggregate([
      {
        $match: {
          routes: { $in: matchingRoutes.map((route) => route._id) }, // Filter by matching routes
        },
      },
    ]);

    res.status(200).json({ message: "Available buses found", availableBuses });
  } catch (error) {
    res.status(500).json({ message: "Error finding available buses", error });
  }
};

const checkSeatAvailability = async (req, res) => {
  const { busId, date } = req.body;
  try {
    const bus = await Bus.findById(busId);
    if (!bus) {
      return res.status(404).json({ message: "Bus not found" });
    }

    const bookedSeats = await Ticket.aggregate([
      {
        $match: {
          bus: busId,
          date: new Date(date),
        },
      },
      {
        $project: {
          seatNumber: 1, //retrieve only this field
        },
      },
    ]);

    const availableSeats = Array.from(
      //create array containing all possible seat numbers
      { length: bus.totalSeats },
      (_, i) => i + 1
    ).filter(
      (seat) =>
        !bookedSeats.some((bookedSeat) => bookedSeat.seatNumber === seat) //checks if matching seat number not found
    );

    res
      .status(200)
      .json({ message: "Seat availability checked", availableSeats });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error checking seat availability", error });
  }
};

const bookSeat = async (req, res, next) => {
  const { busId, seatNumber, date, userId } = req.body;
  const user=req.user;

  try {
    const bus = await Bus.findById(busId);
    if (!bus) {
      return res.status(404).json({ message: "Bus not found" });
    }

    if (seatNumber < 1 || seatNumber > bus.totalSeats) {
      return res.status(400).json({ message: "Invalid seat number" });
    }

    const isAvailable =
      (await Ticket.countDocuments({
        bus: busId,
        seatNumber,
        date: new Date(date), // Match exact date
      })) === 0;

    if (!isAvailable) {
      return res.status(409).json({ message: "Seat already booked" });
    }
    
    // Create new ticket document:
    const newTicket = new Ticket({
      user: userId,
      bus: busId,
      seatNumber,
      date: new Date(date),
    });

    try {
      await newTicket.save();
      user.bookedTickets.push(newTicket);
      await user.save();
      //Updating bus occupancy
      if (bus.currentOccupancy < bus.totalSeats) {
        await Bus.findByIdAndUpdate(busId, {
          $inc: { currentOccupancy: 1 },
        });
      }
    } catch (err) {
      const error = new HttpError(
        "Booking seat failed, please try again later",
        500
      );
      return next(error);
    }
    res
      .status(201)
      .json({ message: "Seat booked successfully", ticket: newTicket });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error enountered in booking seat", error });
  }
};

const cancelSeatBooking = async (req, res) => {
  const { ticketId } = req.body;

  try {
    // Find the ticket document and ensure current user owns it:
    const ticket = await Ticket.findById(ticketId).populate("user");
    if (!ticket) {
      return res.status(404).json({ message: "Ticket not found" });
    }

    if (ticket.user.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ message: "Unauthorized to cancel this booking" });
    }

    // Check if any trips have already happened, preventing cancellation for departed buses
    const today = new Date();
    if (ticket.date < today) {
      return res.status(400).json({
        message: "Cannot cancel ticket for a trip that has already happened",
      });
    }

    // Perform ticket deletion:
    try {
      const sess = await mongoose.startSession();
      sess.startTransaction();
      await Ticket.findByIdAndDelete(ticketId, { session: sess });
      ticket.user.bookedTickets.pull(ticket);
      await ticket.user.save();
      //Update bus occupancy
      if (ticket.bus) {
        const bus = await Bus.findById(ticket.bus);
        if (bus && bus.currentOccupancy > 0) {
          await Bus.findByIdAndUpdate(bus._id, {
            $inc: { currentOccupancy: -1 },
            session: sess,
          });
        }
      }
      await sess.commitTransaction();
    } catch (err) {
      const error = new HttpError(
        "Deleting ticket failed, please try again later",
        500
      );
      return next(error);
    }
    res.status(200).json({ message: "Seat booking cancelled successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error cancelling seat booking", error });
  }
};

exports.signup = signup;
exports.login = login;
exports.browseBuses = browseBuses;
exports.checkSeatAvailability = checkSeatAvailability;
exports.bookSeat = bookSeat;
exports.cancelSeatBooking = cancelSeatBooking;
