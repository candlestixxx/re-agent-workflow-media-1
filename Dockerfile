# Base image
FROM node:18-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code and build
COPY . .
RUN npm run build

# Production image
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy only the compiled dist and production dependencies
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/migrations ./migrations

# Install only production dependencies
RUN npm ci --only=production

# Expose the API port
EXPOSE 3000

# Start the application
CMD ["node", "dist/index.js"]
