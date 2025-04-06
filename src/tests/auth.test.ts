import { app, server } from "../index";
import redis from "@core/database/redis";
import request from "supertest";
import { afterAll, beforeAll, beforeEach, afterEach, describe, test, expect } from "@jest/globals";
import { hashPassword } from "@features/auth/utils/password.utils";
import { createTestUser, deleteTestUser } from "@features/auth/models/user.model";
import { desc } from "drizzle-orm";

// Test credentials
const testCredentials = {
  username: "testuser",
  email: "testuser@test.com",
  password: "testpassword",
};

let authCookie: string | string[] | null;

describe("Authentication API", () => {
  // Global setup: Create test user before all tests
  beforeAll(async () => {
    await createTestUser({
      username: testCredentials.username,
      email: testCredentials.email,
      password: await hashPassword(testCredentials.password),
    });
  });

  // Global teardown: Cleanup test user and close connections
  afterAll(async () => {
    // Ensure any remaining session is logged out
    if (authCookie) {
      await request(app)
        .post("/api/auth/logout")
        .set("Cookie", Array.isArray(authCookie) ? authCookie : authCookie ? [authCookie] : []);
      authCookie = null;
    }
    
    await deleteTestUser(testCredentials.username);
    await redis.quit();
    server.close();
  });

  // Logout after each test to ensure clean state
  afterEach(async () => {
    if (authCookie) {
      await request(app)
        .post("/api/auth/logout")
        .set("Cookie", Array.isArray(authCookie) ? authCookie : authCookie ? [authCookie] : []);
      authCookie = null;
    }
  });

  describe("Login Endpoint", () => {
    describe("Invalid Login Scenarios", () => {
      test("should return 401 for empty credentials", async () => {
        const response = await request(app)
          .post("/api/auth/login")
          .send({ usernameOrEmail: "", password: "" });

        expect(response.status).toBe(401);
        expect(response.body.message).toBe("Missing credentials");
      });

      test("should return 401 for null credentials", async () => {
        const response = await request(app)
          .post("/api/auth/login")
          .send({ usernameOrEmail: null, password: null });

        expect(response.status).toBe(401);
        expect(response.body.message).toBe("Missing credentials");
      });

      test("should return 401 for undefined credentials", async () => {
        const response = await request(app)
          .post("/api/auth/login")
          .send({});

        expect(response.status).toBe(401);
        expect(response.body.message).toBe("Missing credentials");
      });

      test("should return 401 for invalid username and password", async () => {
        const response = await request(app)
          .post("/api/auth/login")
          .send({ usernameOrEmail: "invaliduser", password: "invalidpassword" });

        expect(response.status).toBe(401);
        expect(response.body.message).toBe("Invalid credentials");
      });

      test("should return 401 for valid username but wrong password", async () => {
        const response = await request(app)
          .post("/api/auth/login")
          .send({ usernameOrEmail: testCredentials.username, password: "wrongpassword" });

        expect(response.status).toBe(401);
        expect(response.body.message).toBe("Invalid credentials");
      });

      test("should return 401 for valid email but wrong password", async () => {
        const response = await request(app)
          .post("/api/auth/login")
          .send({ usernameOrEmail: testCredentials.email, password: "wrongpassword" });

        expect(response.status).toBe(401);
        expect(response.body.message).toBe("Invalid credentials");
      });
    });

    describe("Valid Login Scenarios", () => {
      test("should return 200 for valid username login", async () => {
        const response = await request(app)
          .post("/api/auth/login")
          .send({ usernameOrEmail: testCredentials.username, password: testCredentials.password });

        expect(response.status).toBe(200);
        expect(response.body.message).toBe("User logged in successfully");
        expect(response.body.user).toBeDefined();
        expect(response.body.user.username).toBe(testCredentials.username);
        expect(response.body.user.email).toBe(testCredentials.email);
        expect(response.body.user.password).toBeUndefined(); // Password should not be returned

        // Save cookie for session tests
        authCookie = response.headers["set-cookie"];
      });

      test("should return 200 for valid email login", async () => {
        const response = await request(app)
          .post("/api/auth/login")
          .send({ usernameOrEmail: testCredentials.email, password: testCredentials.password });

        expect(response.status).toBe(200);
        expect(response.body.message).toBe("User logged in successfully");
        expect(response.body.user).toBeDefined();
        expect(response.body.user.username).toBe(testCredentials.username);
        expect(response.body.user.email).toBe(testCredentials.email);
        
        // Save cookie for session tests
        authCookie = response.headers["set-cookie"];
      });

      test("should set a session cookie on successful login", async () => {
        const response = await request(app)
          .post("/api/auth/login")
          .send({ usernameOrEmail: testCredentials.username, password: testCredentials.password });

        expect(response.status).toBe(200);
        expect(response.headers["set-cookie"]).toBeDefined();
        
        const cookie = response.headers["set-cookie"][0];
        expect(cookie).toContain("connect.sid");
        expect(cookie).toContain("HttpOnly");
        
        // Save cookie for session tests
        authCookie = response.headers["set-cookie"];
      });
    });
  });

  describe("Logout Endpoint", () => {
    beforeEach(async () => {
      // Login before each logout test
      const response = await request(app)
        .post("/api/auth/login")
        .send({ usernameOrEmail: testCredentials.username, password: testCredentials.password });
      
      authCookie = response.headers["set-cookie"];
    });

    test("should successfully logout a logged-in user", async () => {
      const response = await request(app)
        .post("/api/auth/logout")
        .set("Cookie", Array.isArray(authCookie) ? authCookie : authCookie ? [authCookie] : []);

      expect(response.status).toBe(200);
      expect(response.body.message).toBe("User logged out successfully");
    });

    test("should clear the session cookie on logout", async () => {
      const response = await request(app)
        .post("/api/auth/logout")
        .set("Cookie", Array.isArray(authCookie) ? authCookie : authCookie ? [authCookie] : []);

      expect(response.status).toBe(200);
      
      // Check for cookie clearing
      const cookie = response.headers["set-cookie"][0];
      expect(cookie).toContain("connect.sid");
      expect(cookie).toContain("Expires=Thu, 01 Jan 1970");
    });
  });

  describe("Session Management", () => {
    test("should return 401 for unauthenticated user", async () => {
      const response = await request(app)
        .get("/api/auth/current");

      expect(response.status).toBe(401);
      expect(response.body.message).toBe("Unauthorized");
    });

    test("should return 200 for authenticated user", async () => {
      // Login at the beginning of this test
      const loginResponse = await request(app)
        .post("/api/auth/login")
        .send({ usernameOrEmail: testCredentials.username, password: testCredentials.password });

      expect(loginResponse.status).toBe(200);
      expect(loginResponse.body.message).toBe("User logged in successfully");
      
      // Store cookie locally within this test
      const testCookie = loginResponse.headers["set-cookie"];

      const response = await request(app)
        .get("/api/auth/current")
        .set("Cookie", Array.isArray(testCookie) ? testCookie : testCookie ? [testCookie] : []);

      expect(response.status).toBe(200);
      expect(response.body.user).toBeDefined();
      expect(response.body.user.username).toBe(testCredentials.username);
      expect(response.body.user.email).toBe(testCredentials.email);
      
      // Set authCookie for cleanup in afterEach
      authCookie = testCookie;
    });
    
    test("should return 401 for invalid session", async () => {
      // Simulate an invalid session by using a random cookie
      const response = await request(app)
        .get("/api/auth/current")
        .set("Cookie", ["connect.sid=s%3Ainvalidsession"]);

      expect(response.status).toBe(401);
      expect(response.body.message).toBe("Unauthorized");
    });
  });

  describe("Password Handling", () => {
    test("should not expose password hash in user response", async () => {
      const response = await request(app)
        .post("/api/auth/login")
        .send({ usernameOrEmail: testCredentials.username, password: testCredentials.password });

      expect(response.status).toBe(200);
      expect(response.body.user).toBeDefined();
      expect(response.body.user.password).toBeUndefined();
      expect(response.body.user.hashedPassword).toBeUndefined();
      
      // Explicitly log out after this test to avoid orphaned sessions
      authCookie = response.headers["set-cookie"];
    });
  });
});