import request from "supertest";
import { describe, expect, it } from "vitest";
import app from "../index";

describe("Post API integration tests", () => {
  describe("[POST] /api/posts", () => {
    it("should respond with a 200 status code after creating a Post", async () => {
      // First, create a new User.
      const userResponse = await request(app).post("/api/users").send({
        fullName: "Goldie Retriever",
        email: "goldie@email.com",
        username: "dog.is.good",
        dateOfBirth: "1970-01-01",
      });
      const userId = userResponse.body.id;

      // Create a new Post associated with the User.
      const { status, body } = await request(app).post("/api/posts").send({
        userId: userId,
        title: "Hello",
        description: "I am definetly not a dog...",
      });

      expect(status).toBe(200);
      expect(body.userId).toBe(userId);
      expect(body.title).toBe("Hello");
      expect(body.description).toBe("I am definetly not a dog...");
    });

    it("should respond with an error response when creating a Post with a non-existent User", async () => {
      const { status, body } = await request(app).post("/api/posts").send({
        userId: 1, // User with id 1 does not exist
        title: "Hello",
        description: "I am definetly not a dog...",
      });

      expect(status).toBe(403);
      expect(body.errors.length).toBe(1);
      expect(body.errors[0]["msg"]).toBe(
        "User is not authorized to perform this action.",
      );
    });

    it("should respond with an error response when creating a Post with a missing required input field", async () => {
      const { status, body } = await request(app).post("/api/posts").send({
        userId: 1,
        // title is missing
        description: "I am definetly not a dog...",
      });

      expect(status).toBe(400);
      expect(body.errors.length).toBe(1);
      expect(body.errors[0]["msg"]).toBe("Missing required input: title");
    });

    it("should respond with an error response if request is not an object", async () => {
      const { status, body } = await request(app).post("/api/posts").send(null);

      expect(status).toBe(400);
      expect(body).toHaveProperty("errors");
      expect(
        body["errors"].some(
          (error) =>
            error["msg"] ===
            "Missing request body! Please send a JSON body with the request.",
        ),
      ).toBe(true);
    });
  });

  describe("[GET] /api/posts/:id", () => {
    it("should respond with a 200 status code after sucessfully updating a Post", async () => {
      const userResponse = await request(app).post("/api/users").send({
        fullName: "Goldie Retriever",
        email: "goldie@email.com",
        username: "dog.is.good",
        dateOfBirth: "1970-01-01",
      });
      const userId = userResponse.body.id;

      // Create a new Post associated with the User.
      const postResponse = await request(app).post("/api/posts").send({
        userId: userId,
        title: "Hello",
        description: "I am definetly not a dog...",
      });
      const postId = postResponse.body.id;

      // Get the Post by ID.
      const { status, body } = await request(app).get(`/api/posts/${postId}`);

      expect(status).toBe(200);
      expect(body.userId).toBe(userId);
      expect(body.title).toBe("Hello");
      expect(body.description).toBe("I am definetly not a dog...");
    });

    it("should respond with a 200 status code and an empty Post object for an ID that could not be found", async () => {
      const bogusPostId = 1;
      const { status, body } = await request(app).get(
        `/api/posts/${bogusPostId}`,
      );

      expect(status).toBe(200);
      expect(body).toStrictEqual({});
    });
  });

  describe("[PUT] /api/posts/:id", () => {
    it("should respond with a 200 status code after updating an existing Post", async () => {
      // First, create a new User.
      const userResponse = await request(app).post("/api/users").send({
        fullName: "Goldie Retriever",
        email: "goldie@email.com",
        username: "dog.is.good",
        dateOfBirth: "1970-01-01",
      });
      const userId = userResponse.body.id;

      // Create a new Post associated with the User.
      const originalPostResponse = await request(app).post("/api/posts").send({
        userId: userId,
        title: "Hello",
        description: "I am definetly not a dog...",
      });

      // Update the Post.
      const { status, body } = await request(app)
        .put(`/api/posts/${originalPostResponse.body.id}`)
        .send({
          userId: userId,
          description: "I am definetly not a dog...I am a cat!",
        });

      expect(status).toBe(200);
      expect(body.userId).toBe(userId);
      expect(body.title).toBe("Hello");
      expect(body.description).toBe("I am definetly not a dog...I am a cat!");
    });

    it("should respond with an error response when updating a Post with a non-existent User", async () => {
      // First, create a new User.
      const userResponse = await request(app).post("/api/users").send({
        fullName: "Goldie Retriever",
        email: "goldie@email.com",
        username: "dog.is.good",
        dateOfBirth: "1970-01-01",
      });

      // Create a new Post associated with the User.
      const userId = userResponse.body.id;

      const originalPostResponse = await request(app).post("/api/posts").send({
        userId: userId,
        title: "Hello",
        description: "I am definetly not a dog...",
      });

      const postId = originalPostResponse.body.id;
      const bogusUserId = userId + 1;

      const { status, body } = await request(app)
        .put(`/api/posts/${postId}`)
        .send({
          userId: bogusUserId,
          title: "Hello",
          description: "I am definetly not a dog...I am a cat!",
        });

      expect(status).toBe(404);
      expect(body.errors.length).toBe(1);
      expect(body.errors[0]["msg"]).toBe("Post does not exist.");
    });

    it("should respond with an error response when updating a Post with a missing required input field", async () => {
      // First, create a new User.
      const userResponse = await request(app).post("/api/users").send({
        fullName: "Goldie Retriever",
        email: "goldie@email.com",
        username: "dog.is.good",
        dateOfBirth: "1970-01-01",
      });
      const userId = userResponse.body.id;

      // Create a new Post associated with the User.
      const originalPostResponse = await request(app).post("/api/posts").send({
        userId: userId,
        title: "Hello",
        description: "I am definetly not a dog...",
      });

      const { status, body } = await request(app)
        .put(`/api/posts/${originalPostResponse.body.id}`)
        .send({
          userId,
          // title, description is missing
        });

      expect(status).toBe(400);
      expect(body).toHaveProperty("errors");
      expect(body.errors.length).toBe(1);
      expect(body.errors[0]["msg"]).toBe(
        "At least one of the input fields must be defined.",
      );
    });
  });

  describe("[DELETE] /api/posts/:id", () => {
    it("should respond with a 200 status code after deleting an existing post", async () => {
      // First, create a new User.
      const userResponse = await request(app).post("/api/users").send({
        fullName: "Goldie Retriever",
        email: "goldie@email.com",
        username: "dog.is.good",
        dateOfBirth: "1970-01-01",
      });
      const userId = userResponse.body.id;

      // Create a new Post associated with the User.
      const post = await request(app).post("/api/posts").send({
        userId: userId,
        title: "Hello",
        description: "I am definetly not a dog...",
      });

      // Delete the User by ID and verify response.
      const { status } = await request(app).delete(
        `/api/posts/${post.body.id}`,
      );

      expect(status).toBe(200);
    });

    it("should respond with an error response when attempting to delete a non-existent Post", async () => {
      const bogusPostId = 123;
      const { status, body } = await request(app).delete(
        `/api/posts/${bogusPostId}`,
      );

      expect(status).toBe(404);
      expect(body.errors.length).toBe(1);
      expect(body.errors[0]["msg"]).toBe("Post does not exist.");
    });
  });
});
