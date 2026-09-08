import * as surveyService from "../services/survey.service.js";

import Survey from "../models/Survey.js";

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
    return res.status(500).json({
      success: false,

      message: error.message,
    });
  }
};

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
    return res.status(400).json({
      success: false,

      message: error.message,
    });
  }
};

export const getSurveyByEstateYear = async (req, res) => {
  try {
    const { estateId, year } = req.params;

    const survey = await surveyService.getSurveyByEstateYear(estateId, year);

    return res.status(200).json({
      success: true,

      data: survey,
    });
  } catch (error) {
    return res.status(404).json({
      success: false,

      message: error.message,
    });
  }
};

export const getEstateSurveys = async (req, res) => {
  try {
    const { estateId } = req.params;

    const surveys = await surveyService.getEstateSurveys(estateId);

    return res.status(200).json({
      success: true,

      data: surveys,
    });
  } catch (error) {
    return res.status(404).json({
      success: false,

      message: error.message,
    });
  }
};

export const getSurveyGeoJson = async (req, res) => {
  try {
    const { surveyId } = req.params;

    const geoJson = await surveyService.getSurveyGeoJson(surveyId);

    return res.status(200).json({
      success: true,

      data: geoJson,
    });
  } catch (error) {
    return res.status(404).json({
      success: false,

      message: error.message,
    });
  }
};

export const getSurveyMapData = async (req, res) => {
  try {
    const { surveyId } = req.params;

    const mapData = await surveyService.getSurveyMapData(surveyId);

    return res.status(200).json({
      success: true,

      data: mapData,
    });
  } catch (error) {
    return res.status(404).json({
      success: false,

      message: error.message,
    });
  }
};

export const getSurveyById = async (req, res) => {
  try {
    const { surveyId } = req.params;

    const survey = await surveyService.getSurveyById(surveyId);

    return res.status(200).json({
      success: true,

      data: survey,
    });
  } catch (error) {
    return res.status(404).json({
      success: false,

      message: error.message,
    });
  }
};
