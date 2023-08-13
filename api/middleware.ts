import { NextFunction, Request, Response } from "express";
import { body, validationResult } from "express-validator";

// Define validation middleware for the request body using express-validator.

export const validateUserRequest = [
  // Validation for the body to be an object
  body().custom((value) => {
    if (typeof value !== "object" || Object.keys(value).length === 0) {
      throw new Error(
        "Missing request body! Please send a JSON body with the request.",
      );
    }
    return true;
  }),

  // Define validation for expected fields in the request body.

  body("fullName")
    .optional()
    .isString()
    .trim()
    .notEmpty()
    .withMessage("fullName must not be empty or contain blanks.")
    .isLength({ max: 255 })
    .withMessage("fullName must be between 1 and 255 characters."),

  body("email")
    .optional()
    .isString()
    .isEmail()
    .withMessage("Invalid email provided."),

  body("username")
    .optional()
    .isString()
    .trim()
    .notEmpty()
    .withMessage("username must not be empty or contain blanks.")
    .isLength({ max: 15 })
    .withMessage("username must be less than or equal 15 characters."),

  body("dateOfBirth")
    .optional()
    .isString()
    .trim()
    .notEmpty()
    .withMessage("dateOfBirth must be defined as an ISO 8601 string.")
    .isISO8601()
    .withMessage("dateOfBirth must be a valid date in the format YYYY-MM-DD.")
    .customSanitizer((value) => {
      return new Date(value);
    }),

  // Error handling middleware; return a useful error response if validation fails.
  (request: Request, response: Response, next: NextFunction) => {
    const errors = validationResult(request);
    if (!errors.isEmpty()) {
      return response.status(400).json({ errors: errors.array() });
    }
    next();
  },
];
