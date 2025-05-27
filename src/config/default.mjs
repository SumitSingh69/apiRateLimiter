export default {
    rateLimit: {
        defaultAlgorithm: "fixed",
        tiers: {
            free: {
                limit: 5,
                windowMs: 60000
            },
            premium: {
                limit: 20,
                windowMs: 60000
            },
            admin: {
                limit: 50,
                windowMs: 60000
            }
        },
        redisPersistence: true,
        logging: true,
        customMessage: "Too many requests. Please slow down."
    }
};