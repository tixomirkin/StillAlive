# Stage 1 (builder)
FROM golang:1.22-alpine AS builder
WORKDIR /app
COPY . .
RUN go build -o checker-worker .

# Stage 2 (runner)
FROM alpine:3.20 AS runner
WORKDIR /app
COPY --from=builder /app/checker-worker .
CMD ["./checker-worker"]
