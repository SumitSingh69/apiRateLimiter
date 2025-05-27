export class FixedWindow {
        constructor(limit, windowMs) {
            this.limit = limit;
            this.windowMs = windowMs;
            this.requests = {};
        }
    
        isAllowed(ip) {
            const now = Date.now();
            if (!this.requests[ip] || now - this.requests[ip].start >= this.windowMs) {
                this.requests[ip] = { count: 1, start: now };
                return true;
            }
    
            if (this.requests[ip].count < this.limit) {
                this.requests[ip].count++;
                return true;
            }
            return false;
        }
    }
    