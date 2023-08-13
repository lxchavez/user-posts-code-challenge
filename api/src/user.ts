import { Prisma } from "@prisma/client";
import {
  ResourceNotFound,
  UserMutationError,
  UserInputValidationError,
} from "./errors/UserErrors";
import prisma from "./lib/prisma";
import { PrismaMetaFields } from "./types";

// TODO: Get list of required fields from Prisma.UserCreateInput, maybe with reflection?
const requiredUserFields: string[] = [
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
export const createUser = async (input: object) => {
  for (const field of requiredUserFields) {
    if (!(field in input)) {
      throw new UserInputValidationError(`Missing required input: ${field}`);
    }
  }

  try {
    const userData = input as Prisma.UserCreateInput;
    return await prisma.user.create({ data: userData });
  } catch (err) {
    handleUserMutationError(err);
  }
};

/**
 * Attempt to retrieve an existing User entity from our database.
 * @param userId the ID of the User to retrieve
 * @returns the {@link Prisma.User} object of the retrieved User
 * @throws a {@link ResourceNotFound} if the User with the given ID does not exist
 */
export const retrieveUser = async (userId: number) => {
  const user = await prisma.user.findUnique({
    where: {
      id: userId,
    },
  });

  if (!user) {
    throw new ResourceNotFound(`User with ID ${userId} does not exist`);
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
export const updateUser = async (userId: number, input: object) => {
  let hasAtLeastOneFieldToUpdate = false;
  for (const field of requiredUserFields) {
    if (
      field in input &&
      input[field] !== null &&
      input[field] !== undefined &&
      input[field] !== ""
    ) {
      hasAtLeastOneFieldToUpdate = true;
    }
  }

  if (!hasAtLeastOneFieldToUpdate) {
    throw new UserInputValidationError(
      "At least one field with populated data is required to update a User",
    );
  }

  try {
    const userData = input as Prisma.UserUpdateInput;
    return await prisma.user.update({
      where: { id: userId },
      data: userData,
      select: {
        id: true,
      },
    });
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
 * Handles Prisma client errors for User mutation operations. We handle errors
 * this way to limit information leakage of API/database internals to the
 * client.
 * @param err the error to handle
 * @throws a {@link UserMutationError} if there is a unique constraint violation or invalid inputs
 * @throws a {@link NotFoundError} if an entity is not found
 * @throws the original {@link Error} if it is not a Prisma client or request error
 */
const handleUserMutationError = (err: Error): void => {
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    switch (err.code) {
      case "P2002": {
        const fields = formatFields(err.meta);
        throw new UserMutationError(
          `User cannot be created with due to non-associabe fields: ${fields}`,
        );
      }
      case "P2025": {
        throw new ResourceNotFound("Can't find User to update or delete.");
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
