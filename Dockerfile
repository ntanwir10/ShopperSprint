# Use Node.js 20 (required for Vite 7+)
FROM node:20-alpine

# Set the working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install root dependencies (if any)
RUN npm install --no-audit --no-fund

# Copy the entire project
COPY . .

# Install backend dependencies (including dev dependencies for build)
RUN cd backend && npm install --no-audit --no-fund

# Build the backend first
RUN cd backend && npm run build

# Skip frontend build for now - serve static HTML directly
# Create public directory and copy our static HTML
RUN mkdir -p backend/dist/public
COPY frontend/index.html backend/dist/public/index.html

# Clean up dev dependencies after build to save space
RUN cd backend && npm prune --production

# Expose the port
EXPOSE 3001

# Start the application
CMD ["node", "backend/dist/index.js"]
