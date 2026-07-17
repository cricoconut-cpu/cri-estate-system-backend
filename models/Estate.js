import mongoose from "mongoose";

const estateSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      trim: true,
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

    sector: {
      type: String,
      required: true,
      trim: true,
    },

    area: {
      type: Number,
      required: true,
      min: 0,
    },

    established: {
      type: Number,
      required: true,
    },

    manager: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    totalTrees: {
      type: Number,
      required: true,
      min: 0,
    },

    latitude: {
      type: Number,
      required: true,
    },

    longitude: {
      type: Number,
      required: true,
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