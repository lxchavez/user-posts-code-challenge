import {
  EntityMutationErrorResponse,
  MissingResourceErrorResponse,
  ValidationErrorResponse,
} from "../types";

/**
 * Error invalid or missing request inputs for Post creation.
 * @param message the error message
 * @param errors the list of {@link ValidationErrorResponse} errors
 */
class PostInputValidationError extends Error {
  public errors: ValidationErrorResponse[];

  constructor(message: string, errors: ValidationErrorResponse[]) {
    super(message);
    this.errors = errors;

    // Set the prototype explicitly (important for instanceof checks)
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

/**
 * Error for Create, Update, Delete operations of Post entities.
 * @param message the error message
 * @param errors the list of {@link EntityMutationErrorResponse} errors
 */
class PostMutationError extends Error {
  public errors: EntityMutationErrorResponse[];

  constructor(message: string, errors: EntityMutationErrorResponse[]) {
    super(message);
    this.errors = errors;

    // Set the prototype explicitly (important for instanceof checks)
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

/**
 * Error for when a Post is not found.
 * @param message the error message
 *
 */
class PostNotFoundError extends Error {
  public errors: MissingResourceErrorResponse[];

  constructor(message: string, errors: MissingResourceErrorResponse[]) {
    super(message);
    this.errors = errors;

    // Set the prototype explicitly (important for instanceof checks)
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export { PostInputValidationError, PostMutationError, PostNotFoundError };
