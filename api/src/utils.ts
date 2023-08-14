import { PrismaMetaFields, ValidationErrorResponse } from "./types";

// Define re-usable helper functions here.

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
 * Validates that the input object contains all required fields.
 * @param input the object containing the input fields to check
 * @param requiredFields the list of required fields
 * @returns a list of {@link ValidationErrorResponse} objects if there are any validation errors detected
 */
export const validateInputFields = (
  input: object,
  requiredFields: string[],
): ValidationErrorResponse[] => {
  const validationErrors: ValidationErrorResponse[] = [];

  for (const field of requiredFields) {
    if (!(field in input)) {
      validationErrors.push({
        location: "body",
        msg: `Missing required input: ${field}`,
        path: field,
        type: "field",
        value: input[field],
      } as ValidationErrorResponse);
    }
  }

  return validationErrors;
};
