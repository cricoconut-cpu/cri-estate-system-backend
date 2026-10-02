import Estate from "../models/Estate.js";

import Survey from "../models/Survey.js";

import {
  deleteFile,
  downloadFile,
  uploadFile,
} from "../utils/supabase.storage.js";

import { calculateSurveyStatistics } from "../utils/geojson.parser.js";

/*
|--------------------------------------------------------------------------
| Service Error Helper
|--------------------------------------------------------------------------
*/

const serviceError = (message, statusCode) => {
  const error = new Error(message);

  error.statusCode = statusCode;

  return error;
};

/*
|--------------------------------------------------------------------------
| Full Survey Access Roles
|--------------------------------------------------------------------------
*/

const hasFullSurveyAccess = (user) => {
  return user?.role === "Admin" || user?.role === "Analyst";
};

/*
|--------------------------------------------------------------------------
| Assigned Estate
|--------------------------------------------------------------------------
*/

const getAssignedEstateId = (user) => {
  if (!user?.assignedEstate) {
    return null;
  }

  return String(user.assignedEstate?._id || user.assignedEstate);
};

/*
|--------------------------------------------------------------------------
| Assert Estate Access
|--------------------------------------------------------------------------
|
| Admin:
|   all estates
|
| Analyst:
|   all estates
|
| Estate Manager:
|   assigned estate only
|
*/

const assertEstateAccess = (user, estateId) => {
  if (hasFullSurveyAccess(user)) {
    return;
  }

  if (user?.role !== "Estate Manager") {
    throw serviceError("You are not authorized to access surveys.", 403);
  }

  const assignedEstateId = getAssignedEstateId(user);

  if (!assignedEstateId) {
    throw serviceError("No estate has been assigned to this account.", 403);
  }

  const requestedEstateId = String(estateId?._id || estateId);

  if (assignedEstateId !== requestedEstateId) {
    throw serviceError(
      "You are not authorized to access surveys for this estate.",
      403,
    );
  }
};

/*
|--------------------------------------------------------------------------
| CREATE / REPLACE SURVEY
|--------------------------------------------------------------------------
*/

