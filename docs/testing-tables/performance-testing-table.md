# Performance & Load Testing (M3)

**Component:** `GET /api/requests` (List/Filter View)
**Executed By:** Jimmy Baloyi
**Target:** < 3000ms Average Latency (NFR-005)
**Tool Used:** Autocannon (`npx autocannon -c 100 -d 10`)

| Test Case ID | Description | Connections | Duration | Expected Latency | Actual Avg Latency | Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **TC-PERF-001** | High-volume concurrent read access on 1,000 seeded requests. | 100 concurrent | 10 seconds | < 3000ms | **2377.07**ms | ✅ PASS |

**Summary:** The list view endpoint successfully handles 100 concurrent connections well below the 3-second threshold, satisfying NFR-005.