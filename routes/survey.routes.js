import express from "express";

import {
  createSurvey,
  getEstateSurveys,
  getSurveyByEstateYear,
  getSurveyGeoJson,
  getSurveyMapData,
} from "../controllers/survey.controller.js";

import { getSurveySummary } from "../controllers/survey.controller.js";
import protect from "../middleware/auth.middleware.js";
import authorize from "../middleware/role.middleware.js";
import { surveyUpload } from "../middleware/upload.middleware.js";
import { createSurveyValidation } from "../validators/survey.validator.js";

const router = express.Router();

// Upload survey
router.post(
  "/",
  protect,
  authorize("Admin", "Analyst"),
  createSurveyValidation,
  surveyUpload,
  createSurvey,
);

// Estate history
router.get("/estate/:estateId", protect, getEstateSurveys);

// Download GeoJSON
router.get("/:surveyId/geojson", protect, getSurveyGeoJson);

// Survey summary
router.get("/summary", protect, authorize("Admin"), getSurveySummary);

// Download Map Data
router.get("/:surveyId/map", protect, getSurveyMapData);

// Single survey
router.get("/:estateId/:year", protect, getSurveyByEstateYear);

export default router;
