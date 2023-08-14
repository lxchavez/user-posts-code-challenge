import { ValidationErrorResponse } from "./types";

// Define re-usable helper functions here.

/**
 * Validates that the input object contains all required fields.
 * @param input the object containing the input fields to check
 * @param requiredFields the list of required fields against
 * @returns a list of {@link ValidationErrorResponse} objects if there are any validation errors detected
 */
export const hasAllInputFields = (
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

/**
 * Validates that the input object contains at least one of the required fields.
 * @param input the object containing the input fields to check
 * @param fieldSet the list of fields to check against
 * @returns a list of {@link ValidationErrorResponse} objects if there are any validation errors detected
 */
export const hasAtLeastOneInputField = (
  input: object,
  fieldSet: string[],
): ValidationErrorResponse[] => {
  const validationErrors: ValidationErrorResponse[] = [];

  for (const field of fieldSet) {
    if (field in input) {
      return validationErrors;
    }
  }

  validationErrors.push({
    msg: "At least one of the input fields must be defined.",
    type: "field",
    value: fieldSet.join(", "),
  } as ValidationErrorResponse);

  return validationErrors;
};
