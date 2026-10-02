package checker

import (
	"net"
	"time"
)

func performTCPCheck(event CheckScheduledEvent) CheckCompletedEvent {
	start := time.Now()
	timeout := time.Duration(event.Timeout) * time.Millisecond
	if timeout == 0 {
		timeout = 10 * time.Second
	}

	conn, err := net.DialTimeout("tcp", event.URL, timeout)
	responseTime := float64(time.Since(start).Milliseconds())

	if err != nil {
		return CheckCompletedEvent{
			MonitorID:    event.MonitorID,
			Status:       "down",
			Error:        err.Error(),
			ResponseTime: responseTime,
			CheckedAt:    time.Now(),
		}
	}
	conn.Close()

	return CheckCompletedEvent{
		MonitorID:    event.MonitorID,
		Status:       "up",
		ResponseTime: responseTime,
		CheckedAt:    time.Now(),
	}
}
