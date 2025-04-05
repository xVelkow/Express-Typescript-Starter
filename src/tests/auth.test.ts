import { app, server } from "../index";
import redis from "@core/database/redis";
import request from "supertest";
import { afterAll, describe, test, expect } from "@jest/globals";

afterAll(async () => {
  await redis.quit();
  server.close();
})

// Checks for missing credentials
test("POST /api/auth/login - should return 400 for missing credentials", async () => {
  const response = await request(app)
    .post("/api/auth/login")
    .send({ username: "", password: "" });
  expect(response.status).toBe(401);
  expect(response.body.message).toBe("Missing credentials");
});

// Checks for wrong credentials
test("POST /api/auth/login - should return 401 for invalid credentials", async () => {
  const response = await request(app)
    .post("/api/auth/login")
    .send({ username: "invaliduser", password: "invalidpassword" });
  expect(response.status).toBe(401);
  expect(response.body.message).toBe("Invalid credentials");
});

// Checks for wrong password
test("POST /api/auth/login - should return 401 for invalid password", async () => {
  const response = await request(app)
    .post("/api/auth/login")
    .send({ username: "testuser", password: "invalidpassword" });
  expect(response.status).toBe(401);
  expect(response.body.message).toBe("Invalid credentials");
});

// Checks for login with valid credentials - username and password
test("POST /api/auth/login - should return 200 for valid credentials with username", async () => {
  const response = await request(app)
    .post("/api/auth/login")
    .send({ username: "testuser", password: "testpassword" });

  expect(response.status).toBe(200);
  expect(response.body.message).toBe("User logged in successfully");
});

// Checks for login with valid credentials - email and password
test("POST /api/auth/login - should return 200 for valid credentials with email", async () => {
  const response = await request(app)
    .post("/api/auth/login")
    .send({ username: "testuser@test.com", password: "testpassword" });

  expect(response.status).toBe(200);
  expect(response.body.message).toBe("User logged in successfully");
});

// Checks logout functionality
test("POST /api/auth/logout - should return 200 for successful logout", async () => {
  const response = await request(app)
    .post("/api/auth/logout");
  expect(response.status).toBe(200);
  expect(response.body.message).toBe("User logged out successfully");
});

// Checks for invalid login with null credentials
test("POST /api/auth/login - should return 400 for null credentials", async () => {
  const response = await request(app)
    .post("/api/auth/login")
    .send({ username: null, password: null });
  expect(response.status).toBe(401);
  expect(response.body.message).toBe("Missing credentials");
});

// Checks if session cookie is set on successful login
test("POST /api/auth/login - should set a session cookie on successful login", async () => {
  const response = await request(app)
    .post("/api/auth/login")
    .send({ username: "testuser", password: "testpassword" });

  expect(response.status).toBe(200);
  expect(response.headers['set-cookie']).toBeDefined(); // Check for session cookie
});