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
      expect(body["errors"][0]["msg"]).toBe(
        "User cannot be created at this time.",
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
      expect(body["errors"][0]["msg"]).toBe(
        "User cannot be created at this time.",
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

  describe("[GET] /api/users/:id/posts", () => {
    it("should respond with a 200 status code and all Posts associated with a User", async () => {
      // First, create a new User.
      await request(app).post("/api/users").send({
        fullName: "Goldie Retriever",
        email: "goldie@email.com",
        username: "dog.is.good",
        dateOfBirth: "1970-01-01",
      });

      // Look up the newly created User.
      const newUser = await prisma.user.findFirst();
      const userId = newUser?.id;
      expect(userId).toBeDefined();

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

      // Create the Posts.
      const promises = posts.map(async (post) => {
        await request(app).post("/api/posts").send(post);
      });
      await Promise.all(promises);

      // Retrieve the User's posts.
      const { status, body } = await request(app).get(
        `/api/users/${userId}/posts`,
      );

      expect(status).toBe(200);
      expect(body.length).toBe(2);
    });

    it("should respond with a 200 status code an empty lists of Posts for a User that does not exist", async () => {
      const bogusUserId = 420;
      const { status, body } = await request(app).get(
        `/api/users/${bogusUserId}/posts`,
      );

      expect(status).toBe(200);
      expect(body.length).toBe(0);
    });
  });

  describe("[PUT] /api/users/:id", () => {
    it("should respond with a 200 status code after successully updaing an existing User", async () => {
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

    it("should respond with an error response if the updated input is missing required fields", async () => {
      // First, create a new User.
      const userResponse = await request(app).post("/api/users").send({
        fullName: "Goldie Retrieve",
        email: "goldie@email.com",
        username: "dog.is.good",
        dateOfBirth: "1970-01-01",
      });

      const userId = userResponse.body.id;

      const { status, body } = await request(app)
        .put(`/api/users/${userId}`)
        .send({
          bogusField: "bogusValue",
        });

      expect(status).toBe(400);
      expect(body).toHaveProperty("errors");
      expect(body["errors"].length).toEqual(1);
      expect(body["errors"][0]["msg"]).toBe(
        "At least one of the input fields must be defined.",
      );
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
