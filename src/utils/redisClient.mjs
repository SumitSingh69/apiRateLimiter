import Redis from "ioredis";
import dotenv from "dotenv";
import { logEvent } from "./logger.mjs";

dotenv.config();

// In-memory storage fallback
class MemoryStore {
    constructor() {
        this.store = new Map();
        this.connected = true;
    }

    async get(key) {
        return this.store.get(key);
    }

    async setex(key, seconds, value) {
        this.store.set(key, value);
        setTimeout(() => this.store.delete(key), seconds * 1000);
        return 'OK';
    }

    async del(key) {
        return this.store.delete(key);
    }
}

let client;

try {
    client = new Redis({
        host: process.env.REDIS_HOST || "127.0.0.1",
        port: process.env.REDIS_PORT || 6379,
        retryStrategy: (times) => {
            // Only try to connect once, then fall back to memory store
            return null;
        }
    });

    client.on("connect", () => logEvent("Redis connected"));
    
    client.on("error", (err) => {
        logEvent(`Redis Error: ${err}`);
        if (!client.connected && !client.isMemoryStore) {
            logEvent("Falling back to in-memory storage");
            client = new MemoryStore();
            client.isMemoryStore = true;
        }
    });
} catch (error) {
    logEvent(`Redis initialization error: ${error}. Using in-memory storage.`);
    client = new MemoryStore();
    client.isMemoryStore = true;
}

export const redisClient = client;
