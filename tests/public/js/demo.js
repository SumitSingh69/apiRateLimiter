// Rate limiter demo functionality
class RateLimiterDemo {
    constructor(tier, limit) {
        this.tier = tier;
        this.limit = limit;
        this.count = 0;
        this.retryTimeout = null;
        this.elements = {
            button: document.querySelector(`#${tier}-button`),
            progress: document.querySelector(`#${tier}-progress`),
            status: document.querySelector(`#${tier}-status`),
            response: document.querySelector(`#${tier}-response`)
        };
    }

    async makeRequest() {
        try {
            const start = performance.now();
            const response = await fetch(`/api/${this.tier}`);
            const data = await response.json();
            const end = performance.now();
            
            if (response.status === 429) {
                this.handleRateLimit(data);
            } else {
                this.handleSuccess(end - start);
            }
        } catch (error) {
            this.handleError(error);
        }
    }

    handleSuccess(duration) {
        this.count++;
        const percent = (this.count / this.limit) * 100;
        
        this.elements.progress.style.width = `${percent}%`;
        this.elements.status.innerHTML = '<span class="badge bg-success">Available</span>';
        
        this.logResponse(`✅ Request successful (${Math.round(duration)}ms)`);
        
        if (this.count >= this.limit) {
            this.elements.button.disabled = true;
            setTimeout(() => this.reset(), 60000); // Reset after 1 minute
        }
    }

    handleRateLimit(data) {
        this.elements.status.innerHTML = '<span class="badge bg-warning">Rate Limited</span>';
        this.logResponse(`⚠️ ${data.message}`);
        
        // Start retry countdown
        if (data.retryAfter) {
            this.startRetryCountdown(data.retryAfter);
        }
    }

    handleError(error) {
        this.elements.status.innerHTML = '<span class="badge bg-danger">Error</span>';
        this.logResponse(`❌ ${error.message}`);
    }

    logResponse(message) {
        const time = new Date().toLocaleTimeString();
        this.elements.response.innerHTML = `${time} | ${message}\n` + this.elements.response.innerHTML;
    }

    startRetryCountdown(seconds) {
        let remaining = seconds;
        this.elements.button.disabled = true;
        
        const updateCountdown = () => {
            if (remaining <= 0) {
                this.elements.button.disabled = false;
                this.elements.button.textContent = `Test ${this.tier} Endpoint`;
                return;
            }
            
            this.elements.button.textContent = `Retry in ${remaining}s`;
            remaining--;
            this.retryTimeout = setTimeout(updateCountdown, 1000);
        };
        
        updateCountdown();
    }

    reset() {
        this.count = 0;
        this.elements.progress.style.width = '0%';
        this.elements.button.disabled = false;
        this.elements.status.innerHTML = '<span class="badge bg-success">Available</span>';
        if (this.retryTimeout) {
            clearTimeout(this.retryTimeout);
        }
    }
}

// Initialize demos when page loads
document.addEventListener('DOMContentLoaded', () => {
    const tiers = {
        free: limits.free,
        premium: limits.premium,
        admin: limits.admin
    };

    const demos = {};
    
    for (const [tier, limit] of Object.entries(tiers)) {
        demos[tier] = new RateLimiterDemo(tier, limit);
    }

    // Add click handlers
    document.querySelectorAll('[data-action="make-request"]').forEach(button => {
        const tier = button.dataset.tier;
        button.addEventListener('click', () => demos[tier].makeRequest());
    });
});
