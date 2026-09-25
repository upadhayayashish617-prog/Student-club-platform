const Event = require("../models/Event");
const VolunteerAssignment = require("../models/VolunteerAssignment");

// @desc    Create a new event
// @route   POST /api/events
// @access  Private (Organizer, Admin)
exports.createEvent = async (req, res) => {
  try {
    // Set createdBy to the logged-in user
    req.body.createdBy = req.user.id;
    // Initialize availableSlots equal to capacity
    req.body.availableSlots = req.body.capacity;

    // Auto-set status to Open if date is in the future
    if (new Date(req.body.date) > new Date()) {
      req.body.status = "Open";
    }

    const event = await Event.create(req.body);

    // If volunteerRoles are provided, create volunteer assignments
    if (req.body.volunteerRoles && req.body.volunteerRoles.length > 0) {
      const assignments = req.body.volunteerRoles.map((vr) => ({
        event: event._id,
        roleName: vr.roleName,
        slotsNeeded: vr.slotsNeeded,
        assignedUsers: [],
      }));
      await VolunteerAssignment.insertMany(assignments);
    }

    res.status(201).json({ success: true, data: event });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Get all events (with optional filters)
// @route   GET /api/events
// @access  Public
exports.getEvents = async (req, res) => {
  try {
    let query = {};

    // Filter by status
    if (req.query.status) {
      query.status = req.query.status;
    }

    // Filter by category
    if (req.query.category) {
      query.category = req.query.category;
    }

    // Search by title (case-insensitive partial match)
    if (req.query.search) {
      query.title = { $regex: req.query.search, $options: "i" };
    }

    // Filter by date range
    if (req.query.fromDate) {
      query.date = { ...query.date, $gte: new Date(req.query.fromDate) };
    }
    if (req.query.toDate) {
      query.date = { ...query.date, $lte: new Date(req.query.toDate) };
    }

    const events = await Event.find(query)
      .populate("createdBy", "name email")
      .sort({ date: 1 });

    res.status(200).json({ success: true, count: events.length, data: events });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Get single event
// @route   GET /api/events/:id
// @access  Public
exports.getEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id).populate(
      "createdBy",
      "name email"
    );

    if (!event) {
      return res
        .status(404)
        .json({ success: false, message: "Event not found" });
    }

    // Get volunteer assignments for this event
    const volunteerAssignments = await VolunteerAssignment.find({
      event: event._id,
    }).populate("assignedUsers", "name email");

    res.status(200).json({
      success: true,
      data: { ...event.toObject(), volunteerAssignments },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Update event
// @route   PUT /api/events/:id
// @access  Private (Organizer who created it, Admin)
exports.updateEvent = async (req, res) => {
  try {
    let event = await Event.findById(req.params.id);

    if (!event) {
      return res
        .status(404)
        .json({ success: false, message: "Event not found" });
    }

    // Only creator or admin can update
    if (
      event.createdBy.toString() !== req.user.id &&
      req.user.role !== "Admin"
    ) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to update this event",
      });
    }

    event = await Event.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({ success: true, data: event });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Delete event
// @route   DELETE /api/events/:id
// @access  Private (Organizer who created it, Admin)
exports.deleteEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res
        .status(404)
        .json({ success: false, message: "Event not found" });
    }

    if (
      event.createdBy.toString() !== req.user.id &&
      req.user.role !== "Admin"
    ) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to delete this event",
      });
    }

    await Event.findByIdAndDelete(req.params.id);
    // Clean up associated volunteer assignments
    await VolunteerAssignment.deleteMany({ event: req.params.id });

    res.status(200).json({ success: true, data: {} });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Get events created by the logged-in organizer
// @route   GET /api/events/organizer/mine
// @access  Private (Organizer)
exports.getOrganizerEvents = async (req, res) => {
  try {
    const events = await Event.find({ createdBy: req.user.id }).sort({
      date: 1,
    });
    res
      .status(200)
      .json({ success: true, count: events.length, data: events });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
