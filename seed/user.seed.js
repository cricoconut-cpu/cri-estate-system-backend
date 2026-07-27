import dotenv from "dotenv";
import connectDB from "../config/database.js";
import User from "../models/User.js";

dotenv.config();

const seedUsers = async () => {
  try {
    await connectDB();

    // Clear existing users
    await User.deleteMany();

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

  // Estate Managers
  {
    name: "Bandirippuwa Manager",
    email: "cri.bandirippuwaestate@gmail.com",
    password: "Manager123",
    role: "Estate Manager",
  },
  {
    name: "Rathmalagara Manager",
    email: "crirathmalagara@gmail.com",
    password: "Manager123",
    role: "Estate Manager",
  },
  {
    name: "Ambakale Manager",
    email: "agrc.abc.123@gmail.com",
    password: "Manager123",
    role: "Estate Manager",
  },
  {
    name: "Poththukulama Manager",
    email: "poththukulama.cri@gmail.com",
    password: "Manager123",
    role: "Estate Manager",
  },
  {
    name: "Walpita Manager",
    email: "criwalpita@gmail.com",
    password: "Manager123",
    role: "Estate Manager",
  },
  {
    name: "Thabbowa Manager",
    email: "thabbowaresearchcentercri@gmail.com",
    password: "Manager123",
    role: "Estate Manager",
  },
  {
    name: "Middeniya Manager",
    email: "middeniyacri@gmail.com",
    password: "Manager123",
    role: "Estate Manager",
  },
  {
    name: "Makandura Manager",
    email: "makanduragrc@gmail.com",
    password: "Manager123",
    role: "Estate Manager",
  },
  {
    name: "Waligama Manager",
    email: "sanjeewakumaraea@gmail.com",
    password: "Manager123",
    role: "Estate Manager",
  },
  {
    name: "Maduruoya Manager",
    email: "grcmaduruoya@gmail.com",
    password: "Manager123",
    role: "Estate Manager",
  },
  {
    name: "Pallama Manager",
    email: "cripallama123@gmail.com",
    password: "Manager123",
    role: "Estate Manager",
  },
]);
    console.log("Users seeded successfully.");
    process.exit(0);
  } catch (error) {
    console.error("Failed to seed users:", error);
    process.exit(1);
  }
};

seedUsers();