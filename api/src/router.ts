import BodyParser from "body-parser";
import { NextFunction, Request, Response } from "express";
import Router from "express-promise-router";
import { body, validationResult } from "express-validator";
import { Prisma } from "@prisma/client";
import { createUser, retrieveUser, updateUser } from "./user";
import {
  ResourceNotFound,
  UserInputValidationError,
  UserMutationError,
} from "./errors/UserErrors";

// Define validation middleware for the request body using express-validator.
const validateRequestBody = [
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
    .withMessage("Invalid email provided.")
    .isLength({ max: 254 }) // Maximum length is 254 characters as per RFC 5321
    .withMessage("email must be less than or equal to 254 characters."),

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

/**
 * Resolves a User operation promise and sends the appropriate response.
 * @param promise the promise to resolve
 * @param response the Express {@link Response} object
 */
const resolveUserPromise = (
  promise: Promise<Prisma.UserCreateInput | Prisma.UserUpdateInput>,
  response: Response,
) => {
  Promise.all([promise])
    .then(([result]) => {
      response.status(200).send(result);
    })
    .catch((err) => {
      if (
        err instanceof UserMutationError ||
        err instanceof UserInputValidationError
      ) {
        response.status(400).send(err.message);
      } else if (err instanceof ResourceNotFound) {
        response.status(404).send(err.message);
      } else {
        console.error(err);
        response
          .status(500)
          .send(
            "Encountered an unexpected error while processing User request",
          );
      }
    });
};

const jsonParser = BodyParser.json();
const router = Router();

router.get("/hello", (_, res) => res.send("Hello World!"));

// Persist a new User to the database.
router.post(
  "/users",
  jsonParser,
  validateRequestBody,
  (request: Request, response: Response) => {
    const body = request.body;

    const userPromise = createUser(body);
    resolveUserPromise(userPromise, response);
  },
);

// Retrieve an existing User from the database.
router.get("/users/:id", (request: Request, response: Response) => {
  const id = parseInt(request.params.id);

  const userPromise = retrieveUser(id);
  resolveUserPromise(userPromise, response);
});

// Update an existing User in the database.
router.put(
  "/users/:id",
  jsonParser,
  validateRequestBody,
  (request: Request, response: Response) => {
    const body = request.body;
    const id = parseInt(request.params.id);

    const userPromise = updateUser(id, body);
    resolveUserPromise(userPromise, response);
  },
);

export default router;
