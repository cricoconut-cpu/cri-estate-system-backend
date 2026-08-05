import { body } from "express-validator";


export const createSurveyValidation = [

  body("estateId")
    .notEmpty()
    .withMessage("Estate ID is required"),


  body("year")
    .notEmpty()
    .withMessage("Survey year is required")
    .isInt({
      min: 1900,
    })
    .withMessage("Valid survey year is required"),


  body("surveyDate")
    .notEmpty()
    .withMessage("Survey date is required")
    .isISO8601()
    .withMessage("Valid survey date is required"),

];