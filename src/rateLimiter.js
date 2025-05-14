const redis = require("redis");
const { promisify } = require("util");

// Create Redis client
const client = redis.createClient(
  process.env.REDIS_URL || "redis://localhost:6379"
);

// Promisify Redis commands
const getAsync = promisify(client.get).bind(client);
const setAsync = promisify(client.set).bind(client);
const expireAsync = promisify(client.expire).bind(client);

// Handle Redis connection errors
client.on("error", (err) => {
  console.error("Redis error:", err);
});

/**
 * Rate limiter middleware
 * @param {Object} options - Configuration options
 * @param {number} options.windowMs - Time window in milliseconds
 * @param {number} options.max - Maximum number of requests in time window
 * @param {function} options.keyGenerator - Function to generate a unique key for the request
 * @param {string} options.message - Response message when rate limit is exceeded
 * @param {number} options.statusCode - Response status code when rate limit is exceeded
 * @returns {function} Express middleware function
 */
function rateLimiter({
  windowMs = 60 * 1000, // 1 minute by default
  max = 100, // 100 requests per windowMs by default
  keyGenerator = (req) => req.ip || "anonymous",
  message = "Too many requests, please try again later.",
  statusCode = 429, // Too Many Requests
} = {}) {
  return async (req, res, next) => {
    try {
      const key = `ratelimit:${keyGenerator(req)}`;

      // Get current count for this key
      let current = await getAsync(key);

      // If key doesn't exist, create it with a count of 1
      if (current === null) {
        await setAsync(key, 1);
        await expireAsync(key, Math.ceil(windowMs / 1000));
        current = 1;
      } else {
        // Increment count
        current = parseInt(current) + 1;
        await setAsync(key, current);
      }

      // Set headers with rate limit info
      res.setHeader("X-RateLimit-Limit", max);
      res.setHeader("X-RateLimit-Remaining", Math.max(0, max - current));

      // If count exceeds max, return error
      if (current > max) {
        return res.status(statusCode).json({
          success: false,
          message,
        });
      }

      next();
    } catch (err) {
      console.error("Rate limiter error:", err);
      next(); // Allow request in case of error
    }
  };
}

module.exports = rateLimiter;
