type EntityMutationErrorResponse = {
  msg: string;
  type?: string;
  value?: string;
};

type ErrorResponse =
  | MissingResourceErrorResponse
  | EntityMutationErrorResponse
  | ValidationErrorResponse;

type MissingResourceErrorResponse = {
  msg: string;
  resourceId?: number;
};

type PostResponse = {
  id: number;
  title: string;
  description: string;
  createdAt: Date;
  updatedAt: Date;
  userId: number;
};

type UserResponse = {
  id: number;
  fullName: string;
  email: string;
  username: string;
  dateOfBirth: Date;
  createdAt: Date;
  updatedAt: Date;
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
  PostResponse,
  UserResponse,
  ValidationErrorResponse,
};
