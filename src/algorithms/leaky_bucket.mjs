export class LeakyBucket {
        constructor(capacity, leakRate) {
            this.capacity = capacity;
            this.water = 0;
            this.leakRate = leakRate;
            this.lastLeakTime = Date.now();
        }
    
        leak() {
            const now = Date.now();
            const elapsed = (now - this.lastLeakTime) / 1000;
            this.water = Math.max(0, this.water - elapsed * this.leakRate);
            this.lastLeakTime = now;
        }
    
        addRequest() {
            this.leak();
            if (this.water < this.capacity) {
                this.water++;
                return true;
            }
            return false;
        }
    }
    