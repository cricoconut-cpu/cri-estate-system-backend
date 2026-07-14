const express = require("express");

const router = express.Router();

const { login } = require("../controllers/auth.controller");

const validate = require("../middleware/validate.middleware");

const { loginValidation } = require("../validators/auth.validator");

router.post("/login", loginValidation, validate, login);

module.exports = router;
