const Registration = require("../models/Registration");
const Event = require("../models/Event");
const VolunteerAssignment = require("../models/VolunteerAssignment");
const { v4: uuidv4 } = require("uuid");

// @desc    Register for an event as Attendee
// @route   POST /api/registrations
// @access  Private (Student)
exports.registerForEvent = async (req, res) => {
  try {
    const { eventId } = req.body;
    const userId = req.user.id;

    // 1. Check if event exists and is open for registration
    const event = await Event.findById(eventId);
    if (!event) {
      return res
        .status(404)
        .json({ success: false, message: "Event not found" });
    }

    if (event.status !== "Open") {
      return res.status(400).json({
        success: false,
        message: `Event is not open for registration. Current status: ${event.status}`,
      });
    }

    // 2. Check registration deadline
    if (new Date() > new Date(event.registrationDeadline)) {
      return res.status(400).json({
        success: false,
        message: "Registration deadline has passed",
      });
    }

    // 3. Check if user is already registered (duplicate protection via compound index + pre-check)
    const existingRegistration = await Registration.findOne({
      user: userId,
      event: eventId,
    });
    if (existingRegistration) {
      return res.status(400).json({
        success: false,
        message: "You are already registered for this event",
      });
    }

    // 4. Atomic capacity decrement with conditional check
    //    This prevents race conditions where two users register simultaneously
    //    and both see availableSlots > 0 before either decrements.
    //    The $inc only applies when availableSlots > 0; if it returns 0 docs
    //    modified, capacity was exhausted between our check and the update.
    const updatedEvent = await Event.findOneAndUpdate(
      {
        _id: eventId,
        availableSlots: { $gt: 0 }, // Only proceed if slots are available
      },
      {
        $inc: { availableSlots: -1 }, // Atomically decrement
      },
      { new: true }
    );

    if (!updatedEvent) {
      return res.status(400).json({
        success: false,
        message: "Event is at full capacity. No slots available.",
      });
    }

    // 5. Generate unique check-in token
    const ticketToken = uuidv4();

    // 6. Create registration
    const registration = await Registration.create({
      user: userId,
      event: eventId,
      role: "Attendee",
      ticketToken,
    });

    // 7. If event is now full, update status
    if (updatedEvent.availableSlots === 0) {
      await Event.findByIdAndUpdate(eventId, { status: "Full" });
    }

    // 8. Add event to user's joinedEvents
    const User = require("../models/User");
    await User.findByIdAndUpdate(userId, {
      $addToSet: { joinedEvents: eventId },
    });

    res.status(201).json({ success: true, data: registration });
  } catch (err) {
    // Handle MongoDB duplicate key error (compound index violation)
    if (err.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "You are already registered for this event",
      });
    }
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Sign up as Volunteer for an event
// @route   POST /api/registrations/volunteer
// @access  Private (Student)
exports.volunteerForEvent = async (req, res) => {
  try {
    const { eventId, volunteerAssignmentId } = req.body;
    const userId = req.user.id;

    // Check event exists
    const event = await Event.findById(eventId);
    if (!event) {
      return res
        .status(404)
        .json({ success: false, message: "Event not found" });
    }

    // Check volunteer assignment exists and has capacity
    const assignment = await VolunteerAssignment.findById(
      volunteerAssignmentId
    );
    if (!assignment) {
      return res.status(404).json({
        success: false,
        message: "Volunteer role not found",
      });
    }

    if (assignment.assignedUsers.length >= assignment.slotsNeeded) {
      return res.status(400).json({
        success: false,
        message: "No volunteer slots available for this role",
      });
    }

    // Check if user already volunteered for this event
    const alreadyVolunteered = await Registration.findOne({
      user: userId,
      event: eventId,
      role: "Volunteer",
    });
    if (alreadyVolunteered) {
      return res.status(400).json({
        success: false,
        message: "You are already registered as a volunteer for this event",
      });
    }

    // Generate unique check-in token
    const ticketToken = uuidv4();

    // Create volunteer registration
    const registration = await Registration.create({
      user: userId,
      event: eventId,
      role: "Volunteer",
      ticketToken,
    });

    // Assign user to the volunteer role
    await VolunteerAssignment.findByIdAndUpdate(volunteerAssignmentId, {
      $addToSet: { assignedUsers: userId },
    });

    // Add event to user's joinedEvents
    const User = require("../models/User");
    await User.findByIdAndUpdate(userId, {
      $addToSet: { joinedEvents: eventId },
    });

    res.status(201).json({ success: true, data: registration });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "You are already registered for this event",
      });
    }
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Cancel registration
// @route   DELETE /api/registrations/:eventId
// @access  Private
exports.cancelRegistration = async (req, res) => {
  try {
    const registration = await Registration.findOneAndDelete({
      user: req.user.id,
      event: req.params.eventId,
    });

    if (!registration) {
      return res.status(404).json({
        success: false,
        message: "No registration found to cancel",
      });
    }

    // Restore capacity atomically
    await Event.findByIdAndUpdate(req.params.eventId, {
      $inc: { availableSlots: 1 },
    });

    // If event was Full, reopen it
    const event = await Event.findById(req.params.eventId);
    if (event && event.status === "Full" && event.availableSlots > 0) {
      await Event.findByIdAndUpdate(req.params.eventId, { status: "Open" });
    }

    res.status(200).json({ success: true, data: {} });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Get registrations for an event (Organizer view)
// @route   GET /api/registrations/event/:eventId
// @access  Private (Organizer, Admin)
exports.getEventRegistrations = async (req, res) => {
  try {
    const registrations = await Registration.find({
      event: req.params.eventId,
    }).populate("user", "name email");

    res
      .status(200)
      .json({ success: true, count: registrations.length, data: registrations });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Check in a student (by ticket token or search)
// @route   POST /api/registrations/checkin
// @access  Private (Organizer, Admin)
exports.checkIn = async (req, res) => {
  try {
    const { ticketToken, registrationId } = req.body;

    let registration;

    // Find by ticket token or by registration ID
    if (ticketToken) {
      registration = await Registration.findOne({ ticketToken }).populate(
        "user",
        "name email"
      );
    } else if (registrationId) {
      registration = await Registration.findById(registrationId).populate(
        "user",
        "name email"
      );
    } else {
      return res.status(400).json({
        success: false,
        message: "Please provide a ticket token or registration ID",
      });
    }

    if (!registration) {
      return res
        .status(404)
        .json({ success: false, message: "Registration not found" });
    }

    // One-time check-in: prevent double check-in
    if (registration.checkInStatus) {
      return res.status(400).json({
        success: false,
        message: "This registration has already been checked in",
      });
    }

    registration.checkInStatus = true;
    await registration.save();

    res.status(200).json({ success: true, data: registration });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Get event statistics
// @route   GET /api/registrations/stats/:eventId
// @access  Private (Organizer, Admin)
exports.getEventStats = async (req, res) => {
  try {
    const event = await Event.findById(req.params.eventId);
    if (!event) {
      return res
        .status(404)
        .json({ success: false, message: "Event not found" });
    }

    const totalRegistered = await Registration.countDocuments({
      event: req.params.eventId,
    });

    const totalCheckedIn = await Registration.countDocuments({
      event: req.params.eventId,
      checkInStatus: true,
    });

    res.status(200).json({
      success: true,
      data: {
        totalRegistered,
        totalCheckedIn,
        remainingCapacity: event.availableSlots,
        totalCapacity: event.capacity,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Get user's registrations
// @route   GET /api/registrations/my
// @access  Private
exports.getMyRegistrations = async (req, res) => {
  try {
    const registrations = await Registration.find({ user: req.user.id })
      .populate("event", "title date venue status")
      .sort({ createdAt: -1 });

    res
      .status(200)
      .json({ success: true, count: registrations.length, data: registrations });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
