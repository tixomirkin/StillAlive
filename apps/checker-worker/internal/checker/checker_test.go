package checker

import (
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"
)

func TestHTTPCheck(t *testing.T) {
	ts := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusOK)
		w.Write([]byte("ok"))
	}))
	defer ts.Close()

	event := CheckScheduledEvent{
		MonitorID:          "1",
		Type:               "http",
		URL:                ts.URL,
		ExpectedStatusCode: 200,
	}

	result := performHTTPCheck(event)
	if result.Status != "UP" {
		t.Errorf("expected status UP, got %s", result.Status)
	}
}

func TestHTTPCheck_Keyword(t *testing.T) {
	ts := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusOK)
		w.Write([]byte("hello world"))
	}))
	defer ts.Close()

	event := CheckScheduledEvent{
		MonitorID: "2",
		Type:      "keyword",
		URL:       ts.URL,
		Keyword:   "world",
	}

	result := performHTTPCheck(event)
	if result.Status != "UP" {
		t.Errorf("expected status UP, got %s", result.Status)
	}

	event.Keyword = "notfound"
	result = performHTTPCheck(event)
	if result.Status != "DOWN" {
		t.Errorf("expected status DOWN, got %s", result.Status)
	}
}

func TestTCPCheck(t *testing.T) {
	ts := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {}))
	defer ts.Close()

	url := strings.TrimPrefix(ts.URL, "http://")
	event := CheckScheduledEvent{
		MonitorID: "3",
		Type:      "tcp",
		URL:       url,
	}

	result := performTCPCheck(event)
	if result.Status != "UP" {
		t.Errorf("expected status UP, got %s", result.Status)
	}
}
