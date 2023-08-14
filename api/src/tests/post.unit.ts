import { Prisma } from "@prisma/client";
import { describe, expect, it, vi } from "vitest";
import {
  createPost,
  deletePost,
  getAllUserPosts,
  getPost,
  updatePost,
} from "../entities/post";
import {
  PostNotFoundError,
  PostMutationError,
  PostInputValidationError,
} from "../errors/PostErrors";
import prisma from "../lib/__mocks__/prisma";
import { PostResponse } from "../types";

// Lets Vitest know that it should mock the module at the given path.
vi.mock("../lib/prisma");

describe("createPost unit tests", () => {
  it("should return the created Post with valid input", async () => {
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

  describe("getPostById unit tests", () => {
    describe("getPostById unit tests", () => {
      it("should return a Post for a given ID", async () => {
        const postId = 1;
        const post = {
          id: postId,
          userId: 1,
          title: "My first post",
          description: "This is my first post!",
          createdAt: new Date("2021-01-01T17:30:00.000Z"),
          updatedAt: new Date("2021-01-01T17:30:00.000Z"),
        };

        prisma.post.findUnique.mockResolvedValue(post);

        const result = await getPost(postId);

        expect(result).toStrictEqual(post);
      });

      it("should return an empty Post for a given ID if it does not exist", async () => {
        prisma.post.findUnique.mockResolvedValue(null);

        const bogusId = 1;
        const result = await getPost(bogusId);

        expect(result).toStrictEqual({} as PostResponse);
      });
    });
  });

  describe("updatePost unit tests", () => {
    it("should update an existing Post with valid updated input", async () => {
      const updatedPost = {
        id: 1,
        userId: 1,
        title: "My first post",
        description: "Wow, so much has changed...",
        createdAt: new Date("2021-01-01T17:30:00.000Z"),
        updatedAt: new Date("2021-01-01T17:30:00.000Z"),
      };

      prisma.post.update.mockResolvedValue(updatedPost);

      const result = await updatePost(1, 1, updatedPost);

      expect(result).toStrictEqual(updatedPost);
    });

    it("should throw an error when updating a Post with no updated fields", async () => {
      const updatedOist = {};
      await expect(updatePost(1, 1, updatedOist)).rejects.toThrow();
      await expect(updatePost(1, 1, updatedOist)).rejects.toThrowError(
        PostInputValidationError,
      );
    });

    it("should throw an error when updating a Post that no longer exists", async () => {
      const updatedPost = {
        id: 1,
        userId: 1,
        title: "Is this real life?",
        description: "Wow, so much has changed...",
        createdAt: new Date("2021-01-01T17:30:00.000Z"),
        updatedAt: new Date("2021-01-01T17:30:00.000Z"),
      };

      prisma.post.update.mockImplementation(() => {
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

      await expect(updatePost(1, 1, updatedPost)).rejects.toThrow();
      await expect(updatePost(1, 1, updatedPost)).rejects.toThrowError(
        PostNotFoundError,
      );
    });
  });

  describe("deletePost unit tests", () => {
    it("should delete existing Post from the databse", async () => {
      const existingPost = {
        id: 1,
        userId: 1,
        title: "My first post",
        description: "This is my first post!",
        createdAt: new Date("2021-01-01T17:30:00.000Z"),
        updatedAt: new Date("2021-01-01T17:30:00.000Z"),
      };

      prisma.post.delete.mockResolvedValue(existingPost);

      const user = await deletePost(1);
      expect(user).toStrictEqual({
        ...existingPost,
        id: 1,
        createdAt: new Date("2021-01-01T17:30:00.000Z"),
        updatedAt: new Date("2021-01-01T17:30:00.000Z"),
      });
    });

    it("should throw an error if the Post does not exist", async () => {
      prisma.post.delete.mockImplementation(() => {
        throw new Prisma.PrismaClientKnownRequestError(
          "An operation failed because it depends on one or more records that were required but not found. Record to update not found.",
          {
            code: "P2025",
            clientVersion: "1.0.0",
            meta: {
              cause: ["Record to delete does not exist."],
            },
          },
        );
      });

      await expect(deletePost(123)).rejects.toThrow();
      await expect(deletePost(123)).rejects.toThrowError(PostNotFoundError);
    });
  });
});
