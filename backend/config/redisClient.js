import { createClient } from "redis";

const redisClient = createClient({
  url: process.env.REDIS_URL || "redis://127.0.0.1:6379",
});

redisClient.on("error", (err) => {
  console.error("Redis error:", err);
});

redisClient.on("connect", () => {
  console.log("Redis connected successfully");
});

if (!redisClient.isOpen) {
  await redisClient.connect();
}

export default redisClient;
