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

export { UserMutationError };
