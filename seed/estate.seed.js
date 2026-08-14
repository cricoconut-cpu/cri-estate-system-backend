import dotenv from "dotenv";
import connectDB from "../config/database.js";
import Estate from "../models/Estate.js";
import User from "../models/User.js";

dotenv.config();

const estates = [
  {
    estateCode: "1",
    name: "Bandirippuwa Research Center",
    district: "Puttalam",
    area: "145.75 ha",
    established: 1929,
    managerEmail: "cri.bandirippuwaestate@gmail.com",
    phoneNumber: "031-2257419",
    coverImage: null,
    status: "active"
  },
  {
    estateCode: "2",
    name: "Rathmaragara Research Center",
    district: "Kurunegala",
    area: "101.62 ha",
    established: 1926,
    managerEmail: "crirathmalagara@gmail.com",
    phoneNumber: "032-2240084",
    coverImage: null,
    status: "active"
  },
  {
    estateCode: "3",
    name: "Ambakale Genetic Resources Center",
    district: "Puttalam",
    area: "475.83 ha",
    established: 1955,
    managerEmail: "agrc.abc.123@gmail.com",
    phoneNumber: "032-5779408",
    coverImage: null,
    status: "active"
  },
  {
    estateCode: "4",
    name: "Poththukulama Research Center",
    district: "Puttalam",
    area: "81.64 ha",
    established: 1970,
    managerEmail: "poththukulama.cri@gmail.com",
    phoneNumber: "031-3319993",
    coverImage: null,
    status: "active"
  },
  {
    estateCode: "5",
    name: "Walpita Research Center",
    district: "Gampaha",
    area: "17.81 ha",
    established: 1935,
    managerEmail: "criwalpita@gmail.com",
    phoneNumber: "033-2272870",
    coverImage: null,
    status: "active"
  },
  {
    estateCode: "6",
    name: "Thabbowa Research Center",
    district: "Puttalam",
    area: "2.82 ha",
    established: 0,   // Established year is not provided in the original data
    managerEmail: "thabbowaresearchcentercri@gmail.com",
    phoneNumber: "032-2051430",
    coverImage: null,
    status: "active"
  },
  {
    estateCode: "7",
    name: "Middeniya Research Center",
    district: "Hambantota",
    area: "30.57 ha",
    established: 2008,
    managerEmail: "middeniyacri@gmail.com",
    phoneNumber: "047-3624646",
    coverImage: null,
    status: "active"
  },
  {
    estateCode: "8",
    name: "Makadura Genetic Resources Center",
    district: "Kurunegala",
    area: "58.68 ha",
    established: 1984,
    managerEmail: "makanduragrc@gmail.com",
    phoneNumber: "031-2299139",
    coverImage: null,
    status: "active"
  },
  {
    estateCode: "9",
    name: "Waligama Genetic Resources Center",
    district: "Matara",
    area: "6.89 ha",
    established: 2016,
    managerEmail: "sanjeewakumaraea@gmail.com",
    phoneNumber: "041-2252336",
    coverImage: null,
    status: "active"
  },
  {
    estateCode: "10",
    name: "Maduruoya Genetic Resources Center",
    district: "Polonnaruwa",
    area: "86.64 ha",
    established: 1984,
    managerEmail: "grcmaduruoya@gmail.com",
    phoneNumber: "027-3279344",
    coverImage: null,
    status: "active"
  },
  {
    estateCode: "11",
    name: "Pallama Genetic Resources Center",
    district: "Puttalam",
    area: "263.72 ha",
    established: 1998,
    managerEmail: "cripallama123@gmail.com",
    phoneNumber: "032-3329720",
    coverImage: null,
    status: "active"
  }
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