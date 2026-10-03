# Checker Worker (Go)

High-performance health check worker that subscribes to NATS for check events and performs HTTP, TCP, and Ping checks.

## Architecture

The checker worker:
1. Subscribes to `check.scheduled` NATS subject
2. Performs the requested check (HTTP, TCP, or Ping)
3. Publishes results to `check.completed` NATS subject

## Features

- **HTTP Checks**: Full HTTP request with custom method, headers, body, status code validation, keyword matching
- **TCP Checks**: TCP connection check with timeout
- **Ping Checks**: TCP-based reachability check
- **Concurrency Control**: Configurable worker pool with semaphore pattern
- **Graceful Shutdown**: Drains NATS subscription and waits for in-flight checks
- **Structured Logging**: Using zerolog

## Configuration

| Env Variable | Default | Description |
|---|---|---|
| `NATS_URL` | `nats://localhost:4222` | NATS server URL |
| `CHECKER_WORKER_CONCURRENCY` | `10` | Max concurrent checks |
| `CHECKER_WORKER_TIMEOUT` | `30s` | Default check timeout |
| `CHECKER_WORKER_REGION` | `default` | Region identifier |

## Development

```bash
# Build
make build

# Run
make run

# Test
make test

# Test with coverage
make test-coverage

# Lint (requires golangci-lint)
make lint
```

## Message Format

### Input (check.scheduled)
```json
{
  "monitorId": "uuid",
  "type": "HTTP",
  "url": "https://example.com",
  "httpMethod": "GET",
  "expectedStatusCode": 200,
  "keyword": "alive",
  "headers": {},
  "timeout": 30
}
```

### Output (check.completed)
```json
{
  "monitorId": "uuid",
  "status": "UP",
  "statusCode": 200,
  "responseTime": 150.5,
  "checkedAt": "2024-01-01T00:00:00Z",
  "region": "default"
}
```
