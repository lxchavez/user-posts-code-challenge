import request from "supertest";
import { describe, expect, it } from "vitest";
import app from "../index";

describe("Post API integration tests", () => {
  describe("[POST] /api/posts", () => {
    it("should respond with a 200 status code and Post details", async () => {
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

    it("should respond with an error response when creating a Post with a missing userId", async () => {
      const { status, body } = await request(app).post("/api/posts").send({
        // userId is missing
        title: "Hello",
        description: "I am definetly not a dog...",
      });

      expect(status).toBe(400);
      expect(body.errors.length).toBe(1);
      expect(body.errors[0]["msg"]).toBe(
        "userId must be defined as part of the Post request as a non-negative integer.",
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

    it("should respond with an error response when creating a Post with a long title", async () => {
      const { status, body } = await request(app)
        .post("/api/posts")
        .send({
          userId: 1,
          title: "Hello".repeat(21),
          description: "I am definetly not a dog...",
        });

      expect(status).toBe(400);
      expect(body.errors.length).toBe(1);
      expect(body.errors[0]["msg"]).toBe(
        "title must be between 1 and 20 characters.",
      );
    });

    it("should respond with an error response when creating a Post with a blank title", async () => {
      const { status, body } = await request(app).post("/api/posts").send({
        userId: 1,
        title: " ",
        description: "I am definetly not a dog...",
      });

      expect(status).toBe(400);
      expect(body.errors.length).toBe(1);
      expect(body.errors[0]["msg"]).toBe(
        "title must not be empty or contain blanks.",
      );
    });

    it("should respond with an error response when creating a Post with an invalid title", async () => {
      const { status, body } = await request(app)
        .post("/api/posts")
        .send({
          userId: 1,
          title: { manifesto: "Dog days are over" },
          description: "I am definetly not a dog...",
        });

      expect(status).toBe(400);
      expect(body.errors.length).toBe(1);
      expect(body.errors[0]["msg"]).toBe("Invalid value");
    });

    it("should respond with an error response when creating a Post with a long description", async () => {
      const { status, body } = await request(app)
        .post("/api/posts")
        .send({
          userId: 1,
          title: "Hello",
          description: "X".repeat(141),
        });

      expect(status).toBe(400);
      expect(body.errors.length).toBe(1);
      expect(body.errors[0]["msg"]).toBe(
        "description must be between 1 and 140 characters, just like OG Twitter!",
      );
    });

    it("should respond with an error response when creating a Post with a blank description", async () => {
      const { status, body } = await request(app).post("/api/posts").send({
        userId: 1,
        title: "Hello",
        description: " ",
      });

      expect(status).toBe(400);
      expect(body.errors.length).toBe(1);
      expect(body.errors[0]["msg"]).toBe(
        "description must not be empty or contain blanks.",
      );
    });

    it("should respond with an error response when creating a Post with an invalid description", async () => {
      const { status, body } = await request(app)
        .post("/api/posts")
        .send({
          userId: 1,
          title: "Hello",
          description: { shoppingList: ["dog treats"] },
        });

      expect(status).toBe(400);
      expect(body.errors.length).toBe(1);
      expect(body.errors[0]["msg"]).toBe("Invalid value");
    });

    it("should respond with an error response if request is empty", async () => {
      const { status, body } = await request(app).post("/api/posts").send({});

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
    it("should respond with a 200 status code and the Post for an existing post", async () => {
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
});
