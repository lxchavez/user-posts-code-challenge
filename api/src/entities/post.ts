import { Prisma } from "@prisma/client";
import {
  PostInputValidationError,
  PostMutationError,
  PostNotFoundError,
} from "../errors/PostErrors";
import prisma from "../lib/prisma";
import {
  EntityMutationErrorResponse,
  MissingResourceErrorResponse,
  ValidationErrorResponse,
} from "../types";
import { validateInputFields } from "../utils";

// TODO: Get list of required fields from Prisma.PostCreateInput, maybe with reflection?
const requiredFields: string[] = ["userId", "title", "description"];

/**
 * Creates a new Post entity in our database.
 * @param data the {@link Prisma.PostCreateInput} used to create a new Post
 * @returns the {@link Prisma.PostCreateInput} of the new User object
 * @throws a {@link PostMutationError} if there is a unique constraint violation
 * @throws a {@link PostInputValidationError} if the input is missing required fields
 */
export const createPost = async (
  input: object,
): Promise<Prisma.PostCreateInput> => {
  const validationErrors: ValidationErrorResponse[] = validateInputFields(
    input,
    requiredFields,
  );

  if (validationErrors.length > 0) {
    throw new PostInputValidationError("Invalid Post input.", validationErrors);
  }

  try {
    const postData = input as Prisma.PostCreateInput;

    return await prisma.post.create({ data: postData });
  } catch (err) {
    handleMutationError(err);
  }
};

/**
 * Handles Prisma client errors for User mutation operations. We handle errors
 * this way to limit information leakage of API/database internals to the
 * client.
 * @param err the error to handle
 * @throws a {@link PostMutationError} if there is a unique constraint violation or invalid inputs
 * @throws a {@link PostNotFoundError} if an entity is not found
 * @throws the original {@link Error} if it is not a Prisma client or request error
 */
const handleMutationError = (err: Error): void => {
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    switch (err.code) {
      case "P2003": {
        const error = {
          msg: "User is not authorized to perform this action.",
          type: "field",
          value: "userId",
        } as EntityMutationErrorResponse;

        throw new PostMutationError(
          "Post cannot be created as it would violate a foreign key constraint, i.e. associated User does not exist.",
          [error],
        );
      }
      case "P2025": {
        const error = {
          msg: "Post does not exist.",
        } as MissingResourceErrorResponse;

        throw new PostNotFoundError("Can't find Post to update or delete.", [
          error,
        ]);
      }
      default: {
        console.error(err);

        const error = {
          msg: "Encountered an unexpected error while procssing Post creation request.",
        } as EntityMutationErrorResponse;

        throw new PostMutationError(
          "Encountered an unexpected error while procssing Post creation request.",
          [error],
        );
      }
    }
  } else {
    throw err;
  }
};
