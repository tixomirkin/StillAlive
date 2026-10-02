package main

import (
	"os"
	"os/signal"
	"syscall"

	"github.com/rs/zerolog"
	"github.com/rs/zerolog/log"

	"github.com/tixomirkin/stillalive/checker-worker/internal/checker"
	"github.com/tixomirkin/stillalive/checker-worker/internal/config"
	"github.com/tixomirkin/stillalive/checker-worker/internal/natsutil"
)

func main() {
	// Setup logger
	zerolog.TimeFieldFormat = zerolog.TimeFormatUnix
	if os.Getenv("NODE_ENV") == "development" {
		log.Logger = log.Output(zerolog.ConsoleWriter{Out: os.Stderr})
	}

	log.Info().Msg("Starting StillAlive Checker Worker...")

	// Load config
	cfg := config.Load()
	log.Info().
		Str("nats_url", cfg.NatsURL).
		Int("concurrency", cfg.Concurrency).
		Dur("timeout", cfg.Timeout).
		Msg("Configuration loaded")

	// Connect to NATS
	nc, err := natsutil.Connect(cfg.NatsURL)
	if err != nil {
		log.Fatal().Err(err).Msg("Failed to connect to NATS")
	}
	defer nc.Close()
	log.Info().Msg("Connected to NATS")

	// Create and start checker
	chk := checker.New(nc, cfg)
	if err := chk.Start(); err != nil {
		log.Fatal().Err(err).Msg("Failed to start checker")
	}
	log.Info().Msg("Checker worker is ready and listening for check events")

	// Graceful shutdown
	sigChan := make(chan os.Signal, 1)
	signal.Notify(sigChan, syscall.SIGINT, syscall.SIGTERM)
	sig := <-sigChan
	log.Info().Str("signal", sig.String()).Msg("Shutting down...")
	chk.Stop()
	log.Info().Msg("Checker worker stopped")
}
