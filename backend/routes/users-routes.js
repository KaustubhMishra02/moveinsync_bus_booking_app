const express = require("express");
const { check } = require("express-validator");

const userControllers = require("../controllers/user-controllers");
const checkAuthUser = require("../middleware/check-auth-user");

const router = express.Router();

router.post("/api/users/signup", userControllers.signup);

router.post("/api/users/login", userControllers.login);

router.post("/api/buses", userControllers.browseBuses);

router.post("/api/buses/availability", userControllers.checkSeatAvailability);

router.post("/api/users/bookings", userControllers.bookSeat);

module.exports = router;
