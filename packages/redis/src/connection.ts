import Redis from "ioredis";

let client: Redis;
let pubClient: Redis;
let subClient: Redis;
export const getRedis = (): Redis => {
  if (!client) {
    client = new Redis({
      host: process.env.REDIS_HOST || "localhost",
      port: parseInt(process.env.REDIS_PORT || "6379"),
    });

    client.on("connect", () => console.log("[Redis] Connected"));
    client.on("error", (err) => console.error("[Redis] Error:", err));
  }

  return client;
};

export const getRedisPublisher = () : Redis => {
  if (!pubClient) {
    pubClient = new Redis({
      host: process.env.REDIS_HOST || "localhost",
      port: parseInt(process.env.REDIS_PORT || "6379"),
    });
  }
  return pubClient;
};

export const getRedisSubscriber = () : Redis => {
  if (!subClient) {
    subClient = new Redis({
      host: process.env.REDIS_HOST || "localhost",
      port: Number(process.env.REDIS_PORT) || 6379,
      retryStrategy: (times) => {
        const delay = Math.min(times * 50, 2000);
        return delay;
      },
      maxRetriesPerRequest: null,
      enableReadyCheck: false,
    });

    subClient.on("connect", () => {
      console.log("Redis SUB Connected successfully");
    });

    subClient.on("error", (err) => {
      console.error("Redis SUB Error:", err.message);
    });

    subClient.on("reconnecting", () => {
      console.log("Redis SUB Attempting to reconnect...");
    });
  }

  return subClient;
};