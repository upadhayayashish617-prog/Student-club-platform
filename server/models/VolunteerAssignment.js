const mongoose = require("mongoose");

const VolunteerAssignmentSchema = new mongoose.Schema(
  {
    event: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Event",
      required: true,
    },
    roleName: {
      type: String,
      required: [true, "Please add a role name"],
      trim: true,
    },
    slotsNeeded: {
      type: Number,
      required: true,
      min: 1,
    },
    assignedUsers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
  },
  { timestamps: true }
);

// Virtual: remaining volunteer slots
VolunteerAssignmentSchema.virtual("availableSlots").get(function () {
  return this.slotsNeeded - this.assignedUsers.length;
});

VolunteerAssignmentSchema.set("toJSON", { virtuals: true });
VolunteerAssignmentSchema.set("toObject", { virtuals: true });

module.exports = mongoose.model("VolunteerAssignment", VolunteerAssignmentSchema);
