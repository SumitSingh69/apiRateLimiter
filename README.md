# 🚀 Speedguard - Advanced API Rate Limiting Middleware

Speedguard is a **high-performance API rate-limiting middleware** for **Node.js and Express**. It helps **prevent abuse, protect APIs, and optimize performance** using powerful algorithms like **Fixed Window, Token Bucket, and Sliding Window**.

---

## 📌 What is API Rate Limiting?

Rate limiting controls how often a user or system can **request resources from a server** within a set timeframe. It helps:
- 🚀 **Prevent DDoS attacks**
- ⚡ **Optimize server performance**
- 🔒 **Enhance API security**
- 💰 **Reduce infrastructure costs**
- 🛡️ **Protect against bot abuse**

### 🛠️ How Does Speedguard Work?

Speedguard uses **Redis** for distributed rate limiting and supports **multiple algorithms**:
1️⃣ **Fixed Window** - Simple request limit per time window.  
2️⃣ **Sliding Window** - More accurate limiting with real-time calculations.  
3️⃣ **Token Bucket** - Predefined token-based request control.  

---

## 📥 Installation

Speedguard requires **Node.js v14.0.0 or higher**.

**install zip into your codebase root folder:**
```bash

import express from "express";
import { rateLimiter } from "speedguard";

const app = express();
const port = 3000;

// Apply rate limiter middleware
app.use(rateLimiter("sliding")); // Choose: "fixed", "token", "sliding"

app.get("/", (req, res) => {
    res.send("Hello! This is a rate-limited API.");
});

app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});

