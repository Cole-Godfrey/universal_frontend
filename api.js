class APIManager {
    constructor() {
        this.requestCount = 0;
        this.requestQueue = [];
        this.lastReset = Date.now();
    }

    async makeRequest(url, options = {}) {
        // Reset counter if window has passed
        if (Date.now() - this.lastReset >= window.config.RATE_LIMIT.WINDOW_MS) {
            this.requestCount = 0;
            this.lastReset = Date.now();
        }

        // Check if we're at the rate limit
        if (this.requestCount >= window.config.RATE_LIMIT.MAX_REQUESTS) {
            // Wait for next window
            await new Promise(resolve => 
                setTimeout(resolve, window.config.RATE_LIMIT.RETRY_AFTER)
            );
            return this.makeRequest(url, options); // Retry request
        }

        // Increment request counter
        this.requestCount++;

        try {
            const response = await fetch(url, {
                ...options,
                headers: {
                    ...options.headers,
                    'Content-Type': 'application/json'
                }
            });

            // Handle rate limit response from server
            if (response.status === 429) {
                const retryAfter = response.headers.get('Retry-After') || 
                    window.config.RATE_LIMIT.RETRY_AFTER;
                
                await new Promise(resolve => setTimeout(resolve, retryAfter));
                return this.makeRequest(url, options); // Retry request
            }

            return response;

        } catch (error) {
            if (error.message.includes('rate limit') || error.message.includes('too many requests')) {
                await new Promise(resolve => 
                    setTimeout(resolve, window.config.RATE_LIMIT.RETRY_AFTER)
                );
                return this.makeRequest(url, options); // Retry request
            }
            throw error;
        }
    }

    // Queue non-critical requests
    async queueRequest(url, options = {}) {
        return new Promise((resolve, reject) => {
            this.requestQueue.push({
                url,
                options,
                resolve,
                reject
            });
            this.processQueue();
        });
    }

    async processQueue() {
        if (this.requestQueue.length === 0) return;

        const request = this.requestQueue[0];
        
        try {
            const response = await this.makeRequest(request.url, request.options);
            request.resolve(response);
        } catch (error) {
            request.reject(error);
        }

        this.requestQueue.shift();
        
        // Process next request with delay
        if (this.requestQueue.length > 0) {
            setTimeout(() => this.processQueue(), 100);
        }
    }
}

// Create global instance
window.api = new APIManager();
