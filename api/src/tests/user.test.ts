import { Prisma } from "@prisma/client";
import { describe, expect, it, vi } from "vitest";
import { createUser, updateUser } from "../user";
import {
  ResourceNotFound,
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
          clientVersion: "1.0.0",
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
});

describe("updateUser", () => {
  it("should update the User with valid input", async () => {
    const updatedUser = {
      fullName: "Jane Doe",
      email: "jane.doe@example.com",
      username: "janedoe123",
      dateOfBirth: new Date("1980-02-02"),
    };

    const id = 1;

    prisma.user.update.mockResolvedValue({
      ...updatedUser,
      id: id,
      createdAt: new Date("2021-01-01T17:30:00.000Z"),
      updatedAt: new Date("2021-01-01T17:30:00.000Z"),
    });

    const user = await updateUser(id, updatedUser);

    expect(user).toStrictEqual({
      ...updatedUser,
      id: id,
      createdAt: new Date("2021-01-01T17:30:00.000Z"),
      updatedAt: new Date("2021-01-01T17:30:00.000Z"),
    });
  });

  it("should throw an error if updating a non-existing User", async () => {
    const nonExistingId = 999;
    const updatedUser = {
      email: "jane.doe@example.com",
    };

    prisma.user.update.mockImplementation(() => {
      throw new Prisma.PrismaClientKnownRequestError(
        "An operation failed because it depends on one or more records that were required but not found. Record to update not found.",
        {
          code: "P2025",
          clientVersion: "1.0.0",
          meta: {
            cause: ["Record to update not found."],
          },
        },
      );
    });

    await expect(updateUser(nonExistingId, updatedUser)).rejects.toThrow();
    await expect(updateUser(nonExistingId, updatedUser)).rejects.toThrowError(
      ResourceNotFound,
    );
  });

  it("should throw an error when updating a User with duplicate input for a unique field", async () => {
    const updatedUser = {
      email: "jane.doe@example.com", // Assume this is a duplicate email
    };

    const id = 1;

    prisma.user.update.mockImplementation(() => {
      throw new Prisma.PrismaClientKnownRequestError(
        "Unique constraint failed on the fields: (`email`)",
        {
          code: "P2002",
          clientVersion: "1.0.0",
          meta: {
            target: ["email"],
          },
        },
      );
    });

    await expect(updateUser(id, updatedUser)).rejects.toThrow();
    await expect(updateUser(id, updatedUser)).rejects.toThrowError(
      UserMutationError,
    );
  });
});
