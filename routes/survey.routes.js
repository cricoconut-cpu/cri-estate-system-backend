import express from "express";


import {
  createSurvey,
  getEstateSurveys,
  getSurveyByEstateYear,
} from "../controllers/survey.controller.js";


import protect from "../middleware/auth.middleware.js";


import authorize from "../middleware/role.middleware.js";


import {
  createSurveyValidation,
} from "../validators/survey.validator.js";


import {
  surveyUpload,
} from "../middleware/upload.middleware.js";



const router = express.Router();



// Upload survey
router.post(
  "/",
  protect,
  authorize(
    "Admin",
    "Analyst"
  ),
  createSurveyValidation,
  surveyUpload,
  createSurvey
);

// Estate history
router.get(
  "/estate/:estateId",
  protect,
  getEstateSurveys
);


// Single survey
router.get(
  "/:estateId/:year",
  protect,
  getSurveyByEstateYear
);


export default router;