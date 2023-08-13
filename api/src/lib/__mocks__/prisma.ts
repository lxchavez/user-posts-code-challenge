import { PrismaClient } from "@prisma/client";
import { beforeEach } from "vitest";
import { mockDeep, mockReset } from "vitest-mock-extended";

beforeEach(() => {
  mockReset(prisma);
});

// Creates and exports a "deep mock" of Prisma Client using vitest-mock-extended.
const prisma = mockDeep<PrismaClient>();

export default prisma;
