import http from "k6/http";
import { sleep, check } from "k6";

export const TEST_BASE_URL = "http://localhost:3000";
export const AUCTION_ID = "691479d8407e1fae9a8a35b6";
export const AUTH_TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY4MTc4M2JmYWEyMzJlODdhNjlhNWUwZSIsInJvbGUiOiJidXllciIsImZpcnN0bmFtZSI6IlZpdGVzaCIsImxhc3RuYW1lIjoiUmVkZHkiLCJlbWFpbCI6ImJ1eTFAZ21haWwuY29tIiwiaWF0IjoxNzY0MDk1NTk2LCJleHAiOjE3NjQxODE5OTZ9.X3wQqzKO_-2Vo_MMsB-fsF_WJGgnBpBvn4kTlgNYIJA";

export const NUMBER_OF_USERS = 500; 
export const TEST_DURATION = "10s";

export const options = {
  vus: NUMBER_OF_USERS,
  duration: TEST_DURATION,
  noVUConnectionReuse: true, 
  summaryTimeUnit: "ms", 
  consoleOutput: "disable",
};

/* -------------------------- Execution --------------------------
cd C:\Users\klvit\Documents\PubliShelf_Team\tests
k6 run polling_test.js >> auction_test_results.txt
-----------------------------------------------------------------*/

export default function () {
  const url1 = `${TEST_BASE_URL}/api/buyer/auction-item-detail/${AUCTION_ID}`;
  const url2 = `${TEST_BASE_URL}/api/buyer/auction-poll/${AUCTION_ID}?lastBidTime=2025-11-26T09:19:51.156Z`;

  const cookies = { token: AUTH_TOKEN };
  const headers = { "Content-Type": "application/json" };

  const res = http.get(url2, { headers, cookies });

  check(res, {
    "status is 200": (r) => r.status === 200,
    "response is JSON": (r) =>
      r.headers["Content-Type"]?.includes("application/json"),
  });

  sleep(1);
}

export function handleSummary(data) {
  const timestamp = new Date().toISOString();
  const metrics = data.metrics;

  const get = (key, path, fallback = 0) => {
    try {
      const segments = path.split(".");
      let value = metrics[key];
      for (let s of segments) value = value[s];
      return value ?? fallback;
    } catch {
      return fallback;
    }
  };

  const fmt = (n) => Number(n).toFixed(2);
  const pct = (p) => fmt(get("http_req_duration", `values.p(${p})`, 0));

  const summary = `
============================================================
               📌 K6 Auction Endpoint Test
============================================================
🕒 Timestamp: ${timestamp}

🔧 Test Configuration
------------------------------------------------------------
Virtual Users (VUs):        ${NUMBER_OF_USERS}
Test Duration:              ${TEST_DURATION}
Endpoint Tested:            GET /auction-poll/${AUCTION_ID}

📊 Request Summary
------------------------------------------------------------
Total Requests:             ${get("http_reqs", "values.count")}
Requests Per Second (avg):  ${fmt(get("http_reqs", "values.rate"))}

❗ Errors
------------------------------------------------------------
Failed Requests:            ${fmt(get("http_req_failed", "values.rate") * 100)}%
HTTP Errors (non-200):      ${get("http_req_failed", "values.count")}

⏱️ Response Time (ms)
------------------------------------------------------------
Average:                    ${fmt(get("http_req_duration", "values.avg"))}
Minimum:                    ${fmt(get("http_req_duration", "values.min"))}
Maximum:                    ${fmt(get("http_req_duration", "values.max"))}

Percentiles:
  - p(50):                  ${pct("50")}
  - p(75):                  ${pct("75")}
  - p(90):                  ${pct("90")}
  - p(95):                  ${pct("95")}
  - p(99):                  ${pct("99")}

📦 Data Transfer
------------------------------------------------------------
Sent (bytes):               ${get("data_sent", "values.count")}
Received (bytes):           ${get("data_received", "values.count")}

============================================================
                     🔁 End of Report
============================================================

`;

  return { stdout: summary };
}
