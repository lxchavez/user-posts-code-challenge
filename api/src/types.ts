/**
 * The PrismaMetaFields type is used to access the `meta` property of a
 * Prisma.PrismaClientKnownRequestError.
 * @see https://www.prisma.io/docs/reference/api-reference/error-reference#prismaclientknownrequesterror
 */
type PrismaMetaFields = {
  target: string[];
};

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
  MissingResourceErrorResponse,
  EntityMutationErrorResponse,
  PrismaMetaFields,
  ValidationErrorResponse,
};
