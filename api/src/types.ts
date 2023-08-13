/**
 * The PrismaMetaFields type is used to access the `meta` property of a
 * Prisma.PrismaClientKnownRequestError.
 * @see https://www.prisma.io/docs/reference/api-reference/error-reference#prismaclientknownrequesterror
 */
type PrismaMetaFields = {
  target: string[];
};

type MissingResouceError = {
  msg: string;
  resourceId?: number;
};

type ValidationError = {
  location: string;
  msg: string;
  path: string;
  type: string;
  value: string;
};

export { MissingResouceError, PrismaMetaFields, ValidationError };
