# Stage 1 (builder)
FROM node:20-alpine AS builder
RUN corepack enable pnpm
WORKDIR /app
COPY . .
RUN pnpm install
RUN pnpm --filter api-gateway build

# Stage 2 (runner)
FROM node:20-alpine AS runner
WORKDIR /app
COPY --from=builder /app/apps/api-gateway/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
EXPOSE 3000
CMD ["node", "dist/main.js"]
