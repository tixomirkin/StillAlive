package checker

import "time"

// CheckScheduledEvent represents an incoming check request from NATS.
type CheckScheduledEvent struct {
	MonitorID          string            `json:"monitorId"`
	Type               string            `json:"type"`
	URL                string            `json:"url"`
	HTTPMethod         string            `json:"httpMethod,omitempty"`
	ExpectedStatusCode int               `json:"expectedStatusCode,omitempty"`
	Keyword            string            `json:"keyword,omitempty"`
	Headers            map[string]string `json:"headers,omitempty"`
	Body               string            `json:"body,omitempty"`
	Timeout            int               `json:"timeout"`
}

// CheckCompletedEvent represents the result of a check sent back via NATS.
type CheckCompletedEvent struct {
	MonitorID    string    `json:"monitorId"`
	Status       string    `json:"status"`
	StatusCode   int       `json:"statusCode,omitempty"`
	ResponseTime float64   `json:"responseTime"`
	Error        string    `json:"error,omitempty"`
	CheckedAt    time.Time `json:"checkedAt"`
	Region       string    `json:"region,omitempty"`
}
