require("dotenv").config({ path: require("path").resolve(__dirname, "../.env") });

const mongoose = require("mongoose");

const User = require("../models/User");

const connectDB = require("../config/database");

const seedUsers = async () => {
  try {
    await connectDB();

    await User.deleteMany();

    await User.create({
      name: "System Admin",
      email: "admin@cri.lk",
      password: "Admin123",
      role: "Admin",
    });

    await User.create({
      name: "System Analyst",
      email: "analyst@cri.lk",
      password: "Analyst123",
      role: "Analyst",
    });

    console.log("Users Seeded");

    process.exit();
  } catch (error) {
    console.error(error);

    process.exit(1);
  }
};

seedUsers();
