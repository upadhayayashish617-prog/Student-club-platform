const express = require("express");
const router = express.Router();
const {
  registerForEvent,
  volunteerForEvent,
  cancelRegistration,
  getEventRegistrations,
  checkIn,
  getEventStats,
  getMyRegistrations,
} = require("../controllers/registrationController");
const { protect, authorize } = require("../middleware/auth");

// Student routes
router.post("/", protect, registerForEvent);
router.post("/volunteer", protect, volunteerForEvent);
router.delete("/:eventId", protect, cancelRegistration);
router.get("/my", protect, getMyRegistrations);

// Organizer/Admin routes
router.get(
  "/event/:eventId",
  protect,
  authorize("Organizer", "Admin"),
  getEventRegistrations
);
router.post(
  "/checkin",
  protect,
  authorize("Organizer", "Admin"),
  checkIn
);
router.get(
  "/stats/:eventId",
  protect,
  authorize("Organizer", "Admin"),
  getEventStats
);

module.exports = router;
