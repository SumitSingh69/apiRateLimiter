import { rateLimiter } from "./middlewares/rateLimiter.mjs";
import { redisClient } from "./utils/redisClient.mjs";
import { logEvent } from "./utils/logger.mjs";
import defaultConfig from "./config/default.mjs";
import deepmerge from "deepmerge";

export const loadConfig = (userConfig = {}) => {
    return deepmerge(defaultConfig, userConfig);
};

export { rateLimiter, redisClient, logEvent };
