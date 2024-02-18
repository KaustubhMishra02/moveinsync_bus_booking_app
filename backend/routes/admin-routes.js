const express = require("express");
const { check } = require("express-validator");

const adminControllers = require("../controllers/admin-controllers");
const checkAuthAdmin = require("../middleware/check-auth-admin");

const router = express.Router();

//router.use(checkAuthAdmin);

router.post("/buses", adminControllers.addBus);

router.patch("/buses/:id", adminControllers.updateBus);

router.delete("/buses/:id", adminControllers.deleteBus);

module.exports = router;
