const { body } = require("express-validator");

exports.loginValidation = [

    body("email")
        .isEmail()
        .withMessage("Valid email is required"),

    body("password")
        .notEmpty()
        .withMessage("Password is required")

];