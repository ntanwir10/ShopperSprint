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

# Copy the pre-built frontend (we'll build it locally first)
COPY frontend/dist/ ./frontend/dist/

# Expose the port
EXPOSE 3001

# Start the lightweight server
CMD ["node", "server-light.js"]
