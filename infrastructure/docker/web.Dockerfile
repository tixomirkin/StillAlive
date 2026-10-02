# Stage 1 (deps)
FROM node:20-alpine AS deps
RUN corepack enable pnpm
WORKDIR /app
COPY . .
RUN pnpm install

# Stage 2 (builder)
FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app .
RUN pnpm --filter web build

# Stage 3 (runner)
FROM node:20-alpine AS runner
WORKDIR /app
COPY --from=builder /app/apps/web/.next/standalone ./
COPY --from=builder /app/apps/web/.next/static ./.next/static
EXPOSE 3010
ENV PORT=3010
CMD ["node", "server.js"]
