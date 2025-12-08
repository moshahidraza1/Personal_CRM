# 1. Use Node 20 Alpine (Lightweight and secure)
FROM node:20-alpine

# 2. Install OpenSSL (Required for Prisma Client on Alpine Linux)
RUN apk -U add --no-cache openssl

# 3. Set working directory
WORKDIR /app

# 4. Copy package files first to leverage Docker cache
COPY package*.json ./

# 5. Install ONLY production dependencies
# 'npm ci' is faster and more reliable than 'npm install' for CI/CD
RUN npm ci --only=production

# 6. Copy Prisma schema and config
COPY prisma ./prisma/
COPY prisma.config.js ./

# 7. Generate Prisma Client
# This must run inside the container to match the container's OS architecture
RUN npx prisma generate

# 8. Copy the rest of the application code
COPY src ./src

# 9. Set environment variables
ENV NODE_ENV=production
ENV PORT=3000

# 10. Expose the port
EXPOSE 3000

# 11. Use a non-root user for security (Best Practice)
USER node

# 12. Start the application directly
# We use 'node src/index.js' because your package.json lacks a "start" script
CMD ["node", "src/index.js"]