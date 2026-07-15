const express = require("express");
const router = express.Router();

// Controllers & Middleware
const { login } = require("../controllers/auth.controller");
const validate = require("../middleware/validate.middleware");
const { loginValidation } = require("../validators/auth.validator");
const protect = require("../middleware/auth.middleware"); // Added in Step 12

// --- Routes ---

// Login Route (Step 9)
router.post("/login", loginValidation, validate, login);

// Protected Profile Test Route (Step 12)
router.get("/profile", protect, (req, res) => {
    res.status(200).json({
        success: true,
        user: req.user
    });
});

module.exports = router;