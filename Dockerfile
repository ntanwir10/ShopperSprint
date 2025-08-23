# Use the official Node.js runtime as a parent image
FROM node:18-alpine

# Set the working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install only essential dependencies
RUN npm install --omit=dev --no-audit --no-fund

# Copy the lightweight server
COPY server-light.js ./

# Copy the frontend source
COPY frontend/ ./frontend/

# Install frontend dependencies (including dev dependencies for build)
RUN cd frontend && npm install --no-audit --no-fund

# Build the frontend
RUN cd frontend && npm run build

# Clean up frontend dev dependencies to reduce image size
RUN cd frontend && npm prune --production

# Expose the port
EXPOSE 3001

# Start the lightweight server
CMD ["node", "server-light.js"]
