import express from "express";

import { createUser, getAllUsers } from "../controllers/user.controller.js";

import protect from "../middleware/auth.middleware.js";

import authorize from "../middleware/role.middleware.js";

const router = express.Router();

/*
|--------------------------------------------------------------------------
| Get all users
|--------------------------------------------------------------------------
*/

router.get("/", protect, authorize("Admin"), getAllUsers);

/*
|--------------------------------------------------------------------------
| Create user
|--------------------------------------------------------------------------
*/

router.post("/", protect, authorize("Admin"), createUser);

export default router;
