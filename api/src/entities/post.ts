import { Prisma } from "@prisma/client";
import {
  PostInputValidationError,
  PostMutationError,
  PostNotFoundError,
} from "../errors/PostErrors";
import prisma from "../lib/prisma";
import {
  EntityMutationErrorResponse,
  MissingResourceErrorResponse,
  PostResponse,
  ValidationErrorResponse,
} from "../types";
import { hasAllInputFields, hasAtLeastOneInputField } from "../utils";

/**
 * Creates a new Post entity in our database.
 * @param data the {@link Prisma.PostCreateInput} used to create a new Post
 * @returns the {@link Prisma.PostCreateInput} of the new User object
 * @throws a {@link PostMutationError} if there is a unique constraint violation
 * @throws a {@link PostInputValidationError} if the input is missing required fields
 */
export const createPost = async (
  input: object,
): Promise<Prisma.PostCreateInput> => {
  const validationErrors: ValidationErrorResponse[] = hasAllInputFields(input, [
    "userId",
    "title",
    "description",
  ]);

  if (validationErrors.length > 0) {
    throw new PostInputValidationError("Invalid Post input.", validationErrors);
  }

  try {
    const postData = input as Prisma.PostCreateInput;

    return await prisma.post.create({ data: postData });
  } catch (err) {
    handleMutationError(err);
  }
};

/**
 * Retrieves all Posts associated with a specific User account.
 * @param userId the ID of the User to retrieve Posts for
 * @returns an array of {@link PostResponse} objects or an empty array if no Posts are found
 */
export const getAllUserPosts = async (
  userId: number,
): Promise<PostResponse[]> => {
  const posts: PostResponse[] = await prisma.post.findMany({
    where: {
      userId: userId,
    },
  });

  return posts;
};

/**
 * Retrieves a specific Post entity from our database. If the Post
 * does not exist, we simply return an empty  {@link PostResponse}
 * object.
 * @param postId the ID of the Post to retrieve
 * @return the {@link PostResponse} object of the retrieved Post
 */
export const getPost = async (postId: number): Promise<PostResponse> => {
  const post: PostResponse = await prisma.post.findUnique({
    where: {
      id: postId,
    },
  });

  if (!post) {
    return {} as PostResponse;
  }

  return post;
};

/**
 * Updates an existing Post entity in our database.
 * @param postId the ID of the Post to update
 * @param userId the ID of the User who owns the Post
 * @param input the raw input data to update the Post with
 * @returns the {@link Prisma.PostUpdateInput} of the updated Post object
 * @throws a {@link PostMutationError} if there is a unique constraint violation
 * @throws a {@link PostInputValidationError} if the input is missing required fields
 * @throws a {@link PostNotFoundError} if the Post with the given ID does not exist
 */
export const updatePost = async (
  postId: number,
  userId: number,
  input: object,
): Promise<Prisma.PostUpdateInput> => {
  const validationErrors: ValidationErrorResponse[] = hasAtLeastOneInputField(
    input,
    ["title", "description"],
  );

  if (validationErrors.length > 0) {
    throw new PostInputValidationError("Invalid input", validationErrors);
  }

  try {
    const postData = input as Prisma.PostUpdateInput;

    return await prisma.post.update({
      where: { id: postId, userId: userId },
      data: postData,
    });
  } catch (err) {
    handleMutationError(err);
  }
};

/**
 * Handles Prisma client errors for Post mutation operations. We handle errors
 * this way to limit information leakage of API/database internals to the
 * client.
 * @param err the error to handle
 * @throws a {@link PostMutationError} if there is a unique constraint violation or invalid inputs
 * @throws a {@link PostNotFoundError} if an entity is not found
 * @throws the original {@link Error} if it is not a Prisma client or request error
 */
const handleMutationError = (err: Error): void => {
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    switch (err.code) {
      case "P2003": {
        const error = {
          msg: "User is not authorized to perform this action.",
          type: "field",
          value: "userId",
        } as EntityMutationErrorResponse;

        throw new PostMutationError(
          "Post cannot be created as it would violate a foreign key constraint, i.e. associated User does not exist.",
          [error],
        );
      }
      case "P2025": {
        const error = {
          msg: "Post does not exist.",
        } as MissingResourceErrorResponse;

        throw new PostNotFoundError("Can't find Post to update or delete.", [
          error,
        ]);
      }
    }
  }
};
