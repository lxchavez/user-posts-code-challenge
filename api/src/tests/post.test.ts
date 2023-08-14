import { Prisma } from "@prisma/client";
import { describe, expect, it, vi } from "vitest";
import { createPost, getAllUserPosts } from "../entities/post";
import {
  PostNotFoundError,
  PostMutationError,
  PostInputValidationError,
} from "../errors/PostErrors";
import prisma from "../lib/__mocks__/prisma";

// Lets Vitest know that it should mock the module at the given path.
vi.mock("../lib/prisma");

describe("createPost unit tests", () => {
  it("should return the created Post with happy path input", async () => {
    const newPost = {
      userId: 1,
      title: "My first post",
      description: "This is my first post!",
    };

    prisma.post.create.mockResolvedValue({
      ...newPost,
      id: 1,
      createdAt: new Date("2021-01-01T17:30:00.000Z"),
      updatedAt: new Date("2021-01-01T17:30:00.000Z"),
    });

    const user = await createPost(newPost);

    expect(user).toStrictEqual({
      ...newPost,
      id: 1,
      createdAt: new Date("2021-01-01T17:30:00.000Z"),
      updatedAt: new Date("2021-01-01T17:30:00.000Z"),
    });
  });

  it("should throw an error when creating a Post with a missing required input field", async () => {
    const newPost = {
      // Missing userId
      title: "My first post",
      description: "This is my first post!",
    };

    await expect(createPost(newPost)).rejects.toThrow();
    await expect(createPost(newPost)).rejects.toThrowError(
      PostInputValidationError,
    );
  });

  it("should throw an error when creating a Post with a non-existent User", async () => {
    const newPost = {
      userId: 1,
      title: "My first post",
      description: "This is my first post!",
    };

    prisma.post.create.mockImplementation(() => {
      throw new Prisma.PrismaClientKnownRequestError(
        "Foreign key constraint failed on the field: (`userId`)",
        {
          code: "P2003",
          clientVersion: "1.0.0",
          meta: {
            target: ["userId"],
          },
        },
      );
    });

    await expect(createPost(newPost)).rejects.toThrow();
    await expect(createPost(newPost)).rejects.toThrowError(PostMutationError);
  });

  describe("getAllUserPosts unit tests", () => {
    it("should return all Posts for a given User", async () => {
      const userId = 1;
      const posts = [
        {
          id: 1,
          userId,
          title: "My first post",
          description: "This is my first post!",
          createdAt: new Date("2021-01-01T17:30:00.000Z"),
          updatedAt: new Date("2021-01-01T17:30:00.000Z"),
        },
        {
          id: 2,
          userId,
          title: "My second post",
          description: "This is my second post!",
          createdAt: new Date("2021-01-02T17:30:00.000Z"),
          updatedAt: new Date("2021-01-02T17:30:00.000Z"),
        },
      ];

      prisma.post.findMany.mockResolvedValue(posts);

      const result = await getAllUserPosts(userId);

      expect(result).toStrictEqual(posts);
    });
  });
});
