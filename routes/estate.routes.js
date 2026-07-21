import express from "express";

import * as estateController from "../controllers/estate.controller.js";

import authenticate from "../middleware/auth.middleware.js";

import { validateEstateId } from "../validators/estate.validator.js";

const router = express.Router();

router.get("/", authenticate, estateController.getAllEstates);

router.get(
  "/:id",
  authenticate,
  validateEstateId,
  estateController.getEstateById,
);

export default router;
