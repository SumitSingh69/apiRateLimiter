import { redisClient } from "../utils/redisClient.mjs";
import { logEvent } from "../utils/logger.mjs";
import config from "../config/default.mjs";

// Import all algorithms
import { FixedWindow } from "../algorithms/fixed_window.mjs";
import { SlidingWindow } from "../algorithms/sliding_window.mjs";
import { TokenBucket } from "../algorithms/token_bucket.mjs";
import { LeakyBucket } from "../algorithms/leaky_bucket.mjs";

// Map algorithm names to implementations
const algorithms = {
    fixed: FixedWindow,
    sliding: SlidingWindow,
    token: TokenBucket,
    leaky: LeakyBucket
};


export const rateLimiter = (algorithm = config.rateLimit.defaultAlgorithm) => {
    return async (req, res, next) => {
        const ip = req.ip || req.connection.remoteAddress;
        const userId = req.user?.id || ip; 
        const userType = req.user?.role || "free";
        const tierConfig = config.rateLimit.tiers[userType] || config.rateLimit.tiers.free;

        const key = `rate-limit:${userId}`;
        const backoffKey = `backoff:${userId}`; 
        const now = Date.now();
        const windowMs = tierConfig.windowMs;
        const limit = tierConfig.limit;
        const baseDelay = config.rateLimit.backoffBaseDelay || 500;

        try {
            
            let data = await redisClient.get(key);
            data = data ? JSON.parse(data) : { count: 0, start: now };

            
            if (now - data.start >= windowMs) {
                data.count = 1;
                data.start = now;
                await redisClient.del(backoffKey); 
            } else {
                data.count++;
            }

            
            if (data.count > limit) {
                logEvent(`User ${userId} (${userType}) exceeded rate limit (${data.count} requests)`);

                
                let backoffAttempts = await redisClient.get(backoffKey);
                backoffAttempts = backoffAttempts ? parseInt(backoffAttempts) : 0;
                const delayMs = baseDelay * Math.pow(2, backoffAttempts); 

                
                await redisClient.setex(backoffKey, Math.ceil(windowMs / 1000), backoffAttempts + 1);

                logEvent(`User ${userId} delayed for ${delayMs}ms due to rate limiting`);

                setTimeout(() => {
                    return res.status(429).json({
                        error: "Too many requests",
                        message: config.rateLimit.customMessage || "You are sending requests too fast. Please slow down.",
                        delay: delayMs
                    });
                }, delayMs);
                return;
            }

            
            await redisClient.setex(key, Math.ceil(windowMs / 1000), JSON.stringify(data));
            logEvent(`User ${userId} (${userType}) request allowed (${data.count}/${limit})`);

            next();
        } catch (error) {
            logEvent(`Rate limiter error: ${error.message}`);
            res.status(500).json({ error: "Internal Server Error" });
        }
    };
};
