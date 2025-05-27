export class SlidingWindow {
        constructor(limit, windowMs) {
            this.limit = limit;
            this.windowMs = windowMs;
            this.requests = {};
        }
    
        isAllowed(ip) {
            const now = Date.now();
            if (!this.requests[ip]) {
                this.requests[ip] = [];
            }
    
            this.requests[ip] = this.requests[ip].filter((timestamp) => now - timestamp < this.windowMs);
    
            if (this.requests[ip].length < this.limit) {
                this.requests[ip].push(now);
                return true;
            }
            return false;
        }
    }
    