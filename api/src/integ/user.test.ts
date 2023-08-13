import request from "supertest";
import { describe, expect, it } from "vitest";
import prisma from "../lib/prisma";
import app from "../index";

describe("API integration tests", () => {
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

    it("should respond with an error response if userName is blank", async () => {
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
});
