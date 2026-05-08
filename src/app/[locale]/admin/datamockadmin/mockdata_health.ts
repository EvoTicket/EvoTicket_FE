export const healthMockData = {
  perfData: [
    { time: "10:00", requests: 8500, latency: 310, errors: 0.05 },
    { time: "10:15", requests: 9200, latency: 340, errors: 0.08 },
    { time: "10:30", requests: 10500, latency: 380, errors: 0.12 },
    { time: "10:45", requests: 12800, latency: 420, errors: 0.15 },
    { time: "11:00", requests: 11200, latency: 400, errors: 0.10 },
    { time: "11:15", requests: 13500, latency: 450, errors: 0.18 },
    { time: "11:30", requests: 12800, latency: 420, errors: 0.12 },
  ],
  services: [
    { name: "IAM Service", status: "Healthy", latency: "118 ms", uptime: "99.99%", lastIncident: "12 ngày trước", lastCheck: "30s" },
    { name: "API Gateway", status: "Warning", latency: "420 ms", uptime: "99.82%", lastIncident: "Hôm nay 14:22", lastCheck: "20s" },
    { name: "Payment Service", status: "Healthy", latency: "165 ms", uptime: "99.95%", lastIncident: "5 ngày trước", lastCheck: "25s" },
    { name: "Order Service", status: "Degraded", latency: "612 ms", uptime: "99.41%", lastIncident: "Hôm nay 13:08", lastCheck: "18s" },
    { name: "Inventory Service", status: "Healthy", latency: "92 ms", uptime: "99.97%", lastIncident: "21 ngày trước", lastCheck: "40s" },
    { name: "Web3 Worker Service", status: "Warning", latency: "780 ms", uptime: "99.12%", lastIncident: "Hôm nay 12:45", lastCheck: "33s" },
    { name: "Notification Service", status: "Healthy", latency: "210 ms", uptime: "99.93%", lastIncident: "8 ngày trước", lastCheck: "28s" },
    { name: "AI Service", status: "Down", latency: "—", uptime: "97.40%", lastIncident: "Hôm nay 15:02", lastCheck: "1m" },
  ],
  queues: [
    { name: "payment callback queue", backlog: 24, retry: 3, failed: 2, oldest: "2m", status: "Healthy", queued: 24, delayed: 6 },
    { name: "mint job queue", backlog: 86, retry: 14, failed: 11, oldest: "12m", status: "Warning", queued: 86, delayed: 38 },
    { name: "sync job queue", backlog: 12, retry: 1, failed: 1, oldest: "45s", status: "Healthy", queued: 12, delayed: 2 },
    { name: "notification queue", backlog: 6, retry: 0, failed: 0, oldest: "20s", status: "Healthy", queued: 6, delayed: 1 },
  ],
  incidents: [
    { id: "INC-3041", severity: "High", title: "High latency on API Gateway", source: "API Gateway", start: "Hôm nay 14:22", status: "Investigating" },
    { id: "INC-3040", severity: "Critical", title: "Relayer wallet gas balance low", source: "Web3 Worker Service", start: "Hôm nay 13:48", status: "Identified" },
    { id: "INC-3039", severity: "Medium", title: "Mint pipeline delay detected", source: "Web3 Worker Service", start: "Hôm nay 12:45", status: "Monitoring" },
    { id: "INC-3038", severity: "Low", title: "Notification queue backlog rising", source: "Notification Service", start: "Hôm nay 11:20", status: "Monitoring" },
  ]
};
