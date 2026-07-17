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
    },

    // Option B (Final Decision)
    manager: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // Static estate photo (Supabase URL)
    coverImage: {
      type: String,
      default: null,
    },

    // Updated automatically after every survey
    totalTrees: {
      type: Number,
      default: null,
      min: 0,
    },

    // Updated automatically after every survey
    lastSurvey: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Estate", estateSchema);