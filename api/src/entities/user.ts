import { Prisma } from "@prisma/client";
import {
  UserInputValidationError,
  UserMutationError,
  UserNotFoundError,
} from "../errors/UserErrors";
import prisma from "../lib/prisma";
import {
  EntityMutationErrorResponse,
  MissingResourceErrorResponse,
  ValidationErrorResponse,
} from "../types";
import {
  formatFields,
  hasAllInputFields,
  hasAtLeastOneInputField,
} from "../utils";

// TODO: Get list of required fields from Prisma.UserCreateInput, maybe with reflection?
const requiredFields: string[] = [
  "fullName",
  "email",
  "username",
  "dateOfBirth",
];

/**
 * Creates a new User entity in our database.
 * @param data the {@link Prisma.UserCreateInput} used to create a new User
 * @returns the {@link Prisma.UserCreateInput} of the new User object
 * @throws a {@link UserMutationError} if there is a unique constraint violation
 * @throws a {@link UserInputValidationError} if the input is missing required fields
 */
export const createUser = async (
  input: object,
): Promise<Prisma.UserCreateInput> => {
  const validationErrors: ValidationErrorResponse[] = hasAllInputFields(
    input,
    requiredFields,
  );

  if (validationErrors.length > 0) {
    throw new UserInputValidationError("Invalid input", validationErrors);
  }

  try {
    const userData = input as Prisma.UserCreateInput;

    return await prisma.user.create({ data: userData });
  } catch (err) {
    handleMutationError(err);
  }
};

/**
 * Attempt to retrieve an existing User entity from our database.
 * @param userId the ID of the User to retrieve
 * @returns the {@link Prisma.User} object of the retrieved User
 * @throws a {@link UserNotFoundError} if the User with the given ID does not exist
 */
export const retrieveUser = async (userId: number) => {
  const user = await prisma.user.findUnique({
    where: {
      id: userId,
    },
  });

  if (!user) {
    const error = {
      msg: "User does not exist.",
      resourceId: userId,
    } as MissingResourceErrorResponse;
    throw new UserNotFoundError("User not found", [error]);
  }

  return user;
};

/**
 * Updates an existing User entity in our database.
 * @param userId the ID of the User to update
 * @param input the {@link Prisma.UserUpdateInput} used to update the User
 * @returns the {@link Prisma.UserUpdateInput} of the updated User object
 * @throws a {@link UserMutationError} if there is a unique constraint violation
 * @throws a {@link UserInputValidationError} if the input is missing required fields
 * @throws a {@link ResourceNotFound} if the User with the given ID does not exist
 */
export const updateUser = async (
  userId: number,
  input: object,
): Promise<Prisma.UserUpdateInput> => {
  const validationErrors: ValidationErrorResponse[] = hasAtLeastOneInputField(
    input,
    requiredFields,
  );

  if (validationErrors.length > 0) {
    throw new UserInputValidationError("Invalid input", validationErrors);
  }

  try {
    const userData = input as Prisma.UserUpdateInput;

    return await prisma.user.update({
      where: { id: userId },
      data: userData,
    });
  } catch (err) {
    handleMutationError(err);
  }
};

/**
 * Deletes an existing User entity from our database. We are opting
 * for a cascading delete strategy, so that all associated Posts
 * will be deleted as well. This is to ensure that we do not have
 * any orphaned Posts in our database and to support the User's "right
 * to be forgotten".
 * @param userId the ID of the User to delete
 * @returns the {@link Prisma.User} object of the deleted User
 * @see https://gdpr.eu/right-to-be-forgotten/
 */
export const deleteUser = async (userId: number) => {
  try {
    const user = await prisma.user.delete({
      where: { id: userId },
    });

    return user;
  } catch (err) {
    handleMutationError(err);
  }
};

/**
 * Handles Prisma client errors for User mutation operations. We handle errors
 * this way to limit information leakage of API/database internals to the
 * client.
 * @param err the error to handle
 * @throws a {@link UserMutationError} if there is a unique constraint violation or invalid inputs
 * @throws a {@link UserNotFoundError} if an entity is not found
 * @throws the original {@link Error} if it is not a Prisma client or request error
 */
const handleMutationError = (err: Error): void => {
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    switch (err.code) {
      case "P2002": {
        const error = {
          msg: "User input contains duplicate identifiers.",
          type: "field",
          value: formatFields(err.meta),
        } as EntityMutationErrorResponse;

        throw new UserMutationError(
          `User cannot be created with given input data.`,
          [error],
        );
      }
      case "P2025": {
        const error = {
          msg: "User does not exist.",
        } as MissingResourceErrorResponse;

        throw new UserNotFoundError("Can't find User to update or delete.", [
          error,
        ]);
      }
      default: {
        console.error(err);

        const error = {
          msg: "Encountered an unexpected error while procssing User creation request.",
        } as EntityMutationErrorResponse;

        throw new UserMutationError(
          "Encountered an unexpected error while procssing User creation request.",
          [error],
        );
      }
    }
  } else {
    throw err;
  }
};
