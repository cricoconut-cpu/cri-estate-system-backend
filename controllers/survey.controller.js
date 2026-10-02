import Survey from "../models/Survey.js";

import * as surveyService from "../services/survey.service.js";

/*
|--------------------------------------------------------------------------
| Error Helper
|--------------------------------------------------------------------------
*/

const sendError = (res, error, fallbackStatus = 500) => {
  return res.status(error.statusCode || fallbackStatus).json({
    success: false,

    message: error.message || "Something went wrong.",
  });
};

/*
|--------------------------------------------------------------------------
| Survey Summary
|--------------------------------------------------------------------------
|
| Route is Admin only.
|
*/

export const getSurveySummary = async (req, res) => {
  try {
    const totalSurveys = await Survey.countDocuments();

    const latestSurvey = await Survey.findOne()
      .sort({
        createdAt: -1,
      })
      .populate("estate", "name");

    const statistics = await Survey.aggregate([
      {
        $group: {
          _id: null,

          totalTrees: {
            $sum: "$statistics.totalTrees",
          },

          healthy: {
            $sum: "$statistics.healthy",
          },

          moderate: {
            $sum: "$statistics.moderate",
          },

          mildStress: {
            $sum: "$statistics.mildStress",
          },

          severeStress: {
            $sum: "$statistics.severeStress",
          },

          critical: {
            $sum: "$statistics.critical",
          },
        },
      },
    ]);

    return res.status(200).json({
      success: true,

      data: {
        totalSurveys,

        latestSurvey,

        statistics: statistics[0] || {},
      },
    });
  } catch (error) {
    return sendError(res, error);
  }
};

/*
|--------------------------------------------------------------------------
| Create / Replace Survey
|--------------------------------------------------------------------------
*/

export const createSurvey = async (req, res) => {
  try {
    const { estateId, year, surveyDate } = req.body;

    const files = req.files;

    const uploadedBy = req.user._id;

    const survey = await surveyService.createSurvey({
      estateId,
      year,
      surveyDate,
      files,
      uploadedBy,
    });

    return res.status(201).json({
      success: true,

      message: "Survey uploaded successfully.",

      data: survey,
    });
  } catch (error) {
    return sendError(res, error, 400);
  }
};

/*
|--------------------------------------------------------------------------
| Get Survey By Estate + Year
|--------------------------------------------------------------------------
*/

export const getSurveyByEstateYear = async (req, res) => {
  try {
    const { estateId, year } = req.params;

    const survey = await surveyService.getSurveyByEstateYear(
      estateId,
      year,
      req.user,
    );

    return res.status(200).json({
      success: true,

      data: survey,
    });
  } catch (error) {
    return sendError(res, error);
  }
};

/*
|--------------------------------------------------------------------------
| Get Estate Survey History
|--------------------------------------------------------------------------
*/

export const getEstateSurveys = async (req, res) => {
  try {
    const { estateId } = req.params;

    const surveys = await surveyService.getEstateSurveys(estateId, req.user);

    return res.status(200).json({
      success: true,

      data: surveys,
    });
  } catch (error) {
    return sendError(res, error);
  }
};

/*
|--------------------------------------------------------------------------
| Get GeoJSON
|--------------------------------------------------------------------------
*/

export const getSurveyGeoJson = async (req, res) => {
  try {
    const { surveyId } = req.params;

    const geoJson = await surveyService.getSurveyGeoJson(surveyId, req.user);

    return res.status(200).json({
      success: true,

      data: geoJson,
    });
  } catch (error) {
    return sendError(res, error);
  }
};

/*
|--------------------------------------------------------------------------
| Get Map Data
|--------------------------------------------------------------------------
*/

export const getSurveyMapData = async (req, res) => {
  try {
    const { surveyId } = req.params;

    const mapData = await surveyService.getSurveyMapData(surveyId, req.user);

    return res.status(200).json({
      success: true,

      data: mapData,
    });
  } catch (error) {
    return sendError(res, error);
  }
};

/*
|--------------------------------------------------------------------------
| Get Survey By ID
|--------------------------------------------------------------------------
*/

export const getSurveyById = async (req, res) => {
  try {
    const { surveyId } = req.params;

    const survey = await surveyService.getSurveyById(surveyId, req.user);

    return res.status(200).json({
      success: true,

      data: survey,
    });
  } catch (error) {
    return sendError(res, error);
  }
};
