import express from "express";
import { rateLimiter, loadConfig } from "../src/index.mjs";
import userConfig from "./config/userConfig.mjs";
import path from "path";
import { fileURLToPath } from 'url';
import ejsLayouts from "express-ejs-layouts";
import { redisClient } from "../src/utils/redisClient.mjs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const config = loadConfig(userConfig);

// Set up EJS
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(ejsLayouts);

// Apply rate limiter middleware to /api routes
app.use('/api', rateLimiter(config.rateLimit.defaultAlgorithm));

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// Home page with demo UI
app.get("/", (req, res) => {
    res.render('demo', {
        title: 'Rate Limiter Demo',
        limits: config.rateLimit.tiers,
        storageType: redisClient?.isMemoryStore ? 'In-Memory' : 'Redis'
    });
});

// Demo API endpoints
app.get("/api/free", (req, res) => {
    res.json({
        status: "success",
        tier: "free",
        message: "Free tier API response",
        timestamp: new Date().toISOString(),
        storageType: redisClient?.isMemoryStore ? 'In-Memory' : 'Redis'
    });
});

app.get("/api/premium", (req, res) => {
    res.json({
        status: "success",
        tier: "premium",
        message: "Premium tier API response",
        timestamp: new Date().toISOString(),
        storageType: redisClient?.isMemoryStore ? 'In-Memory' : 'Redis'
    });
});

app.get("/api/admin", (req, res) => {
    res.json({
        status: "success",
        tier: "admin",
        message: "Admin tier API response",
        timestamp: new Date().toISOString(),
        storageType: redisClient?.isMemoryStore ? 'In-Memory' : 'Redis'
    });
});

// Error handler for rate limit errors
app.use((err, req, res, next) => {
    if (err.status === 429) {
        return res.status(429).json({
            status: "error",
            message: err.message || "Too many requests",
            retryAfter: err.retryAfter
        });
    }
    next(err);
});

app.listen(3000, () => {
    console.log("\n🚀 Rate Limiter Demo running on http://localhost:3000");
    console.log("📊 API endpoints:");
    console.log("   - Free tier:    http://localhost:3000/api/free");
    console.log("   - Premium tier: http://localhost:3000/api/premium");
    console.log("   - Admin tier:   http://localhost:3000/api/admin\n");
});
