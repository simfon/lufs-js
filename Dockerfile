# LUFS Measurement Web Application Dockerfile
# Multi-stage build for optimal production image

# Stage 1: Build frontend
FROM node:18-alpine AS frontend-builder

WORKDIR /app

# Copy frontend package files
COPY package*.json ./
COPY tsconfig*.json ./
COPY vite.config.ts ./
COPY eslint.config.js ./

# Install frontend dependencies (including dev dependencies for build)
RUN npm ci

# Copy frontend source code
COPY src/ ./src/
COPY public/ ./public/
COPY index.html ./

# Build frontend for production
RUN npm run build

# Stage 2: Setup backend
FROM node:18-alpine AS backend-builder

WORKDIR /app/server

# Copy backend package files
COPY server/package*.json ./

# Install backend dependencies
RUN npm ci --only=production

# Stage 3: Final production image
FROM node:18-alpine AS production

# Install system dependencies for audio processing
RUN apk add --no-cache \
    ffmpeg \
    alsa-lib-dev \
    && rm -rf /var/cache/apk/*

# Create app directory
WORKDIR /app

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs
RUN adduser -S lufs -u 1001

# Copy backend dependencies
COPY --from=backend-builder /app/server/node_modules ./server/node_modules
COPY --from=backend-builder /app/server/package*.json ./server/

# Copy backend source
COPY server/index.js ./server/

# Copy built frontend from first stage
COPY --from=frontend-builder /app/dist ./dist

# Create uploads directory for file processing
RUN mkdir -p /app/uploads && chown -R lufs:nodejs /app/uploads

# Change ownership of the app directory
RUN chown -R lufs:nodejs /app

# Switch to non-root user
USER lufs

# Expose port
EXPOSE 3001

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "const http = require('http'); \
    const options = { hostname: 'localhost', port: 3001, path: '/api/health', timeout: 2000 }; \
    const req = http.request(options, (res) => { \
      if (res.statusCode === 200) process.exit(0); \
      else process.exit(1); \
    }); \
    req.on('timeout', () => { req.destroy(); process.exit(1); }); \
    req.on('error', () => process.exit(1)); \
    req.end();"

# Set environment variables
ENV NODE_ENV=production
ENV PORT=3001

# Start the application
WORKDIR /app/server
CMD ["node", "index.js"]
