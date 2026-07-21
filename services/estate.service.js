import Estate from "../models/Estate.js";

export const getAllEstates = async (user) => {
  // Admin and Analyst can view all estates
  if (user.role === "Admin" || user.role === "Analyst") {
    return await Estate.find()
      .populate("manager", "name email")
      .sort({ name: 1 });
  }

  // Estate Manager can only view their assigned estate
  if (user.role === "Estate Manager") {
    return await Estate.find({
      _id: user.assignedEstate,
    }).populate("manager", "name email");
  }

  throw new Error("Unauthorized access.");
};

export const getEstateById = async (estateId, user) => {
  const estate = await Estate.findById(estateId).populate(
    "manager",
    "name email"
  );

  if (!estate) {
    throw new Error("Estate not found.");
  }

  // Admin and Analyst can access any estate
  if (user.role === "Admin" || user.role === "Analyst") {
    return estate;
  }

  // Estate Manager can only access their own estate
  if (
    user.role === "Estate Manager" &&
    user.assignedEstate?.toString() === estate._id.toString()
  ) {
    return estate;
  }

  throw new Error("You are not authorized to access this estate.");
};