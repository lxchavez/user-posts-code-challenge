import { Prisma, PrismaClient } from "@prisma/client";
import { UserMutationError } from "./errors/UserErrors";
import { PrismaMetaFields } from "./types";

export const prisma = new PrismaClient();

/**
 * Creates a new User entity in our database.
 * @param data the {@link Prisma.UserCreateInput} used to create a new User
 * @returns the {@link Prisma.UserCreateInput}
 * @throws a {@link UserMutationError} if there is a unique constraint violation or invalid inputs
 */
export const createUser = async (
  data: Prisma.UserCreateInput,
): Promise<Prisma.UserCreateInput> => {
  try {
    return await prisma.user.create({ data });
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
 * @throws the original {@link Error} if it is not a Prisma client or request error
 */
const handleUserMutationError = (err: Error): void => {
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    // The .code property can be accessed in a type-safe manner
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
  } else if (err instanceof Prisma.PrismaClientValidationError) {
    throw new UserMutationError(
      "Invalid or missing inputs given for User creation.",
    );
  } else {
    throw err;
  }
};
