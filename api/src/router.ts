import BodyParser from "body-parser";
import { Request, Response } from "express";
import Router from "express-promise-router";
import { Prisma } from "@prisma/client";
import {
  createUser,
  deleteUser,
  retrieveUser,
  updateUser,
} from "./entities/user";
import { validateIdParameter, validateUserRequest } from "./middleware";
import {
  UserInputValidationError,
  UserMutationError,
  UserNotFoundError,
} from "./errors/UserErrors";

/**
 * Resolves a User operation promise and sends the appropriate response.
 * @param promise the promise to resolve
 * @param response the Express {@link Response} object
 */
const resolveUserResult = (
  promise: Promise<Prisma.UserCreateInput | Prisma.UserUpdateInput>,
  response: Response,
) => {
  Promise.all([promise])
    .then(([result]) => {
      response.status(200).send(result);
    })
    .catch((err) => {
      if (err instanceof UserInputValidationError) {
        response.status(400).send({ errors: err.errors });
      } else if (err instanceof UserMutationError) {
        response.status(400).send({ errors: err.errors });
      } else if (err instanceof UserNotFoundError) {
        response.status(404).send({ errors: err.errors });
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

// User routes

// Persist a new User to the database.
router.post(
  "/users",
  jsonParser,
  validateUserRequest,
  (request: Request, response: Response) => {
    const body = request.body;

    const userPromise = createUser(body);
    resolveUserResult(userPromise, response);
  },
);

// Retrieve an existing User from the database.
router.get(
  "/users/:id",
  validateIdParameter,
  (request: Request, response: Response) => {
    const id = parseInt(request.params.id);

    const userPromise = retrieveUser(id);
    resolveUserResult(userPromise, response);
  },
);

// Update an existing User in the database.
router.put(
  "/users/:id",
  jsonParser,
  validateIdParameter,
  validateUserRequest,
  (request: Request, response: Response) => {
    const body = request.body;
    const id = parseInt(request.params.id);

    const userPromise = updateUser(id, body);
    resolveUserResult(userPromise, response);
  },
);

// Delete an existing User and their posts from the database.
router.delete(
  "/users/:id",
  validateIdParameter,
  (request: Request, response: Response) => {
    const id = parseInt(request.params.id);

    const userPromise = deleteUser(id);
    resolveUserResult(userPromise, response);
  },
);

// Post routes

// Persist a new Post to the database.

export default router;
