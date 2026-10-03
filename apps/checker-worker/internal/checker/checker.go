package checker

import (
	"encoding/json"
	"strings"
	"sync"

	"github.com/nats-io/nats.go"
	"github.com/rs/zerolog/log"
	"github.com/tixomirkin/stillalive/checker-worker/internal/config"
)

type Checker struct {
	nc  *nats.Conn
	cfg *config.Config
	sub *nats.Subscription
	sem chan struct{}
	wg  sync.WaitGroup
}

func New(nc *nats.Conn, cfg *config.Config) *Checker {
	return &Checker{
		nc:  nc,
		cfg: cfg,
		sem: make(chan struct{}, cfg.Concurrency),
	}
}

func (c *Checker) Start() error {
	sub, err := c.nc.Subscribe("check.scheduled", c.handleCheck)
	if err != nil {
		return err
	}
	c.sub = sub
	return nil
}

func (c *Checker) handleCheck(msg *nats.Msg) {
	var event CheckScheduledEvent
	if err := json.Unmarshal(msg.Data, &event); err != nil {
		log.Error().Err(err).Msg("Failed to unmarshal check event")
		return
	}

	c.sem <- struct{}{}
	c.wg.Add(1)

	go func() {
		defer func() {
			<-c.sem
			c.wg.Done()
		}()

		var result CheckCompletedEvent
		switch strings.ToUpper(event.Type) {
		case "HTTP", "KEYWORD":
			result = performHTTPCheck(event)
		case "TCP":
			result = performTCPCheck(event)
		case "PING":
			result = performPingCheck(event)
		default:
			log.Warn().Str("type", event.Type).Msg("Unknown check type")
			return
		}
		
		result.Region = c.cfg.Region

		resultBytes, err := json.Marshal(result)
		if err != nil {
			log.Error().Err(err).Msg("Failed to marshal result")
			return
		}

		if err := c.nc.Publish("check.completed", resultBytes); err != nil {
			log.Error().Err(err).Msg("Failed to publish result")
		}
	}()
}

func (c *Checker) Stop() {
	if c.sub != nil {
		c.sub.Drain()
	}
	c.wg.Wait()
}
