import mongoose from "mongoose";

const surveySchema = new mongoose.Schema(
  {
    estate: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Estate",
      required: true,
    },

    year: {
      type: Number,
      required: true,
      min: 1900,
    },

    surveyDate: {
      type: Date,
      required: true,
    },

    files: {
      geoJson: {
        url: {
          type: String,
          required: true,
        },

        path: {
          type: String,
          required: true,
        },
      },

      orthomosaic: {
        imageUrl: {
          type: String,
          required: true,
        },

        imagePath: {
          type: String,
          required: true,
        },
      },

      bounds: {
        url: {
          type: String,
          required: true,
        },

        path: {
          type: String,
          required: true,
        },
      },
    },

    spatial: {
      crs: {
        type: String,
        required: true,
        default: "EPSG:4326",
      },

      bounds: {
        north: {
          type: Number,
          required: true,
        },

        south: {
          type: Number,
          required: true,
        },

        east: {
          type: Number,
          required: true,
        },

        west: {
          type: Number,
          required: true,
        },
      },
    },

    statistics: {
      totalTrees: {
        type: Number,
        default: 0,
      },

      healthy: {
        type: Number,
        default: 0,
      },

      moderate: {
        type: Number,
        default: 0,
      },

      mildStress: {
        type: Number,
        default: 0,
      },

      severeStress: {
        type: Number,
        default: 0,
      },

      critical: {
        type: Number,
        default: 0,
      },
    },

    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    status: {
      type: String,
      enum: ["processing", "completed", "failed"],
      default: "processing",
    },
  },
  {
    timestamps: true,
  },
);

// Fast estate + year queries
surveySchema.index({
  estate: 1,
  year: 1,
});

const Survey = mongoose.model("Survey", surveySchema);

export default Survey;
