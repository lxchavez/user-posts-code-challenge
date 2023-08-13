/**
 * Error for Create, Update, Delete operations of User entities.
 * @param message the error message
 */
class UserMutationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "UserMutationError";

    // Set the prototype explicitly (important for instanceof checks)
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

/**
 * Error invalid or missing request inputs for User creation.
 * @param message the error message
 */
class UserInputValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "UserInputValidationError";

    // Set the prototype explicitly (important for instanceof checks)
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export { UserMutationError, UserInputValidationError };
