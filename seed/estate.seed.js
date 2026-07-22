import dotenv from "dotenv";
import connectDB from "../config/database.js";
import Estate from "../models/Estate.js";
import User from "../models/User.js";

dotenv.config();

const estates = [
  {
    estateCode: "RATM",
    name: "Ratmalagara Estate",
    district: "Kurunegala",
    area: "487 ha",
    established: 1942,

    // Used only during seeding
    managerEmail: "ratmalagara.manager@cri.lk",

    phoneNumber: "+94 37 2234567",
    coverImage: null,
    status: "active",
  },
  {
    estateCode: "BAND",
    name: "Bandirippuwa Estate",
    district: "Puttalam",
    area: "320 ha",
    established: 1955,

    managerEmail: "bandirippuwa.manager@cri.lk",

    phoneNumber: "+94 32 2256789",
    coverImage: null,
    status: "active",
  },
];

const seedEstates = async () => {
  try {
    await connectDB();

    // Clear existing estates (Development only)
    await Estate.deleteMany();

    for (const estate of estates) {
      // Find the manager
      const manager = await User.findOne({
        email: estate.managerEmail,
      });

      if (!manager) {
        console.log(
          `Manager '${estate.managerEmail}' not found. Skipping ${estate.name}.`
        );
        continue;
      }

      // Create estate
      const createdEstate = await Estate.create({
        estateCode: estate.estateCode,
        name: estate.name,
        district: estate.district,
        area: estate.area,
        established: estate.established,
        manager: manager._id,
        phoneNumber: estate.phoneNumber,
        coverImage: estate.coverImage,
        status: estate.status,
      });

      // Assign estate to the manager
      manager.assignedEstate = createdEstate._id;
      await manager.save();

      console.log(`${estate.name} seeded successfully.`);
    }

    console.log("Estate seeding completed.");
    process.exit(0);
  } catch (error) {
    console.error("Estate seeding failed:", error);
    process.exit(1);
  }
};

seedEstates();