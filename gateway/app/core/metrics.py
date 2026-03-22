from __future__ import annotations

from collections import Counter
from threading import Lock


class MetricsRegistry:
    def __init__(self, service_name: str) -> None:
        self.service_name = service_name
        self._lock = Lock()
        self._total_requests = 0
        self._requests_by_method: Counter[str] = Counter()
        self._requests_by_path: Counter[str] = Counter()
        self._responses_by_status: Counter[str] = Counter()
        self._total_4xx = 0
        self._total_5xx = 0
        self._total_request_latency_ms = 0.0
        self._request_count_for_latency = 0

    def record_request(self, method: str, path: str, status_code: int, duration_ms: float) -> None:
        with self._lock:
            self._total_requests += 1
            self._requests_by_method[method] += 1
            self._requests_by_path[path] += 1
            self._responses_by_status[str(status_code)] += 1
            if 400 <= status_code <= 499:
                self._total_4xx += 1
            if 500 <= status_code <= 599:
                self._total_5xx += 1
            self._total_request_latency_ms += duration_ms
            self._request_count_for_latency += 1

    def snapshot(self) -> dict[str, object]:
        with self._lock:
            average_latency_ms = (
                round(self._total_request_latency_ms / self._request_count_for_latency, 2)
                if self._request_count_for_latency
                else 0.0
            )
            return {
                "service": self.service_name,
                "total_requests": self._total_requests,
                "requests_by_method": dict(self._requests_by_method),
                "requests_by_path": dict(self._requests_by_path),
                "responses_by_status": dict(self._responses_by_status),
                "total_4xx": self._total_4xx,
                "total_5xx": self._total_5xx,
                "total_request_latency_ms": round(self._total_request_latency_ms, 2),
                "request_count_for_latency": self._request_count_for_latency,
                "average_latency_ms": average_latency_ms,
            }


gateway_metrics = MetricsRegistry(service_name="gateway")
