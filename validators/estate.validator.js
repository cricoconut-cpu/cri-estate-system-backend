import mongoose from "mongoose";

export const validateEstateId = (req, res, next) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({
      success: false,
      message: "Invalid estate ID.",
    });
  }

  next();
};