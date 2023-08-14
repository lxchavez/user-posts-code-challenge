import BodyParser from "body-parser";
import { Request, Response } from "express";
import Router from "express-promise-router";
import { Prisma } from "@prisma/client";
import {
  createPost,
  deletePost,
  getAllUserPosts,
  getPost,
  updatePost,
} from "./entities/post";
import {
  createUser,
  deleteUser,
  retrieveUser,
  updateUser,
} from "./entities/user";
import {
  validateIdParameter,
  validatePostRequest,
  validateUserRequest,
} from "./middleware";
import {
  UserInputValidationError,
  UserMutationError,
  UserNotFoundError,
} from "./errors/UserErrors";
import {
  PostInputValidationError,
  PostMutationError,
  PostNotFoundError,
} from "./errors/PostErrors";
import { ErrorResponse, PostResponse } from "./types";

// TODO: Emit event metrics for each endpoint (e.g. POST /users, GET /users/:id, etc.).

/**
 * Resolves a User operation promise and sends the appropriate response.
 * We resolve the post promises in a separate function so that we can
 * emit more granular event metrics.
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
      let status = 500;
      let errors: ErrorResponse[] = [];

      if (
        err instanceof UserInputValidationError ||
        err instanceof UserMutationError
      ) {
        status = 400;
        errors = err.errors;
      } else if (err instanceof UserNotFoundError) {
        status = 404;
        errors = err.errors;
      }

      response.status(status).send({ errors });
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

// Retrieve all Posts associated with a specific User.
router.get(
  "/users/:id/posts",
  validateIdParameter,
  (request: Request, response: Response) => {
    const id = parseInt(request.params.id);

    const postsPromise = getAllUserPosts(id);
    resolvePostResult(postsPromise, response);
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

/**
 * Resolves a Post operation promise and sends the appropriate response.
 * We resolve the post promises in a separate function so that we can
 * emit more granular event metrics.
 * @param promise the promise to resolve
 * @param response the Express {@link Response} object
 */
const resolvePostResult = (
  promise: Promise<
    Prisma.PostCreateInput | Prisma.PostUpdateInput | PostResponse[]
  >,
  response: Response,
) => {
  Promise.all([promise])
    .then(([result]) => {
      response.status(200).send(result);
    })
    .catch((err) => {
      let status = 500;
      let errors: ErrorResponse[] = [];

      if (err instanceof PostInputValidationError) {
        status = 400;
        errors = err.errors;
      } else if (err instanceof PostMutationError) {
        const error = err.errors[0];
        if (error.value && error.value === "userId") {
          // Obfuscate real cause of error to limit information
          // leakage of User data.
          status = 404;
        }
        errors = err.errors;
      } else if (err instanceof PostNotFoundError) {
        status = 404;
        errors = err.errors;
      }

      response.status(status).send({ errors });
    });
};

// Post routes

// Persist a new Post to the database.
router.post(
  "/posts",
  jsonParser,
  validatePostRequest,
  (request: Request, response: Response) => {
    const body = request.body;

    const postPromise = createPost(body);
    resolvePostResult(postPromise, response);
  },
);

// Retrieve an existing Post from the database.
router.get(
  "/posts/:id",
  validateIdParameter,
  (request: Request, response: Response) => {
    const id = parseInt(request.params.id);

    const postPromise = getPost(id);
    resolvePostResult(postPromise, response);
  },
);

// Update an existing Post in the database.
router.put(
  "/posts/:id",
  jsonParser,
  validateIdParameter,
  validatePostRequest,
  (request: Request, response: Response) => {
    const body = request.body;
    const postId = parseInt(request.params.id);
    const userId = body.userId;

    const postPromise = updatePost(postId, userId, body);
    resolvePostResult(postPromise, response);
  },
);

// Delete an existing Post from the database.
router.delete(
  "/posts/:id",
  validateIdParameter,
  (request: Request, response: Response) => {
    const postId = parseInt(request.params.id);

    const postPromise = deletePost(postId);
    resolvePostResult(postPromise, response);
  },
);

export default router;
