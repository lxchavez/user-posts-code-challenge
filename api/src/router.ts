import BodyParser from "body-parser";
import { NextFunction, Request, Response } from "express";
import Router from "express-promise-router";
import { Prisma } from "@prisma/client";
import { createUser, retrieveUser, updateUser } from "./user";
import {
  ResourceNotFound,
  UserInputValidationError,
  UserMutationError,
} from "./errors/UserErrors";

/**
 * Validates the request body of a route. This middleware should be used for
 * routes that require a request body.
 * @param request the Express {@link Request} object
 * @param response the Express {@link Response} object
 * @param next the Express NextFunction object
 */
const validateRequestBody = (
  request: Request,
  response: Response,
  next: NextFunction,
) => {
  const requestBody = request.body;

  if (
    typeof requestBody !== "object" ||
    Object.keys(requestBody).length === 0
  ) {
    response
      .status(400)
      .send("Missing request body! Please send a JSON body with the request.");
    return;
  }

  // Add more validations here as needed.

  // If validation passed, call next() to move on to the next middleware/route handler.
  next();
};

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

    // Convert date strings to Date objects.
    if ("dateOfBirth" in body && typeof body.dateOfBirth === "string") {
      body["dateOfBirth"] = new Date(body.dateOfBirth);
    }

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
