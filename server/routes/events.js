const express = require("express");
const router = express.Router();
const {
  createEvent,
  getEvents,
  getEvent,
  updateEvent,
  deleteEvent,
  getOrganizerEvents,
} = require("../controllers/eventController");
const { protect, authorize } = require("../middleware/auth");

// Public routes
router.get("/", getEvents);
router.get("/:id", getEvent);

// Protected: Organizer/Admin only
router.post("/", protect, authorize("Organizer", "Admin"), createEvent);
router.put("/:id", protect, authorize("Organizer", "Admin"), updateEvent);
router.delete("/:id", protect, authorize("Organizer", "Admin"), deleteEvent);
router.get(
  "/organizer/mine",
  protect,
  authorize("Organizer", "Admin"),
  getOrganizerEvents
);

module.exports = router;
