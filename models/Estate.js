import mongoose from "mongoose";

const estateSchema = new mongoose.Schema(
  {
    estateCode: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      uppercase: true,
    },

    name: {
      type: String,
      required: true,
      trim: true,
    },

    district: {
      type: String,
      required: true,
      trim: true,
    },

    area: {
      type: String,
      required: true,
      trim: true,
    },

    established: {
      type: Number,
      required: true,
      min: 1800,
    },

    // Option B (Final Decision)
    manager: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    phoneNumber: {
      type: String,
      trim: true,
      default: null,
    },

    coverImage: {
      type: String,
      default: null,
    },

    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },
  },
  {
    timestamps: true,
  }
);

const Estate = mongoose.model("Estate", estateSchema);

export default Estate;