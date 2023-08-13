import BodyParser from "body-parser";
import { NextFunction, Request, Response } from "express";
import Router from "express-promise-router";
import { createUser } from "./user";
import { UserMutationError } from "./errors/UserErrors";

const router = Router();
const jsonParser = BodyParser.json();

/**
 * Validates the request body of a route. This middleware should be used for
 * routes that require a request body.
 * @param req the Express Request object
 * @param res the Express Response object
 * @param next the Express NextFunction object
 */
const validateRequestBody = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const requestBody = req.body;

  if (Object.keys(requestBody).length === 0) {
    res
      .status(400)
      .send("Missing request body! Please send a JSON body with the request.");
    return;
  }

  // Add more validations here as needed.

  // If validation passed, call next() to move on to the next middleware/route handler.
  next();
};

router.get("/hello", (_, res) => res.send("Hello World!"));

// Persist a new User to the database.
router.post(
  "/users",
  jsonParser,
  validateRequestBody,
  (req: Request, res: Response) => {
    const request = req.body;
    const userPromise = createUser(request);

    void Promise.all([userPromise])
      .then(([user]) => {
        res.status(200).send(`Created new user ${user.username}`);
      })
      .catch((err) => {
        if (err instanceof UserMutationError) {
          res.status(400).send(err.message);
          return;
        }

        console.error(err);
        res.status(500).send("Encountered an error while creating user");
      });
  },
);

export default router;
