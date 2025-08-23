# Use the official Node.js runtime as a parent image
FROM node:18-alpine

# Set the working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install only production dependencies
RUN npm ci --omit=dev --no-audit --no-fund

# Copy the server and HTML files
COPY server.js ./
COPY public/ ./public/

# Expose the port
EXPOSE 3001

# Start the application
CMD ["node", "server.js"]