export const createSurvey = async ({
  estateId,
  year,
  surveyDate,
  files,
  uploadedBy,
}) => {
  /*
    |--------------------------------------------------------------------------
    | Required Files
    |--------------------------------------------------------------------------
    */

  if (!files?.geoJson || !files?.orthomosaic || !files?.bounds) {
    throw serviceError(
      "GeoJSON, orthomosaic image and bounds file are required.",
      400,
    );
  }

  /*
    |--------------------------------------------------------------------------
    | Estate
    |--------------------------------------------------------------------------
    */

  const estate = await Estate.findById(estateId);

  if (!estate) {
    throw serviceError("Estate not found.", 404);
  }

  /*
    |--------------------------------------------------------------------------
    | Existing Survey
    |--------------------------------------------------------------------------
    |
    | Same estate + year = replacement
    |
    */

  const existingSurvey = await Survey.findOne({
    estate: estateId,
    year,
  });

  /*
    |--------------------------------------------------------------------------
    | Save Old File Paths
    |--------------------------------------------------------------------------
    */

  const oldFiles = existingSurvey
    ? {
        geoJson: existingSurvey.files?.geoJson?.path,

        image: existingSurvey.files?.orthomosaic?.imagePath,

        bounds: existingSurvey.files?.bounds?.path,
      }
    : null;

  /*
    |--------------------------------------------------------------------------
    | New Storage Paths
    |--------------------------------------------------------------------------
    */

  const uploadVersion = Date.now();

  const basePath = `estates/${estateId}/${year}/${uploadVersion}`;

  const geoJsonPath = `${basePath}/geojson/trees.geojson`;

  const imagePath = `${basePath}/orthomosaic/map.png`;

  const boundsPath = `${basePath}/spatial/bounds.json`;

  let uploadedFiles = null;

  try {
    /*
      |--------------------------------------------------------------------------
      | Upload Files
      |--------------------------------------------------------------------------
      */

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

    /*
      |--------------------------------------------------------------------------
      | Parse GeoJSON
      |--------------------------------------------------------------------------
      */

    let geoJson;

    try {
      geoJson = JSON.parse(files.geoJson[0].buffer.toString("utf-8"));
    } catch {
      throw serviceError("Invalid GeoJSON file.", 400);
    }

    const statistics = calculateSurveyStatistics(geoJson);

    /*
      |--------------------------------------------------------------------------
      | Parse Bounds
      |--------------------------------------------------------------------------
      */

    let spatialData;

    try {
      spatialData = JSON.parse(files.bounds[0].buffer.toString("utf-8"));
    } catch {
      throw serviceError("Invalid bounds JSON file.", 400);
    }

    /*
      |--------------------------------------------------------------------------
      | Validate Bounds
      |--------------------------------------------------------------------------
      */

    if (
      !spatialData.crs ||
      !spatialData.bounds ||
      typeof spatialData.bounds.north !== "number" ||
      typeof spatialData.bounds.south !== "number" ||
      typeof spatialData.bounds.east !== "number" ||
      typeof spatialData.bounds.west !== "number"
    ) {
      throw serviceError("Invalid bounds JSON format.", 400);
    }

    /*
      |--------------------------------------------------------------------------
      | Survey Document
      |--------------------------------------------------------------------------
      */

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

    /*
      |--------------------------------------------------------------------------
      | Save / Replace
      |--------------------------------------------------------------------------
      */

    let savedSurvey;

    if (existingSurvey) {
      Object.assign(existingSurvey, surveyData);

      savedSurvey = await existingSurvey.save();
    } else {
      savedSurvey = await Survey.create(surveyData);
    }

    /*
      |--------------------------------------------------------------------------
      | Delete Previous Files
      |--------------------------------------------------------------------------
      */

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
    /*
      |--------------------------------------------------------------------------
      | Cleanup Newly Uploaded Files
      |--------------------------------------------------------------------------
      */

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

/*
|--------------------------------------------------------------------------
| GET SURVEY BY ESTATE + YEAR
|--------------------------------------------------------------------------
*/

export const getSurveyByEstateYear = async (estateId, year, user) => {
  /*
   * Check permission first.
   */

  assertEstateAccess(user, estateId);

  const survey = await Survey.findOne({
    estate: estateId,
    year,
  })
    .populate("estate", "name district area")
    .populate("uploadedBy", "name email role");

  if (!survey) {
    throw serviceError("Survey not found.", 404);
  }

  return survey;
};

/*
|--------------------------------------------------------------------------
| GET ALL SURVEYS OF ESTATE
|--------------------------------------------------------------------------
*/

export const getEstateSurveys = async (estateId, user) => {
  /*
   * Estate Manager cannot request
   * another estate's history.
   */

  assertEstateAccess(user, estateId);

  const surveys = await Survey.find({
    estate: estateId,
  })
    .sort({
      year: -1,
      surveyDate: -1,
    })
    .select("year surveyDate statistics status createdAt");

  /*
   * An estate having zero surveys
   * is valid, not an API error.
   */

  return surveys;
};

/*
|--------------------------------------------------------------------------
| GET SURVEY GEOJSON
|--------------------------------------------------------------------------
*/

export const getSurveyGeoJson = async (surveyId, user) => {
  const survey = await Survey.findById(surveyId).select("estate files.geoJson");

  if (!survey) {
    throw serviceError("Survey not found.", 404);
  }

  /*
   * Critical authorization check.
   */

  assertEstateAccess(user, survey.estate);

  const geoJsonPath = survey.files?.geoJson?.path;

  if (!geoJsonPath) {
    throw serviceError("GeoJSON file path not found.", 404);
  }

  return downloadFile(geoJsonPath);
};

/*
|--------------------------------------------------------------------------
| GET SURVEY MAP DATA
|--------------------------------------------------------------------------
*/

export const getSurveyMapData = async (surveyId, user) => {
  const survey = await Survey.findById(surveyId).select(
    "estate files.orthomosaic spatial",
  );

  if (!survey) {
    throw serviceError("Survey not found.", 404);
  }

  /*
   * Critical authorization check.
   */

  assertEstateAccess(user, survey.estate);

  if (!survey.files?.orthomosaic?.imageUrl) {
    throw serviceError("Orthomosaic image not found.", 404);
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

/*
|--------------------------------------------------------------------------
| GET SURVEY BY ID
|--------------------------------------------------------------------------
*/

export const getSurveyById = async (surveyId, user) => {
  const survey = await Survey.findById(surveyId).populate(
    "estate",
    "name district area manager",
  );

  if (!survey) {
    throw serviceError("Survey not found.", 404);
  }

  /*
   * survey.estate is populated,
   * so helper supports estate._id.
   */

  assertEstateAccess(user, survey.estate);

  return survey;
};
