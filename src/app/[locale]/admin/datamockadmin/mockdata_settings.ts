export const settingsMockData = {
  payments: {
    integrations: [
      { name: "VNPay", sub: "common.settings_sub.vnpay_sub", status: "connected", active: true, time: "2" },
      { name: "MoMo", sub: "common.settings_sub.momo_sub", status: "connected", active: true, time: "5" },
      { name: "Stripe", sub: "common.settings_sub.stripe_sub", status: "not_configured", active: false },
    ],
    secrets: [
      { label: "VNPay API key", value: "vnp_8213_9af2_3c1d_4f2a", sub: "common.settings_sub.vnpay_key_sub" },
      { label: "MoMo Partner key", value: "mmo_1102_ab12_ef90_91d7", sub: "common.settings_sub.momo_key_sub" },
      { label: "Web3 Relayer key", value: "w3r_5582_71ee_82a4_b2a4", sub: "common.settings_sub.web3_key_sub" },
    ],
    webhooks: [
      { name: "VNPay callback", url: "https://api.evoticket.vn/v1/webhooks/vnpay", lastSeen: "common.settings_sub.callback_last_seen", status: "healthy", time: "2" },
      { name: "MoMo callback", url: "https://api.evoticket.vn/v1/webhooks/momo", lastSeen: "common.settings_sub.callback_last_seen", status: "healthy", time: "5" },
      { name: "Web3 mint callback", url: "https://api.evoticket.vn/v1/webhooks/mint", lastSeen: "common.settings_sub.callback_error", status: "warning", time: "12" },
    ]
  },
  platform: {
    info: {
      name: "EvoTicket",
      environment: "Production",
      language: "vi-VN",
      currency: "VND"
    },
    ops: [
      { label: "maintenance_mode", sub: "common.settings_sub.maintenance_mode_sub", active: false, highImpact: true },
      { label: "resale_marketplace", sub: "common.settings_sub.resale_market_sub", active: true, highImpact: true },
    ],
    features: [
      { label: "ai_assistant", sub: "common.settings_sub.ai_assistant_sub", active: true, highImpact: false },
      { label: "auto_approve_low_risk", sub: "common.settings_sub.auto_approve_sub", active: false, highImpact: true },
    ],
    support: {
      email: "support@evoticket.vn",
      channel: "#ops-evoticket"
    }
  },
  fees: {
    platform: [
      { label: "platform_fee_percent", value: "1.5", suffix: "%", highImpact: true, sub: "common.settings_sub.platform_fee_sub" },
      { label: "default_royalty", value: "5.0", suffix: "%", highImpact: true, sub: "common.settings_sub.royalty_sub" },
    ],
    resale: [
      { label: "default_resale_cap", value: "110", suffix: "%", highImpact: true, sub: "common.settings_sub.resale_cap_sub" },
      { label: "resale_default_on", sub: "common.settings_sub.resale_on_sub", active: true, highImpact: true },
      { label: "fallback_rules", value: "common.settings_sub.fallback_lock_30", sub: "common.settings_sub.fallback_rules_sub" },
    ]
  }
};
