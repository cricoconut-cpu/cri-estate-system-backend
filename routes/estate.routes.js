import express from "express";

import * as estateController from "../controllers/estate.controller.js";

import authenticate from "../middleware/auth.middleware.js";

const router = express.Router();

// GET /api/estates
router.get(
  "/",
  authenticate,
  estateController.getAllEstates
);

// GET /api/estates/:id
router.get(
  "/:id",
  authenticate,
  estateController.getEstateById
);

export default router;