# ========================
# Build Stage
# ========================
FROM node:20-alpine AS builder

# Enable pnpm
RUN corepack enable && corepack prepare pnpm@10.8.0 --activate

# Create app directory
WORKDIR /app

# Copy dependency files
COPY package.json pnpm-lock.yaml ./

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy rest of the application code
COPY . .

# Generate Prisma client
RUN pnpm prisma generate

# Build the Next.js application
RUN pnpm build

# ========================
# Production Stage
# ========================
FROM node:20-alpine AS runner

WORKDIR /app

# Set environment variables
ENV NODE_ENV=production
ENV PORT=3000

# Copy built application and dependencies from builder stage
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/prisma ./prisma

# Expose port for the app
EXPOSE 3000

# Start the server
CMD ["node", "server.js"]
