// Import necessary modules
import express, { Express, Request, Response } from "express";
import cors from "cors";
import helmet from "helmet";
import session from "express-session";
import { RedisStore } from "connect-redis";
import redis from "@core/database/redis";
import { REDIS_KEYS } from "@core/database/redis";
import "dotenv/config";
import passport from "passport";
import "@features/auth/strategies/local.strategy";

// Create an Express application
const app: Express = express();

// Import routes
import authRouter from "@features/auth/routes/user.route";

// Session Store with Redis
const redisStore = new RedisStore({
  client: redis,
  prefix: REDIS_KEYS.SESSION,
});
app.use(session({
  store: redisStore,
  secret: String(process.env.SESSION_SECRET),
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === "production",
    httpOnly: true,
    maxAge: Number(process.env.SESSION_EXPIRATION) || 1000 * 60 * 60 * 24, // Default to 1 day
  },
}));

// Middlewares
app.use(cors({
  origin: process.env.CLIENT_URL,
  credentials: true,
  methods: ["GET", "POST", "PUT"],
}));
app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(passport.initialize());
app.use(passport.session());

// Bind routes to the application
app.use("/api/auth", authRouter);

// Creating test account
import { createTestUser } from "@features/auth/models/user.model";
export  const testCredentials = {
  id: 1, // Assuming this is the ID of the test user
  username: "testuser",
  email: "testuser@test.com",
  password: "testpassword",
}
app.post("/api/test", async (req: Request, res: Response) => {
  try{
    await createTestUser({
      username: testCredentials.username,
      email: testCredentials.email,
      password: testCredentials.password,
    });
    res.status(201).json({
      message: "Test user created successfully",
    });
    return;
  } catch (error) {
    console.error("Error creating test user:", error);
    res.status(500).json({ message: "Internal server error" });
    return;
  }
});

// Start the server
const PORT = process.env.PORT || 4000;
const server = app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});

// Export the app for testing purposes
export { app, server };