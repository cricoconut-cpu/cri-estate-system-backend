import express from "express";

import {
    createUser,
    getAllUsers,
    updateUser,
    updateUserStatus,
} from "../controllers/user.controller.js";

import protect from "../middleware/auth.middleware.js";
import authorize from "../middleware/role.middleware.js";

const router = express.Router();

/*
|--------------------------------------------------------------------------
| All routes are Admin only
|--------------------------------------------------------------------------
*/

router.get("/", protect, authorize("Admin"), getAllUsers);

router.post("/", protect, authorize("Admin"), createUser);

/*
|--------------------------------------------------------------------------
| Activate / Deactivate User
|--------------------------------------------------------------------------
*/

router.patch("/:id/status", protect, authorize("Admin"), updateUserStatus);

/*
|--------------------------------------------------------------------------
| Update User
|--------------------------------------------------------------------------
*/

router.patch("/:id", protect, authorize("Admin"), updateUser);

export default router;
