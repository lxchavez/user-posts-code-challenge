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

type PostResponse = {
  id: number;
  title: string;
  description: string;
  createdAt: Date;
  updatedAt: Date;
  userId: number;
};

export {
  EntityMutationErrorResponse,
  ErrorResponse,
  MissingResourceErrorResponse,
  PostResponse,
  ValidationErrorResponse,
};
