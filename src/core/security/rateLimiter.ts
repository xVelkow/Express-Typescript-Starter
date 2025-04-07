import { Request, Response, NextFunction } from "express";
import redis, { REDIS_KEYS } from "@core/database/redis";

export const AUTHENTICATED_RATE_LIMIT_WINDOW_IN_SECONDS = 60; // 1 minute
export const AUTHENTICATED_MAX_REQUESTS_PER_WINDOW = 10; // 10 requests per window

export const authenticatedRateLimiter = async (req: Request, res: Response, next: NextFunction) => {
  if (!req.user) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }

  const userId = req.user.id;

  try {
    // Increment the request count for the user
    const requestCount = await redis.incr(`${REDIS_KEYS.AUTHENTICATED_RATE_LIMITER}${userId}`);
    if (requestCount === 1) {
      // Set the expiration time for the key if it's the first request
      await redis.expire(`${REDIS_KEYS.AUTHENTICATED_RATE_LIMITER}${userId}`, AUTHENTICATED_RATE_LIMIT_WINDOW_IN_SECONDS);
    }

    // Check if the request count exceeds the limit
    if (requestCount > AUTHENTICATED_MAX_REQUESTS_PER_WINDOW) {
      res.set("x-ratelimit-remaining", "0");
      res.set("x-ratelimit-limit", String(AUTHENTICATED_MAX_REQUESTS_PER_WINDOW));
      res.set("x-ratelimit-reset", String(AUTHENTICATED_RATE_LIMIT_WINDOW_IN_SECONDS));
      res.status(429).json({ message: "Too many requests, please try again later." });
      return;
    }

    // Proceed to the next middleware or route handler
    res.set("x-rate-limit-remaining", String(AUTHENTICATED_MAX_REQUESTS_PER_WINDOW - requestCount));
    res.set("x-ratelimit-limit", String(AUTHENTICATED_MAX_REQUESTS_PER_WINDOW));
    next();
  } catch (error) {
    console.error("Rate Limiter Error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};