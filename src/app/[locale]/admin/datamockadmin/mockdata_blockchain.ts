export const blockchainMockData = {
  stats: [
    { label: "total_minted", value: "18,052", sub: "common.cumulative", color: "indigo" },
    { label: "mint_pending_count", value: "24", sub: "common.waiting_queue", color: "amber" },
    { label: "mint_failed", value: "6", sub: "common.jobs_in_dlq", count: 3, color: "rose" },
    { label: "sync_anomalies", value: "4", sub: "common.on_off_chain", color: "amber" },
    { label: "relayer_status", value: "Warning", sub: "common.gas_low_detail", balance: "0.42", unit: "MATIC", color: "rose" }
  ],
  mintQueue: [
    { id: "MD-50211", event: "Anh Trai Say Hi Concert 2026", ticket: "TCK-01928 - token #5821", created: "26/04/2026 14:38", status: "Failed", retry: 3, lastUpdate: "5 phút trước" },
    { id: "MD-50210", event: "VPOP Festival 2026", ticket: "TCK-01927 - token #5820", created: "26/04/2026 14:36", status: "Retrying", retry: 2, lastUpdate: "2 phút trước" },
    { id: "MD-50209", event: "Anh Trai Say Hi Concert 2026", ticket: "TCK-01926 - token #5819", created: "26/04/2026 14:30", status: "Processing", retry: 0, lastUpdate: "30 giây trước" },
    { id: "MD-50208", event: "Indie Night Hà Nội", ticket: "TCK-01925 - token #5818", created: "26/04/2026 14:25", status: "Pending", retry: 0, lastUpdate: "1 phút trước" },
    { id: "MD-50207", event: "VPOP Festival 2026", ticket: "TCK-01924 - token #5817", created: "26/04/2026 14:18", status: "Minted", retry: 0, lastUpdate: "10 phút trước" },
    { id: "MD-50206", event: "Acoustic Saigon Vol.4", ticket: "TCK-01923 - token #5816", created: "26/04/2026 14:05", status: "Failed", retry: 3, lastUpdate: "20 phút trước" },
  ],
  syncAnomalies: [
    { id: "TKN-5821", event: "Anh Trai Say Hi Concert 2026", type: "Owner mismatch", onChain: "0x9af2...3c1d", offChain: "0x71ee...82a4", detected: "5 phút trước", priority: "High" },
    { id: "TKN-5800", event: "VPOP Festival 2026", type: "Metadata hash mismatch", onChain: "0xab12...ef90", offChain: "0xab12...ef91", detected: "12 phút trước", priority: "Medium" },
    { id: "TKN-5777", event: "Indie Night Hà Nội", type: "Delayed confirmation", onChain: "0 conf", offChain: "Confirmed", detected: "18 phút trước", priority: "Medium" },
    { id: "TKN-5301", event: "Acoustic Saigon Vol.4", type: "Missing token mapping", onChain: "token #4238", offChain: "—", detected: "1 giờ trước", priority: "Critical" },
  ],
  recentTxs: [
    { hash: "0x9af2...3c1d", action: "Mint TKN-5817", status: "Confirmed", time: "5 phút trước" },
    { hash: "0xc11f...77b2", action: "Mint TKN-5816", status: "Failed", time: "8 phút trước" },
    { hash: "0xab12...ef90", action: "Transfer TKN-5800", status: "Confirmed", time: "12 phút trước" },
    { hash: "0x71ee...82a4", action: "Mint TKN-5815", status: "Pending", time: "14 phút trước" },
  ],
  tokenResults: [
    { id: "TKN-5821", owner: "0x71ee...82a4 · linh.pham", event: "Anh Trai Say Hi Concert 2026", mint: "Minted", sync: "Mismatch", activity: "Resale 25/04" },
    { id: "TKN-5817", owner: "0x14db...90fc · minh.tran", event: "VPOP Festival 2026", mint: "Minted", sync: "OK", activity: "Check-in 18:42" },
    { id: "TKN-5816", owner: "—", event: "Acoustic Saigon Vol.4", mint: "Failed", sync: "Pending", activity: "Retry queue" },
  ],
  contracts: [
    { name: "EvoTicketNFT", address: "0xA1...f2", status: "Healthy" },
    { name: "EvoMarketplace", address: "0x57...21", status: "Healthy" },
    { name: "EvoRoyalty", address: "0xC9...DA", status: "Warning" },
  ]
};
