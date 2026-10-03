package config

import (
	"os"
	"strconv"
	"time"
)

// Config holds the worker configuration.
type Config struct {
	NatsURL     string
	Concurrency int
	Timeout     time.Duration
	Region      string
}

// Load reads configuration from environment variables.
func Load() *Config {
	cfg := &Config{
		NatsURL:     getEnv("NATS_URL", "nats://localhost:4222"),
		Concurrency: getEnvInt("CHECKER_WORKER_CONCURRENCY", 10),
		Timeout:     getEnvDuration("CHECKER_WORKER_TIMEOUT", 30*time.Second),
		Region:      getEnv("CHECKER_WORKER_REGION", "default"),
	}
	return cfg
}

func getEnv(key, fallback string) string {
	if v := os.Getenv(key); v != "" {
		return v
	}
	return fallback
}

func getEnvInt(key string, fallback int) int {
	if v := os.Getenv(key); v != "" {
		if i, err := strconv.Atoi(v); err == nil {
			return i
		}
	}
	return fallback
}

func getEnvDuration(key string, fallback time.Duration) time.Duration {
	if v := os.Getenv(key); v != "" {
		if d, err := time.ParseDuration(v); err == nil {
			return d
		}
	}
	return fallback
}
