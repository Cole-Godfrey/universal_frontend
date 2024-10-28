// Simple global config object
window.config = {
    API_URL: 'https://universal-backend-7wn9.onrender.com',
    // Add rate limiting settings
    RATE_LIMIT: {
        MAX_REQUESTS: 50,      // Maximum requests per window
        WINDOW_MS: 10000,      // Time window in milliseconds (10 seconds)
        RETRY_AFTER: 1000,     // Retry delay in milliseconds
    }
};
