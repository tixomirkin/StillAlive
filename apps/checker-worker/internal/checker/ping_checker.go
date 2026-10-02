package checker

import (
	"fmt"
	"net"
	"time"
)

// performPingCheck checks if a host is reachable via TCP connection on port 80.
// Note: True ICMP ping requires root privileges, so we use TCP connect as a proxy.
func performPingCheck(event CheckScheduledEvent) CheckCompletedEvent {
	result := CheckCompletedEvent{
		MonitorID: event.MonitorID,
		CheckedAt: time.Now(),
		Region:    "", // Set by config
	}

	host := event.URL
	// Default to port 80 if no port specified
	if _, _, err := net.SplitHostPort(host); err != nil {
		host = fmt.Sprintf("%s:80", host)
	}

	timeout := time.Duration(event.Timeout) * time.Second
	if timeout == 0 {
		timeout = 10 * time.Second
	}

	start := time.Now()
	conn, err := net.DialTimeout("tcp", host, timeout)
	result.ResponseTime = float64(time.Since(start).Milliseconds())

	if err != nil {
		result.Status = "DOWN"
		result.Error = fmt.Sprintf("Ping failed: %v", err)
		return result
	}
	defer conn.Close()

	result.Status = "UP"
	return result
}
