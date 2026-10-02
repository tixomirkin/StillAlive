package natsutil

import (
	"time"

	"github.com/nats-io/nats.go"
	"github.com/rs/zerolog/log"
)

// Connect establishes a connection to NATS with retry logic.
func Connect(url string) (*nats.Conn, error) {
	opts := []nats.Option{
		nats.Name("stillalive-checker-worker"),
		nats.ReconnectWait(2 * time.Second),
		nats.MaxReconnects(60),
		nats.DisconnectErrHandler(func(_ *nats.Conn, err error) {
			log.Warn().Err(err).Msg("NATS disconnected")
		}),
		nats.ReconnectHandler(func(nc *nats.Conn) {
			log.Info().Str("url", nc.ConnectedUrl()).Msg("NATS reconnected")
		}),
		nats.ClosedHandler(func(_ *nats.Conn) {
			log.Info().Msg("NATS connection closed")
		}),
	}

	nc, err := nats.Connect(url, opts...)
	if err != nil {
		return nil, err
	}

	return nc, nil
}
