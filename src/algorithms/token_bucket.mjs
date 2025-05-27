export class TokenBucket {
        constructor(capacity, refillRate) {
            this.capacity = capacity;
            this.tokens = capacity;
            this.refillRate = refillRate;
            this.lastRefillTime = Date.now();
        }
    
        refill() {
            const now = Date.now();
            const elapsed = (now - this.lastRefillTime) / 1000;
            this.tokens = Math.min(this.capacity, this.tokens + elapsed * this.refillRate);
            this.lastRefillTime = now;
        }
    
        consume(tokens = 1) {
            this.refill();
            if (this.tokens >= tokens) {
                this.tokens -= tokens;
                return true;
            }
            return false;
        }
    }
    