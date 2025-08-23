# Use the official Node.js runtime as a parent image
FROM node:18-alpine

# Set the working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install --omit=dev --no-audit --no-fund

# Copy the backend source
COPY backend/ ./backend/

# Copy the frontend build
COPY frontend/dist/ ./frontend/dist/

# Build the backend
RUN cd backend && npm install --omit=dev --no-audit --no-fund
RUN cd backend && npm run build

# Expose the port
EXPOSE 3001

# Start the application
CMD ["cd", "backend", "&&", "node", "dist/index.js"]
