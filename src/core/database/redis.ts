import "dotenv/config";
import Redis from "ioredis";

export const REDIS_KEYS = {
  PROJECT: "express-typescript-starter:",
  SESSION: "session:", 
};

const redis = new Redis({
  host: String(process.env.REDIS_HOST),
  port: Number(process.env.REDIS_PORT),
  password: String(process.env.REDIS_PASSWORD) || undefined,
  db: Number(process.env.REDIS_DB),
  keyPrefix: REDIS_KEYS.PROJECT,
});

redis.on("connect", () => {
  console.log("Redis connected");
});

redis.on("error", (error) => {
  console.error("Redis error", error);
});

export default redis;