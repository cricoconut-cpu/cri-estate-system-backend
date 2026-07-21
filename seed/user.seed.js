import dotenv from "dotenv";
import connectDB from "../config/database.js";
import User from "../models/User.js";

dotenv.config();

const seedUsers = async () => {
  try {
    await connectDB();

    // Clear existing users to prevent duplicates during testing
    await User.deleteMany();

    // Create all required users
    await User.create([
      {
        name: "System Admin",
        email: "admin@cri.lk",
        password: "Admin123",
        role: "Admin",
      },
      {
        name: "System Analyst",
        email: "analyst@cri.lk",
        password: "Analyst123",
        role: "Analyst",
      },
      {
        name: "Ratmalagara Manager",
        email: "ratmalagara.manager@cri.lk",
        password: "Manager123",
        role: "Estate Manager", 
      },
      {
        name: "Bandirippuwa Manager",
        email: "bandirippuwa.manager@cri.lk",
        password: "Manager123",
        role: "Estate Manager",
      }
    ]);

    console.log("Users Seeded Successfully");
    process.exit(0);
  } catch (error) {
    console.error("Failed to seed users:", error);
    process.exit(1);
  }
};

seedUsers();