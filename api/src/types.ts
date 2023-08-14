type ErrorResponse =
  | MissingResourceErrorResponse
  | EntityMutationErrorResponse
  | ValidationErrorResponse;

type MissingResourceErrorResponse = {
  msg: string;
  resourceId?: number;
};

type EntityMutationErrorResponse = {
  msg: string;
  type?: string;
  value?: string;
};

type ValidationErrorResponse = {
  location?: string;
  msg: string;
  path?: string;
  type?: string;
  value?: string;
};

export {
  EntityMutationErrorResponse,
  ErrorResponse,
  MissingResourceErrorResponse,
  ValidationErrorResponse,
};
