import express from "express";


import {
  createSurvey,
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



// Get survey by estate and year
router.get(
  "/:estateId/:year",
  protect,
  getSurveyByEstateYear
);



export default router;