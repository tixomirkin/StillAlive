package checker

import (
	"io"
	"net/http"
	"strings"
	"time"
)

func performHTTPCheck(event CheckScheduledEvent) CheckCompletedEvent {
	start := time.Now()
	timeout := time.Duration(event.Timeout) * time.Millisecond
	if timeout == 0 {
		timeout = 10 * time.Second
	}

	client := &http.Client{Timeout: timeout}

	method := event.HTTPMethod
	if method == "" {
		method = "GET"
	}

	var bodyReader io.Reader
	if event.Body != "" {
		bodyReader = strings.NewReader(event.Body)
	}

	req, err := http.NewRequest(method, event.URL, bodyReader)
	if err != nil {
		return CheckCompletedEvent{
			MonitorID:    event.MonitorID,
			Status:       "down",
			Error:        err.Error(),
			ResponseTime: float64(time.Since(start).Milliseconds()),
			CheckedAt:    time.Now(),
		}
	}

	for k, v := range event.Headers {
		req.Header.Set(k, v)
	}

	resp, err := client.Do(req)
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
	defer resp.Body.Close()

	status := "up"
	if event.ExpectedStatusCode != 0 && resp.StatusCode != event.ExpectedStatusCode {
		status = "down"
	} else if event.ExpectedStatusCode == 0 && (resp.StatusCode < 200 || resp.StatusCode >= 300) {
		status = "down"
	}

	if status == "up" && event.Keyword != "" {
		bodyBytes, _ := io.ReadAll(resp.Body)
		if !strings.Contains(string(bodyBytes), event.Keyword) {
			status = "down"
		}
	}

	return CheckCompletedEvent{
		MonitorID:    event.MonitorID,
		Status:       status,
		StatusCode:   resp.StatusCode,
		ResponseTime: responseTime,
		CheckedAt:    time.Now(),
	}
}
