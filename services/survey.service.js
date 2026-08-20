import Estate from "../models/Estate.js";
import Survey from "../models/Survey.js";

import {
  deleteFile,
  downloadFile,
  uploadFile,
} from "../utils/supabase.storage.js";

import { calculateSurveyStatistics } from "../utils/geojson.parser.js";

// =====================================================
// CREATE / REPLACE SURVEY
// =====================================================

export const createSurvey = async ({
  estateId,
  year,
  surveyDate,
  files,
  uploadedBy,
}) => {
  // 1. Validate required files

  if (!files?.geoJson || !files?.orthomosaic || !files?.bounds) {
    throw new Error("GeoJSON, orthomosaic image and bounds file are required.");
  }

  // 2. Check estate

  const estate = await Estate.findById(estateId);

  if (!estate) {
    throw new Error("Estate not found.");
  }

  // 3. Find existing survey
  //    Same estate + same year = replacement

  const existingSurvey = await Survey.findOne({
    estate: estateId,
    year,
  });

  // 4. Save old file paths
  //    BEFORE replacing the MongoDB document

  const oldFiles = existingSurvey
    ? {
        geoJson: existingSurvey.files?.geoJson?.path,

        image: existingSurvey.files?.orthomosaic?.imagePath,

        bounds: existingSurvey.files?.bounds?.path,
      }
    : null;

  // 5. Create unique upload version

  const uploadVersion = Date.now();

  const basePath = `estates/${estateId}/${year}/${uploadVersion}`;

  const geoJsonPath = `${basePath}/geojson/trees.geojson`;

  const imagePath = `${basePath}/orthomosaic/map.png`;

  const boundsPath = `${basePath}/spatial/bounds.json`;

  let uploadedFiles = null;

  try {
    // =================================================
    // 6. Upload new files to Supabase
    // =================================================

    const geoJsonFile = await uploadFile(files.geoJson[0], geoJsonPath);

    const imageFile = await uploadFile(files.orthomosaic[0], imagePath);

    const boundsFile = await uploadFile(files.bounds[0], boundsPath);

    uploadedFiles = {
      geoJson: geoJsonFile,

      orthomosaic: {
        image: imageFile,
      },

      bounds: boundsFile,
    };

    // =================================================
    // 7. Parse GeoJSON
    // =================================================

    const geoJson = JSON.parse(files.geoJson[0].buffer.toString("utf-8"));

    const statistics = calculateSurveyStatistics(geoJson);

    // =================================================
    // 8. Parse bounds JSON
    // =================================================

    const spatialData = JSON.parse(files.bounds[0].buffer.toString("utf-8"));

    // =================================================
    // 9. Validate bounds JSON
    // =================================================

    if (
      !spatialData.crs ||
      !spatialData.bounds ||
      typeof spatialData.bounds.north !== "number" ||
      typeof spatialData.bounds.south !== "number" ||
      typeof spatialData.bounds.east !== "number" ||
      typeof spatialData.bounds.west !== "number"
    ) {
      throw new Error("Invalid bounds JSON format.");
    }

    // =================================================
    // 10. Prepare Survey document
    // =================================================

    const surveyData = {
      estate: estateId,

      year,

      surveyDate,

      files: {
        geoJson: {
          url: uploadedFiles.geoJson.url,

          path: uploadedFiles.geoJson.path,
        },

        orthomosaic: {
          imageUrl: uploadedFiles.orthomosaic.image.url,

          imagePath: uploadedFiles.orthomosaic.image.path,
        },

        bounds: {
          url: uploadedFiles.bounds.url,

          path: uploadedFiles.bounds.path,
        },
      },

      spatial: {
        crs: spatialData.crs,

        bounds: {
          north: spatialData.bounds.north,

          south: spatialData.bounds.south,

          east: spatialData.bounds.east,

          west: spatialData.bounds.west,
        },
      },

      statistics,

      uploadedBy,

      status: "completed",
    };

    // =================================================
    // 11. Create new OR replace existing survey
    // =================================================

    let savedSurvey;

    if (existingSurvey) {
      Object.assign(existingSurvey, surveyData);

      savedSurvey = await existingSurvey.save();
    } else {
      savedSurvey = await Survey.create(surveyData);
    }

    // =================================================
    // 12. Delete OLD files
    //     only after successful DB save
    // =================================================

    if (oldFiles) {
      if (oldFiles.geoJson) {
        await deleteFile(oldFiles.geoJson);
      }

      if (oldFiles.image) {
        await deleteFile(oldFiles.image);
      }

      if (oldFiles.bounds) {
        await deleteFile(oldFiles.bounds);
      }
    }

    return savedSurvey;
  } catch (error) {
    // =================================================
    // 13. Cleanup NEW files if something failed
    // =================================================

    if (uploadedFiles) {
      if (uploadedFiles.geoJson?.path) {
        await deleteFile(uploadedFiles.geoJson.path);
      }

      if (uploadedFiles.orthomosaic?.image?.path) {
        await deleteFile(uploadedFiles.orthomosaic.image.path);
      }

      if (uploadedFiles.bounds?.path) {
        await deleteFile(uploadedFiles.bounds.path);
      }
    }

    throw error;
  }
};

// =====================================================
// GET SURVEY BY ESTATE + YEAR
// =====================================================

export const getSurveyByEstateYear = async (estateId, year) => {
  const survey = await Survey.findOne({
    estate: estateId,
    year,
  })
    .populate("estate", "name district area")
    .populate("uploadedBy", "name email role");

  if (!survey) {
    throw new Error("Survey not found.");
  }

  return survey;
};

// =====================================================
// GET ALL SURVEYS OF ESTATE
// =====================================================

export const getEstateSurveys = async (estateId) => {
  const surveys = await Survey.find({
    estate: estateId,
  })
    .sort({
      year: -1,
      surveyDate: -1,
    })
    .select("year surveyDate statistics status createdAt");

  if (!surveys.length) {
    throw new Error("No surveys found for this estate.");
  }

  return surveys;
};

// =====================================================
// GET SURVEY GEOJSON
// =====================================================

export const getSurveyGeoJson = async (surveyId) => {
  const survey = await Survey.findById(surveyId);

  if (!survey) {
    throw new Error("Survey not found.");
  }

  const geoJsonPath = survey.files?.geoJson?.path;

  if (!geoJsonPath) {
    throw new Error("GeoJSON file path not found.");
  }

  const geoJson = await downloadFile(geoJsonPath);

  return geoJson;
};

// =====================================================
// GET SURVEY MAP DATA
// =====================================================

export const getSurveyMapData = async (surveyId) => {
  const survey = await Survey.findById(surveyId);

  if (!survey) {
    throw new Error("Survey not found.");
  }

  return {
    orthomosaic: {
      imageUrl: survey.files.orthomosaic.imageUrl,
    },

    spatial: {
      crs: survey.spatial.crs,

      bounds: survey.spatial.bounds,
    },
  };
};
