# Use the official Node.js runtime as a parent image
FROM node:18-alpine

# Set the working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install only production dependencies
RUN npm ci --only=production --no-audit --no-fund

# Create the server file
RUN echo 'const express = require("express"); const app = express(); app.use(express.json()); app.use(express.static("public")); app.get("/api/health", (req, res) => res.json({status: "ok"})); app.post("/api/waitlist/join", (req, res) => res.json({success: true, message: "Waitlist signup successful!"})); app.get("*", (req, res) => res.sendFile("public/index.html")); app.listen(process.env.PORT || 3001, () => console.log("Server running on port", process.env.PORT || 3001));' > server.js

# Create the public directory and HTML file
RUN mkdir -p public
RUN echo '<html><head><title>ShopperSprint - Coming Soon</title><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><style>body{font-family:system-ui,sans-serif;margin:0;background:linear-gradient(135deg,#667eea 0%,#764ba2 100%);color:white;text-align:center;padding:2rem}.container{max-width:600px;margin:0 auto;padding:2rem;background:rgba(255,255,255,0.1);border-radius:20px;backdrop-filter:blur(10px)}.logo{font-size:3rem;margin-bottom:1rem}.title{font-size:2rem;margin-bottom:1rem}.subtitle{font-size:1.2rem;margin-bottom:2rem;opacity:0.9}.email-form{display:flex;gap:1rem;margin-bottom:1rem;flex-wrap:wrap;justify-content:center}.email-input{padding:1rem;border:none;border-radius:10px;font-size:1rem;flex:1;min-width:200px}.btn{padding:1rem 2rem;background:#ff6b6b;color:white;border:none;border-radius:10px;font-size:1rem;cursor:pointer;transition:all 0.3s}.btn:hover{background:#ff5252;transform:translateY(-2px)}</style></head><body><div class="container"><div class="logo">🛒 ShopperSprint</div><h1 class="title">Coming Soon</h1><p class="subtitle">Canada\'s smartest price comparison platform is launching soon!</p><form class="email-form" action="/api/waitlist/join" method="post"><input type="email" name="email" placeholder="Enter your email" class="email-input" required><button type="submit" class="btn">Join Waitlist</button></form><p>Track prices • Find deals • Save money</p></div></body></html>' > public/index.html

# Expose the port
EXPOSE 3001

# Start the application
CMD ["node", "server.js"]
