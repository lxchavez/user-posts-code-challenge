import request from "supertest";
import { describe, expect, it } from "vitest";
import prisma from "../lib/prisma";
import app from "../index";

describe("User API integration tests", () => {
  describe("[POST] /api/users", () => {
    it("should respond with a 200 status code and User details", async () => {
      const { status, body } = await request(app).post("/api/users").send({
        fullName: "John Doe",
        email: "john.doe@email.com",
        username: "johndoe1377",
        dateOfBirth: "1970-01-01",
      });

      const newUser = await prisma.user.findFirst();
      expect(newUser).not.toBeNull();

      expect(status).toBe(200);
      expect(body.id).toBe(newUser?.id);
      expect(body.username).toBe("johndoe1377");
    });

    it("should respond with a mutation error response if input contains an email associated with another User", async () => {
      // Create a User with the OG email address.
      await request(app).post("/api/users").send({
        fullName: "John Doe",
        email: "john.doe@email.com",
        username: "johndoe1377",
        dateOfBirth: "1970-01-01",
      });

      // Attempt to create a User with the same email address.
      const { status, body } = await request(app).post("/api/users").send({
        fullName: "J. Robert Oppenheimer",
        email: "john.doe@email.com",
        username: "anon.scientist",
        dateOfBirth: "1904-04-22",
      });

      expect(status).toBe(400);
      expect(body).toHaveProperty("errors");
      expect(body["errors"].length).toEqual(1);
      expect(body["errors"][0]["type"]).toBe("field");
      expect(body["errors"][0]["value"]).toBe("email");
      expect(body["errors"][0]["msg"]).toBe(
        "User input contains duplicate identifiers.",
      );
    });

    it("should respond with a mutation error response if input contains a username associated with another User", async () => {
      // Create a User with the OG email address.
      await request(app).post("/api/users").send({
        fullName: "John Doe",
        email: "john.doe@email.com",
        username: "anon.scientist",
        dateOfBirth: "1970-01-01",
      });

      // Attempt to create a User with the same email address.
      const { status, body } = await request(app).post("/api/users").send({
        fullName: "J. Robert Oppenheimer",
        email: "oppenheimer@berkely.edu",
        username: "anon.scientist",
        dateOfBirth: "1904-04-22",
      });

      expect(status).toBe(400);
      expect(body).toHaveProperty("errors");
      expect(body["errors"].length).toEqual(1);
      expect(body["errors"][0]["type"]).toBe("field");
      expect(body["errors"][0]["value"]).toBe("username");
      expect(body["errors"][0]["msg"]).toBe(
        "User input contains duplicate identifiers.",
      );
    });

    it("should respond with an error response if input is missing a required field", async () => {
      const { status, body } = await request(app).post("/api/users").send({
        fullName: "John Doe",
        email: "john.doe@email.com",
        username: "johndoe1377",
        // dateOfBirth is missing
      });

      expect(status).toBe(400);
      expect(body).toHaveProperty("errors");
      expect(body["errors"].length).toEqual(1);
      expect(body["errors"][0]["path"]).toBe("dateOfBirth");
    });

    it("should respond with an error response if fullName is too long", async () => {
      const { status, body } = await request(app)
        .post("/api/users")
        .send({
          fullName: "X".repeat(256), // 256 characters
          email: "john.doe@gmail.com",
          username: "johndoe1377",
          dateOfBirth: "1970-01-01",
        });

      expect(status).toBe(400);
      expect(body).toHaveProperty("errors");
      expect(body["errors"].length).toEqual(1);
      expect(body["errors"][0]["msg"]).toBe(
        "fullName must be between 1 and 255 characters.",
      );
    });

    it("should respond with an error response if fullName is blank", async () => {
      const { status, body } = await request(app).post("/api/users").send({
        fullName: " ", // String with empty spaces
        email: "john.doe@gmail.com",
        username: "johndoe1377",
        dateOfBirth: "1970-01-01",
      });

      expect(status).toBe(400);
      expect(body).toHaveProperty("errors");
      expect(body["errors"].length).toEqual(1);
      expect(body["errors"][0]["msg"]).toBe(
        "fullName must not be empty or contain blanks.",
      );
    });

    it("should respond with an error response if input has an invalid email address", async () => {
      const { status, body } = await request(app).post("/api/users").send({
        fullName: "John Doe",
        email: "john.doe", // Invalid email address
        username: "johndoe1377",
        dateOfBirth: "1970-01-01",
      });

      expect(status).toBe(400);
      expect(body).toHaveProperty("errors");
      expect(body["errors"].length).toEqual(1);
      expect(body["errors"][0]["msg"]).toBe("Invalid email provided.");
    });

    it("should respond with an error response if username is too long", async () => {
      const { status, body } = await request(app)
        .post("/api/users")
        .send({
          fullName: "John Doe",
          email: "john.doe@gmail.com",
          username: "X".repeat(16),
          dateOfBirth: "1970-01-01",
        });

      expect(status).toBe(400);
      expect(body).toHaveProperty("errors");
      expect(body["errors"].length).toEqual(1);
      expect(body["errors"][0]["msg"]).toBe(
        "username must be less than or equal 15 characters.",
      );
    });

    it("should respond with an error response if username is blank", async () => {
      const { status, body } = await request(app).post("/api/users").send({
        fullName: "John Doe",
        email: "john.doe@gmail.com",
        username: " ", // String with empty spaces
        dateOfBirth: "1970-01-01",
      });

      expect(status).toBe(400);
      expect(body).toHaveProperty("errors");
      expect(body["errors"].length).toEqual(1);
      expect(body["errors"][0]["msg"]).toBe(
        "username must not be empty or contain blanks.",
      );
    });

    it("should respond with an error response if dateOfBirth is blank", async () => {
      const { status, body } = await request(app).post("/api/users").send({
        fullName: "John Doe",
        email: "john.doe@gmail.com",
        username: "johndoe1377",
        dateOfBirth: " ", // String with empty spaces
      });

      expect(status).toBe(400);
      expect(body).toHaveProperty("errors");
      expect(body["errors"].length).toEqual(2);
      expect(body["errors"][0]["msg"]).toBe(
        "dateOfBirth must be defined as an ISO 8601 string.",
      );
      expect(body["errors"][1]["msg"]).toBe(
        "dateOfBirth must be a valid date in the format YYYY-MM-DD.",
      );
    });

    it("should respond with an error response if dateOfBirth is invalid", async () => {
      const { status, body } = await request(app).post("/api/users").send({
        fullName: "John Doe",
        email: "john.doe@gmail.com",
        username: "johndoe1377",
        dateOfBirth: "January 1, 2020", // String with empty spaces
      });

      expect(status).toBe(400);
      expect(body).toHaveProperty("errors");
      expect(body["errors"].length).toEqual(1);
      expect(body["errors"][0]["msg"]).toBe(
        "dateOfBirth must be a valid date in the format YYYY-MM-DD.",
      );
    });

    it("should respond with an error response if request is empty", async () => {
      const { status, body } = await request(app).post("/api/users").send({});

      expect(status).toBe(400);
      expect(body).toHaveProperty("errors");
      expect(body["errors"].length).toEqual(1);
      expect(body["errors"][0]["msg"]).toBe(
        "Missing request body! Please send a JSON body with the request.",
      );
    });

    it("should respond with an error response if request is not an object", async () => {
      const { status, body } = await request(app).post("/api/users").send(null);

      expect(status).toBe(400);
      expect(body).toHaveProperty("errors");
      expect(body["errors"].length).toEqual(1);
      expect(body["errors"][0]["msg"]).toBe(
        "Missing request body! Please send a JSON body with the request.",
      );
    });
  });

  describe("[GET] /api/users/:id", () => {
    it("should respond with a 200 status code and User details", async () => {
      // First, create a new User.
      await request(app).post("/api/users").send({
        fullName: "Goldie Retrieve",
        email: "goldie@email.com",
        username: "dog.is.good",
        dateOfBirth: "1970-01-01",
      });

      // Look up the newly created User.
      const newUser = await prisma.user.findFirst();
      const userId = newUser?.id;

      // Retrieve the User by ID and verify data.
      const { status, body } = await request(app).get(`/api/users/${userId}`);

      expect(status).toBe(200);
      expect(body.username).toBe("dog.is.good");
    });

    it("should respond with an error response if the id is not an integer", async () => {
      const { status, body } = await request(app)
        .get("/api/users/bogusId")
        .send({});

      expect(status).toBe(400);
      expect(body).toHaveProperty("errors");
      expect(body["errors"].length).toEqual(1);
      expect(body["errors"][0]["msg"]).toBe(
        "Invalid id parameter. Must be a positive integer.",
      );
    });

    it("should respond with an error response if the id is an invalid integer", async () => {
      const { status, body } = await request(app).get("/api/users/-1").send({});

      expect(status).toBe(400);
      expect(body).toHaveProperty("errors");
      expect(body["errors"].length).toEqual(1);
      expect(body["errors"][0]["msg"]).toBe(
        "Invalid id parameter. Must be a positive integer.",
      );
    });

    it("should respond with an error response if the User does not exist", async () => {
      // Retrieve the User by ID and verify data.
      const { status, body } = await request(app).get("/api/users/420");

      expect(status).toBe(404);
      expect(body).toHaveProperty("errors");
      expect(body["errors"].length).toEqual(1);
      expect(body["errors"][0]["msg"]).toBe("User does not exist.");
    });
  });

  describe("[PUT] /api/users/:id", () => {
    it("should respond with a 200 status code and User details", async () => {
      // First, create a new User.
      const userResponse = await request(app).post("/api/users").send({
        fullName: "Goldie Retrieve",
        email: "goldie@email.com",
        username: "dog.is.good",
        dateOfBirth: "1970-01-01",
      });

      const userId = userResponse?.body.id;
      expect(userId).toBeDefined();

      // Retrieve the User by ID and verify data.
      const { status, body } = await request(app)
        .put(`/api/users/${userId}`)
        .send({
          fullName: "Max",
        });

      expect(status).toBe(200);
      expect(body.fullName).toBe("Max");
    });

    it("should respond with an error response if the User does not exist", async () => {
      const { status, body } = await request(app).put("/api/users/420").send({
        fullName: "Max",
      });

      expect(status).toBe(404);
      expect(body).toHaveProperty("errors");
      expect(body["errors"].length).toEqual(1);
      expect(body["errors"][0]["msg"]).toBe("User does not exist.");
    });

    it("should respond with an error response if the id is not an integer", async () => {
      const { status, body } = await request(app)
        .put("/api/users/bogusId")
        .send({});

      expect(status).toBe(400);
      expect(body).toHaveProperty("errors");
      expect(body["errors"].length).toEqual(1);
      expect(body["errors"][0]["msg"]).toBe(
        "Invalid id parameter. Must be a positive integer.",
      );
    });

    it("should respond with an error response if the id is an invalid integer", async () => {
      const { status, body } = await request(app).put("/api/users/-1").send({});

      expect(status).toBe(400);
      expect(body).toHaveProperty("errors");
      expect(body["errors"].length).toEqual(1);
      expect(body["errors"][0]["msg"]).toBe(
        "Invalid id parameter. Must be a positive integer.",
      );
    });
  });

  describe("[DELETE] /api/users/:id", () => {
    it("should respond with a 200 status code and User details", async () => {
      // First, create a new User.
      await request(app).post("/api/users").send({
        fullName: "Goldie Retrieve",
        email: "goldie@email.com",
        username: "dog.is.good",
        dateOfBirth: "1970-01-01",
      });

      // Look up the newly created User.
      const newUser = await prisma.user.findFirst();
      const userId = newUser?.id;

      // Delete the User by ID and verify response.
      const { status, body } = await request(app).delete(
        `/api/users/${userId}`,
      );

      expect(status).toBe(200);
      expect(body.id).toBe(userId);
    });

    it("should respond with a 200 status code and cascade delete the User's associated Posts", async () => {
      // First, create a new User.
      await request(app).post("/api/users").send({
        fullName: "Goldie Retrieve",
        email: "goldie@email.com",
        username: "dog.is.good",
        dateOfBirth: "1970-01-01",
      });

      // Look up the newly created User.
      const newUser = await prisma.user.findFirst();
      const userId = newUser?.id;

      // Create a new Post associated with the User.
      const postResponse = await request(app).post("/api/posts").send({
        title: "My First Post",
        content: "This is my first post.",
        userId: userId,
      });
      const postId = postResponse.body.id;

      // Delete the Use  and verify response.
      const userResponse = await request(app).delete(`/api/users/${userId}`);

      expect(userResponse.status).toBe(200);
      expect(userResponse.body.id).toBe(userId);

      // Verify that the Post was deleted.
      const post = await prisma.post.findFirst({
        where: {
          id: postId,
        },
      });

      expect(post).toBeNull();
    });

    it("should respond with an error response if the User does not exist", async () => {
      const { status, body } = await request(app).delete("/api/users/420");

      expect(status).toBe(404);
      expect(body).toHaveProperty("errors");
      expect(body["errors"].length).toEqual(1);
      expect(body["errors"][0]["msg"]).toBe("User does not exist.");
    });

    it("should respond with an error response if the id is not an integer", async () => {
      const { status, body } = await request(app).delete("/api/users/bogusId");

      expect(status).toBe(400);
      expect(body).toHaveProperty("errors");
      expect(body["errors"].length).toEqual(1);
      expect(body["errors"][0]["msg"]).toBe(
        "Invalid id parameter. Must be a positive integer.",
      );
    });

    it("should respond with an error response if the id is an invalid integer", async () => {
      const { status, body } = await request(app).delete("/api/users/-1");

      expect(status).toBe(400);
      expect(body).toHaveProperty("errors");
      expect(body["errors"].length).toEqual(1);
      expect(body["errors"][0]["msg"]).toBe(
        "Invalid id parameter. Must be a positive integer.",
      );
    });
  });
});
