# API Rate Limiter

A simple API rate limiter implementation using Express.js and Redis.

## Features

- Limits API requests based on client IP or API key
- Configurable time windows and request limits
- Response headers with rate limit information
- Graceful handling of Redis connection issues

## Prerequisites

- Node.js (v14 or higher recommended)
- Redis server

## Installation

1. Clone this repository:

```bash
git clone <repository-url>
cd apiRateLimiter
```

2. Install dependencies:

```bash
npm install
```

3. Create a `.env` file in the root directory with the following content:

```
PORT=3000
REDIS_URL=redis://localhost:6379
```

4. Install Redis if you haven't already:
   - On macOS: `brew install redis`
   - On Ubuntu/Debian: `sudo apt-get install redis-server`
   - On Windows: Download from https://github.com/tporadowski/redis/releases

## Usage

1. Start Redis server:

```bash
redis-server
```

2. Start the API server:

```bash
npm start
```

For development with auto-restart:

```bash
npm run dev
```

3. Test the rate limiter:

```bash
# Make multiple requests to see rate limiting in action
curl http://localhost:3000/api/data
```

## Configuration

Edit the rate limiter configuration in `src/server.js` to adjust:

- Time window (default: 60 seconds)
- Maximum requests per window (default: 5)
- Key generation strategy (IP or API key)
- Rate limit exceeded message

## How It Works

This rate limiter uses Redis to track request counts for each client. The algorithm works as follows:

1. When a request arrives, a unique key is generated based on the client's IP or API key
2. The current count for this key is retrieved from Redis
3. If the key doesn't exist, it's created with a count of 1 and an expiration time
4. If the key exists, its count is incremented
5. If the count exceeds the maximum allowed, the request is rejected
6. Otherwise, the request is processed normally

Rate limit information is included in response headers:

- `X-RateLimit-Limit`: Maximum requests allowed
- `X-RateLimit-Remaining`: Remaining requests in the current window
