import { NextFunction, Request, Response } from "express";
import { body, validationResult } from "express-validator";
import { ValidationErrorResponse } from "./types";

/**
 * Validates that the request body is a valid object.
 * @param value the request body
 * @returns true if the request body is a valid object
 * @throws an Error if the request body is not a valid object
 */
const validateBodyType = body().custom((value) => {
  if (typeof value !== "object" || Object.keys(value).length === 0) {
    throw new Error(
      "Missing request body! Please send a JSON body with the request.",
    );
  }
  return true;
});

/**
 * Marshalls a useful error response if validation of request input data fails.
 * @param request {@link Request}
 * @param response {@link Response}
 * @param next {@link NextFunction}
 * @returns a 400 response with a JSON body containing the validation errors
 */
const marshallErrorResponse = (
  request: Request,
  response: Response,
  next: NextFunction,
) => {
  const errors = validationResult(request);
  if (!errors.isEmpty()) {
    return response.status(400).json({ errors: errors.array() });
  }
  next();
};

export const validateUserRequest = [
  validateBodyType,

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

  marshallErrorResponse,
];

export const validatePostRequest = [
  validateBodyType,

  // Define validation for expected fields in the request body.

  body("userId")
    .isInt({ min: 1 })
    .withMessage(
      "userId must be defined as part of the Post request as a non-negative integer.",
    ),

  body("title")
    .optional()
    .isString()
    .trim()
    .notEmpty()
    .withMessage("title must not be empty or contain blanks.")
    .isLength({ max: 20 })
    .withMessage("title must be between 1 and 20 characters."),

  body("description")
    .optional()
    .isString()
    .trim()
    .notEmpty()
    .withMessage("description must not be empty or contain blanks.")
    .isLength({ max: 140 })
    .withMessage(
      "description must be between 1 and 140 characters, just like OG Twitter!",
    ),

  marshallErrorResponse,
];

/**
 * Validation middleware to check the id parameter of a request.
 * @param request {@link Request}
 * @param response {@link Response}
 * @param next {@link NextFunction}
 */
export const validateIdParameter = (
  request: Request,
  response: Response,
  next: NextFunction,
) => {
  const id = parseInt(request.params.id);

  if (isNaN(id) || id < 0) {
    const error = {
      msg: "Invalid id parameter. Must be a positive integer.",
    } as ValidationErrorResponse;

    return response.status(400).send({ errors: [error] });
  }

  next();
};
