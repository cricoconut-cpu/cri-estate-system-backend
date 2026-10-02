import express from "express";

import {
  createSurvey,
  getEstateSurveys,
  getSurveyByEstateYear,
  getSurveyById,
  getSurveyGeoJson,
  getSurveyMapData,
  getSurveySummary,
} from "../controllers/survey.controller.js";

import protect from "../middleware/auth.middleware.js";

import authorize from "../middleware/role.middleware.js";

import { surveyUpload } from "../middleware/upload.middleware.js";

import { createSurveyValidation } from "../validators/survey.validator.js";

const router = express.Router();

/*
|--------------------------------------------------------------------------
| Upload Survey
|--------------------------------------------------------------------------
|
| Admin + Analyst only
|
*/

router.post(
  "/",
  protect,
  authorize("Admin", "Analyst"),
  createSurveyValidation,
  surveyUpload,
  createSurvey,
);

/*
|--------------------------------------------------------------------------
| Admin Survey Summary
|--------------------------------------------------------------------------
|
| IMPORTANT:
| This must appear before /:surveyId
|
*/

router.get("/summary", protect, authorize("Admin"), getSurveySummary);

/*
|--------------------------------------------------------------------------
| Estate Survey History
|--------------------------------------------------------------------------
*/

router.get("/estate/:estateId", protect, getEstateSurveys);

/*
|--------------------------------------------------------------------------
| Survey GeoJSON
|--------------------------------------------------------------------------
*/

router.get("/:surveyId/geojson", protect, getSurveyGeoJson);

/*
|--------------------------------------------------------------------------
| Survey Map
|--------------------------------------------------------------------------
*/

router.get("/:surveyId/map", protect, getSurveyMapData);

/*
|--------------------------------------------------------------------------
| Survey By Estate + Year
|--------------------------------------------------------------------------
|
| Keep this before /:surveyId.
|
*/

router.get("/:estateId/:year", protect, getSurveyByEstateYear);

/*
|--------------------------------------------------------------------------
| Survey By ID
|--------------------------------------------------------------------------
|
| Generic route goes LAST.
|
*/

router.get("/:surveyId", protect, getSurveyById);

export default router;
