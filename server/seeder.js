const mongoose = require("mongoose");
const dotenv = require("dotenv");
const User = require("./models/User");
const Event = require("./models/Event");
const VolunteerAssignment = require("./models/VolunteerAssignment");

dotenv.config({ path: "./.env" });

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB Connected for seeding...");

    // Clear existing data
    await User.deleteMany({});
    await Event.deleteMany({});
    await VolunteerAssignment.deleteMany({});

    // Create users
    const admin = await User.create({
      name: "Admin User",
      email: "admin@club.com",
      password: "password123",
      role: "Admin",
    });

    const organizer = await User.create({
      name: "Organizer User",
      email: "organizer@club.com",
      password: "password123",
      role: "Organizer",
    });

    const student = await User.create({
      name: "Student User",
      email: "student@club.com",
      password: "password123",
      role: "Student",
    });

    const student2 = await User.create({
      name: "Jane Doe",
      email: "jane@club.com",
      password: "password123",
      role: "Student",
    });

    console.log("Users created:", { admin, organizer, student, student2 });

    // Create events
    const event1 = await Event.create({
      title: "Web Development Workshop",
      description:
        "Learn modern web development with React and Node.js. Hands-on coding session for all skill levels.",
      date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 1 week from now
      venue: "Computer Lab 101",
      capacity: 30,
      availableSlots: 30,
      registrationDeadline: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
      status: "Open",
      category: "Workshop",
      createdBy: organizer._id,
    });

    const event2 = await Event.create({
      title: "Annual Tech Seminar",
      description:
        "Industry experts share insights on AI, cloud computing, and the future of technology.",
      date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      venue: "Main Auditorium",
      capacity: 200,
      availableSlots: 200,
      registrationDeadline: new Date(Date.now() + 12 * 24 * 60 * 60 * 1000),
      status: "Open",
      category: "Seminar",
      createdBy: organizer._id,
    });

    const event3 = await Event.create({
      title: "Community Cleanup Drive",
      description:
        "Join us for a volunteer event to clean up our campus and local park areas.",
      date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
      venue: "Main Gate - Campus",
      capacity: 50,
      availableSlots: 50,
      registrationDeadline: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
      status: "Open",
      category: "Volunteer",
      createdBy: organizer._id,
    });

    // Create volunteer assignments for cleanup event
    await VolunteerAssignment.create([
      {
        event: event3._id,
        roleName: "Team Leader",
        slotsNeeded: 5,
        assignedUsers: [],
      },
      {
        event: event3._id,
        roleName: "Photographer",
        slotsNeeded: 2,
        assignedUsers: [],
      },
      {
        event: event3._id,
        roleName: "Supply Manager",
        slotsNeeded: 3,
        assignedUsers: [],
      },
    ]);

    console.log("Events and volunteer roles created");
    console.log("\n--- Test Credentials ---");
    console.log("Admin:      admin@club.com / password123");
    console.log("Organizer:  organizer@club.com / password123");
    console.log("Student:    student@club.com / password123");
    console.log("Student 2:  jane@club.com / password123");

    process.exit(0);
  } catch (error) {
    console.error("Seeding error:", error);
    process.exit(1);
  }
};

seedData();
