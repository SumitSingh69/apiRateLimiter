export default {
    rateLimit: {
        tiers: {
            free: { limit: 3, windowMs: 30 * 1000 }, // Reduced limits
            premium: { limit: 3, windowMs: 30 * 1000 }
        },
        customMessage: "API Limit reached! 🚫 Please wait..."
    }
};
