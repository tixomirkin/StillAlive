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
			Status:       "DOWN",
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
			Status:       "DOWN",
			Error:        err.Error(),
			ResponseTime: responseTime,
			CheckedAt:    time.Now(),
		}
	}
	defer resp.Body.Close()

	status := "UP"
	if event.ExpectedStatusCode != 0 && resp.StatusCode != event.ExpectedStatusCode {
		status = "DOWN"
	} else if event.ExpectedStatusCode == 0 && (resp.StatusCode < 200 || resp.StatusCode >= 300) {
		status = "DOWN"
	}

	if status == "UP" && event.Keyword != "" {
		bodyBytes, _ := io.ReadAll(resp.Body)
		if !strings.Contains(string(bodyBytes), event.Keyword) {
			status = "DOWN"
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
