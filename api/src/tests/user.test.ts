import { Prisma } from "@prisma/client";
import { describe, expect, it, vi } from "vitest";
import { createUser } from "../user";
import {
  UserMutationError,
  UserInputValidationError,
} from "../errors/UserErrors";
import prisma from "../lib/__mocks__/prisma";

// Lets Vitest know that it should mock the module at the given path.
vi.mock("../lib/prisma");

describe("createUser", () => {
  it("should return the generated User with happy path input", async () => {
    const newUser = {
      fullName: "John Doe",
      email: "john.doe@example.com",
      username: "johndoe1377",
      dateOfBirth: new Date("1970-01-01"),
    };

    prisma.user.create.mockResolvedValue({
      ...newUser,
      id: 1,
      createdAt: new Date("2021-01-01T17:30:00.000Z"),
      updatedAt: new Date("2021-01-01T17:30:00.000Z"),
    });

    const user = await createUser(newUser);

    expect(user).toStrictEqual({
      ...newUser,
      id: 1,
      createdAt: new Date("2021-01-01T17:30:00.000Z"),
      updatedAt: new Date("2021-01-01T17:30:00.000Z"),
    });
  });

  it("should throw an error when creating a new User with duplicate input for a unique field", async () => {
    const newUser = {
      fullName: "John Doe",
      email: "john.doe@example.com",
      username: "johndoe1377",
      dateOfBirth: new Date("1970-01-01"),
    };

    prisma.user.create.mockImplementation(() => {
      throw new Prisma.PrismaClientKnownRequestError(
        "Unique constraint failed on the fields: (`email`)",
        {
          code: "P2002",
          clientVersion: "2.21.2",
          meta: {
            target: ["email"],
          },
        },
      );
    });

    await expect(createUser(newUser)).rejects.toThrow();
    await expect(createUser(newUser)).rejects.toThrowError(UserMutationError);
  });

  it("should throw an error if input contains a missing required field", async () => {
    const newUser = {
      fullName: "John Doe",
      email: "john.doe@example.com",
      username: "johndoe1377",
      // dateOfBirth is missing
    };

    await expect(createUser(newUser)).rejects.toThrow();
    await expect(createUser(newUser)).rejects.toThrowError(
      UserInputValidationError,
    );
  });

  it("should throw an error if input is null", async () => {
    await expect(createUser(null)).rejects.toThrow();
    await expect(createUser(null)).rejects.toThrowError(
      UserInputValidationError,
    );
  });

  it("should throw an error if input is not an object", async () => {
    const bogusObject = "bogusObject";

    await expect(createUser(bogusObject)).rejects.toThrow();
    await expect(createUser(bogusObject)).rejects.toThrowError(
      UserInputValidationError,
    );
  });
});
