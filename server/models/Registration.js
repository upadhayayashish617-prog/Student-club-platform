const mongoose = require("mongoose");

const RegistrationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    event: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Event",
      required: true,
    },
    role: {
      type: String,
      enum: ["Attendee", "Volunteer"],
      default: "Attendee",
    },
    checkInStatus: {
      type: Boolean,
      default: false,
    },
    // Unique token for check-in / QR code generation
    ticketToken: {
      type: String,
      unique: true,
    },
  },
  { timestamps: true }
);

// Compound unique index: prevents duplicate registrations per user+event
RegistrationSchema.index({ user: 1, event: 1 }, { unique: true });

module.exports = mongoose.model("Registration", RegistrationSchema);
