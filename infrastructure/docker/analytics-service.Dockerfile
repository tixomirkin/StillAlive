# Stage 1 (builder)
FROM node:20-alpine AS builder
RUN corepack enable pnpm
WORKDIR /app
COPY . .
RUN pnpm install
RUN pnpm --filter analytics-service build

# Stage 2 (runner)
FROM node:20-alpine AS runner
WORKDIR /app
COPY --from=builder /app/apps/analytics-service/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
EXPOSE 3002
CMD ["node", "dist/main.js"]
