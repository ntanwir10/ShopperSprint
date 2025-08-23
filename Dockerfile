# Use the official Node.js runtime as a parent image
FROM node:18

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

# Build the backend
RUN cd backend && npm run build

# Install frontend dependencies and build
RUN cd frontend && npm install --no-audit --no-fund
RUN cd frontend && npm run build

# Copy frontend build to backend public directory
RUN mkdir -p backend/dist/public && cp -r frontend/dist/* backend/dist/public/

# Clean up dev dependencies after build (optional - saves space)
RUN cd backend && npm prune --production
RUN cd frontend && npm prune --production

# Expose the port
EXPOSE 3001

# Start the application
CMD ["node", "backend/dist/index.js"]
