const express = require("express");
const rateLimiter = require("./rateLimiter");
const dotenv = require("dotenv");

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());

// Apply rate limiter to all routes
// Limit to 5 requests per minute
app.use(
  rateLimiter({
    windowMs: 60 * 1000, // 1 minute
    max: 5, // 5 requests per minute
    keyGenerator: (req) => {
      // Use IP address or API key for identification
      return req.headers["x-api-key"] || req.ip;
    },
    message: "Rate limit exceeded. Please try again later.",
  })
);

// Routes
app.get("/", (req, res) => {
  res.json({
    message: "API is running",
    timestamp: new Date(),
  });
});

// Example protected API route
app.get("/api/data", (req, res) => {
  res.json({
    success: true,
    data: {
      message: "This is protected data",
      timestamp: new Date(),
    },
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
