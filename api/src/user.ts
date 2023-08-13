import { Prisma } from "@prisma/client";
import {
  UserMutationError,
  UserInputValidationError,
} from "./errors/UserErrors";
import prisma from "./lib/prisma";
import { PrismaMetaFields } from "./types";

/**
 * Creates a new User entity in our database.
 * @param data the {@link Prisma.UserCreateInput} used to create a new User
 * @returns the {@link Prisma.UserCreateInput} of the new User object
 * @throws a {@link UserMutationError} if there is a unique constraint violation or invalid inputs
 */
export const createUser = async (user: unknown) => {
  validateUserInput(user);

  try {
    const userData = user as Prisma.UserCreateInput;
    return await prisma.user.create({ data: userData });
  } catch (err) {
    handleUserMutationError(err);
  }
};

/**
 * Collects the fields from a Prisma.PrismaClientKnownRequestError.
 * @param meta the `meta` property of a Prisma.PrismaClientKnownRequestError
 * @returns a comma-separated string of fields
 */
export const formatFields = (meta: Record<string, unknown>): string => {
  if (!meta["target"]) {
    return "Unknown field(s)";
  }

  const fields: string[] = (meta as PrismaMetaFields).target.map(String);
  return fields.join(", ");
};

/**
 * Validates the User data input by the client.
 * @param input the User data input by the client
 * @throws a {@link UserInputValidationError} if the input is not an object or is null
 * @throws a {@link UserInputValidationError} if the input is missing a required field
 */
const validateUserInput = (input: unknown) => {
  if (typeof input !== "object" || input === null) {
    throw new UserInputValidationError("Invalid input given for User");
  }

  // TODO: Get list of required fields from Prisma.UserCreateInput, maybe with reflection?
  const requiredFields: string[] = [
    "fullName",
    "email",
    "username",
    "dateOfBirth",
  ];

  for (const field of requiredFields) {
    if (!(field in input)) {
      throw new UserInputValidationError(`Missing required input: ${field}`);
    }
  }
};

/**
 * Handles Prisma client errors for User mutation operations. We handle errors
 * this way to limit information leakage of API/database internals to the
 * client.
 * @param err the error to handle
 * @throws a {@link UserMutationError} if there is a unique constraint violation or invalid inputs
 * @throws the original {@link Error} if it is not a Prisma client or request error
 */
const handleUserMutationError = (err: Error): void => {
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    switch (err.code) {
      case "P2002": {
        const fields = formatFields(err.meta);
        throw new UserMutationError(
          `There is a unique constraint violation, a new User cannot be created with given input fields: ${fields}`,
        );
      }
      default: {
        console.error(err);
        throw new UserMutationError(
          "Encountered an error while procssing User creation request.",
        );
      }
    }
  } else {
    throw err;
  }
};
