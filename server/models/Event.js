const mongoose = require("mongoose");

const EventSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Please add a title"],
      trim: true,
      maxlength: [100, "Title cannot be more than 100 characters"],
    },
    description: {
      type: String,
      required: [true, "Please add a description"],
      maxlength: [2000, "Description cannot be more than 2000 characters"],
    },
    date: {
      type: Date,
      required: [true, "Please add an event date"],
    },
    venue: {
      type: String,
      required: [true, "Please add a venue"],
    },
    capacity: {
      type: Number,
      required: [true, "Please add capacity"],
      min: [1, "Capacity must be at least 1"],
    },
    // Tracks remaining slots; decremented atomically on registration
    availableSlots: {
      type: Number,
      required: true,
    },
    registrationDeadline: {
      type: Date,
      required: [true, "Please add a registration deadline"],
    },
    status: {
      type: String,
      enum: ["Draft", "Open", "Full", "Closed", "Completed"],
      default: "Draft",
    },
    category: {
      type: String,
      enum: ["Workshop", "Seminar", "Social", "Volunteer", "Sports", "Other"],
      default: "Other",
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

// Virtual: check if registration is still allowed
EventSchema.virtual("isRegistrationOpen").get(function () {
  const now = new Date();
  return (
    this.status === "Open" &&
    this.availableSlots > 0 &&
    now <= this.registrationDeadline
  );
});

// Ensure virtuals are included in JSON output
EventSchema.set("toJSON", { virtuals: true });
EventSchema.set("toObject", { virtuals: true });

module.exports = mongoose.model("Event", EventSchema);
