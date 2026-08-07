import express from "express";

import { createSurvey } from "../controllers/survey.controller.js";

import { protect } from "../middleware/auth.middleware.js";

import { authorizeRoles } from "../middleware/rbac.middleware.js";

import { createSurveyValidation } from "../validators/survey.validator.js";

import { surveyUpload } from "../middleware/upload.middleware.js";

const router = express.Router();

router.post(
  "/",
  protect,
  authorizeRoles("Admin", "Analyst"),
  createSurveyValidation,
  surveyUpload,
  createSurvey,
);

export default router;
