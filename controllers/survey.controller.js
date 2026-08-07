import * as surveyService from "../services/survey.service.js";

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
