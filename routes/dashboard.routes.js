import express from "express";

import { getAdminDashboard } from "../controllers/dashboard.controller.js";

import protect from "../middleware/auth.middleware.js";

import authorize from "../middleware/role.middleware.js";

const router = express.Router();

router.get("/admin", protect, authorize("Admin"), getAdminDashboard);

export default router;
