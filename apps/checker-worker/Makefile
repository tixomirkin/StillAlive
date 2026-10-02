.PHONY: build run test clean

BINARY_NAME=checker-worker

build:
	go build -o bin/$(BINARY_NAME) ./cmd/worker

run: build
	./bin/$(BINARY_NAME)

test:
	go test -v -race ./...

test-coverage:
	go test -v -race -coverprofile=coverage.out ./...
	go tool cover -html=coverage.out -o coverage.html

clean:
	rm -rf bin/ coverage.out coverage.html

lint:
	golangci-lint run ./...
