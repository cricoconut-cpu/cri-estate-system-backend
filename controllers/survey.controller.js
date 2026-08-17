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


export const getEstateSurveys = async (
  req,
  res
) => {

  try {


    const {
      estateId,
    } = req.params;


    const surveys =
      await surveyService.getEstateSurveys(
        estateId
      );


    return res.status(200).json({

      success:true,

      data:surveys,

    });


  } catch(error) {


    return res.status(404).json({

      success:false,

      message:error.message,

    });

  }

};