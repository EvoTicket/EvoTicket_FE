"use client";

import { useState } from "react";
import {
  Network,
  Cpu,
  Zap,
  AlertCircle,
  Layers,
  RefreshCw,
  ChevronDown,
  CheckCircle2,
  XCircle,
  Clock,
  ExternalLink,
  ShieldAlert,
  Wallet,
  Activity,
  ArrowRightLeft,
  Search,
  Database,
  Info,
  Server
} from "lucide-react";
import { useTranslations } from "next-intl";
import { blockchainMockData } from "../datamockadmin/mockdata_blockchain";

export default function AdminBlockchainPage() {
  const t = useTranslations("Admin");
  const [activeTab, setActiveTab] = useState("overview");

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex items-end justify-between">
        <div>
          <p className="text-[10px] font-bold text-txt-muted uppercase tracking-widest mb-1">ADM-07</p>
          <h1 className="text-3xl font-extrabold text-txt-primary tracking-tight">{t("blockchain_title")}</h1>
          <p className="text-sm text-txt-secondary mt-1">{t("blockchain_subtitle")}</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-surface border border-border rounded-ds-xl px-4 py-2.5 shadow-sm text-xs font-bold text-txt-primary">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
            Polygon Mainnet
            <ChevronDown size={14} className="text-txt-muted ml-2" />
          </div>
          <button className="flex items-center gap-2 bg-primary hover:bg-primary-hover text-white px-5 py-2.5 rounded-ds-xl font-bold shadow-lg shadow-primary/20 transition-all">
            <RefreshCw size={18} />
            <span>{t("btn_refresh")}</span>
          </button>
        </div>
      </div>

      {/* Stats Cards (Mini) - Only show on overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
        {blockchainMockData.stats.map((stat, i) => (
          <StatsCard key={i} icon={
            stat.label === "total_minted" ? <Zap size={20} /> :
              stat.label === "mint_pending_count" ? <Clock size={20} /> :
                stat.label === "mint_failed" ? <XCircle size={20} /> :
                  stat.label === "sync_anomalies" ? <ArrowRightLeft size={20} /> :
                    <Cpu size={20} />
          } label={t(stat.label)} value={stat.value} sub={t(stat.sub, { count: stat.count, balance: stat.balance, unit: stat.unit } as any)} color={stat.color} />
        ))}
      </div>

      {/* Tabs Control */}
      <div className="flex items-center bg-surface border border-border rounded-ds-2xl p-1 w-fit shadow-sm">
        {["overview", "mint_pipeline", "sync_monitor", "contract_relayer", "token_lookup"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-6 py-2 text-xs font-bold rounded-ds-xl transition-all ${activeTab === tab ? "bg-main text-primary shadow-sm border border-border" : "text-txt-muted hover:text-txt-secondary"
              }`}
          >
            {t(`tab_${tab}`)}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="animate-in fade-in duration-500">
        {activeTab === "overview" && <OverviewTab t={t} />}
        {activeTab === "mint_pipeline" && <MintPipelineTab t={t} />}
        {activeTab === "sync_monitor" && <SyncMonitorTab t={t} />}
        {activeTab === "contract_relayer" && <ContractRelayerTab t={t} />}
        {activeTab === "token_lookup" && <TokenLookupTab t={t} />}
      </div>
    </div>
  );
}

function OverviewTab({ t }: any) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* Mint Status */}
      <div className="bg-surface border border-border rounded-ds-3xl p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-6">
          <Zap size={18} className="text-primary" />
          <h3 className="text-sm font-black text-txt-primary">{t("mint_status")}</h3>
        </div>
        <div className="space-y-4">
          <MetricRow label={t("common.mint_success")} value="18,052" />
          <MetricRow label={t("common.pending_jobs")} value="24" highlight="amber" />
          <MetricRow label={t("common.failed_jobs")} value="6" highlight="rose" />
          <MetricRow label={t("common.retry_1h")} value="14" />
        </div>
      </div>

      {/* On-chain / Off-chain */}
      <div className="bg-surface border border-border rounded-ds-3xl p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-6">
          <ArrowRightLeft size={18} className="text-primary" />
          <h3 className="text-sm font-black text-txt-primary">{t("on_chain_off_chain")}</h3>
        </div>
        <div className="space-y-4">
          <MetricRow label={t("matched_records")} value="18,044" />
          <MetricRow label={t("owner_mismatch")} value="3" highlight="amber" />
          <MetricRow label={t("metadata_sync_issues")} value="1" highlight="rose" />
          <MetricRow label={t("delayed_confirmations")} value="2" />
        </div>
      </div>

      {/* Relayer & Tx */}
      <div className="bg-surface border border-border rounded-ds-3xl p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-6">
          <Cpu size={18} className="text-primary" />
          <h3 className="text-sm font-black text-txt-primary">{t("relayer_tx")}</h3>
        </div>
        <div className="space-y-4">
          <MetricRow label={t("gas_balance")} value={`0.42 MATIC · ${t("common.severity.low")}`} highlight="rose" />
          <MetricRow label={t("pending_tx")} value="7" />
          <MetricRow label={t("failed_tx_1h")} value="2" highlight="rose" />
          <MetricRow label={t("last_successful_relay")} value={t("common.minutes_ago", { count: 5 })} highlight="emerald" />
        </div>
      </div>
    </div>
  );
}

function MintPipelineTab({ t }: any) {
  return (
    <div className="bg-surface border border-border rounded-ds-3xl overflow-hidden shadow-sm">
      <div className="p-6 border-b border-border flex items-center gap-2">
        <Cpu size={18} className="text-txt-muted" />
        <h3 className="text-sm font-black text-txt-primary">Mint job queue</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-main/50 text-[10px] font-bold text-txt-muted uppercase tracking-widest border-b border-border">
              <th className="px-6 py-4">Job ID</th>
              <th className="px-6 py-4">Event</th>
              <th className="px-6 py-4">Ticket / Token</th>
              <th className="px-6 py-4">Created</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4">Retry</th>
              <th className="px-6 py-4">Last updated</th>
              <th className="px-6 py-4 text-right"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {blockchainMockData.mintQueue.map((job, i) => (
              <tr key={i} className="hover:bg-main/30 transition-colors group">
                <td className="px-6 py-4 text-xs font-black text-txt-primary">{job.id}</td>
                <td className="px-6 py-4 text-xs font-bold text-txt-secondary">{job.event}</td>
                <td className="px-6 py-4 text-[11px] font-medium text-txt-muted">{job.ticket}</td>
                <td className="px-6 py-4 text-[11px] font-medium text-txt-muted">{job.created}</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-0.5 rounded-ds-lg text-[9px] font-black uppercase border flex items-center gap-1 w-fit ${job.status === 'Minted' ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' :
                    job.status === 'Failed' ? 'bg-rose-500/10 text-rose-600 border-rose-500/20' :
                      job.status === 'Processing' ? 'bg-indigo-500/10 text-indigo-600 border-indigo-500/20' :
                        'bg-amber-500/10 text-amber-600 border-amber-500/20'
                    }`}>
                    {job.status === 'Minted' && <CheckCircle2 size={10} />}
                    {job.status === 'Failed' && <XCircle size={10} />}
                    {job.status === 'Processing' && <Activity size={10} />}
                    {job.status === 'Pending' && <Clock size={10} />}
                    {job.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-xs font-black text-txt-primary">{job.retry}</td>
                <td className="px-6 py-4 text-xs font-medium text-txt-muted">{job.lastUpdate}</td>
                <td className="px-6 py-4 text-right">
                  <button className="text-[10px] font-black text-primary hover:underline">Retry</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function SyncMonitorTab({ t }: any) {
  return (
    <div className="bg-surface border border-border rounded-ds-3xl overflow-hidden shadow-sm">
      <div className="p-6 border-b border-border flex items-center gap-2">
        <AlertCircle size={18} className="text-txt-muted" />
        <h3 className="text-sm font-black text-txt-primary">{t("sync_anomalies")}</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-main/50 text-[10px] font-bold text-txt-muted uppercase tracking-widest border-b border-border">
              <th className="px-6 py-4">Record ID</th>
              <th className="px-6 py-4">Event</th>
              <th className="px-6 py-4">Logical mismatch</th>
              <th className="px-6 py-4">On-chain</th>
              <th className="px-6 py-4">Off-chain</th>
              <th className="px-6 py-4">Detected</th>
              <th className="px-6 py-4">Priority</th>
              <th className="px-6 py-4 text-right"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {blockchainMockData.syncAnomalies.map((item, i) => (
              <tr key={i} className="hover:bg-main/30 transition-colors group">
                <td className="px-6 py-4 text-xs font-black text-txt-primary">{item.id}</td>
                <td className="px-6 py-4 text-xs font-bold text-txt-secondary">{item.event}</td>
                <td className="px-6 py-4 text-xs font-black text-txt-primary">{item.type}</td>
                <td className="px-6 py-4 text-[10px] font-medium text-txt-muted truncate max-w-[120px]">{item.onChain}</td>
                <td className="px-6 py-4 text-[10px] font-medium text-txt-muted truncate max-w-[120px]">{item.offChain}</td>
                <td className="px-6 py-4 text-xs font-medium text-txt-muted">{item.detected}</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase border ${item.priority === 'Critical' ? 'bg-rose-500/10 text-rose-600 border-rose-500/20' :
                    item.priority === 'High' ? 'bg-orange-500/10 text-orange-600 border-orange-500/20' :
                      'bg-amber-500/10 text-amber-600 border-amber-500/20'
                    }`}>
                    {item.priority}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <button className="text-[10px] font-black text-primary hover:underline">Reconcile</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function ContractRelayerTab({ t }: any) {
  return (
    <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
      {/* Left Sidebar - Wallet Info */}
      <div className="xl:col-span-4 space-y-6">
        <div className="bg-surface border border-border rounded-ds-3xl p-6 shadow-sm space-y-6">
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-txt-muted">
              <Wallet size={16} />
              <h3 className="text-[10px] font-bold uppercase tracking-widest">Relayer wallet</h3>
            </div>
            <div className="space-y-3">
              <div className="flex flex-col gap-1">
                <span className="text-[10px] font-bold text-txt-muted uppercase"># Address</span>
                <span className="text-xs font-black text-txt-primary">0x71ee...82a4</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-[10px] font-bold text-txt-muted uppercase">Network</span>
                <span className="text-xs font-bold text-emerald-600">Polygon Mainnet</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-[10px] font-bold text-txt-muted uppercase">{t("filter_status")}</span>
                <span className="text-xs font-black text-amber-600">Active · Warning</span>
              </div>
            </div>
            <button className="w-full py-3 bg-primary text-white rounded-ds-xl text-xs font-black shadow-lg shadow-primary/20 hover:bg-primary-hover transition-all">
              {t("btn_request_gas_topup")}
            </button>
          </div>

          <div className="pt-6 border-t border-border space-y-4">
            <div className="flex items-center gap-2 text-txt-muted">
              <Zap size={16} />
              <h3 className="text-[10px] font-bold uppercase tracking-widest">Gas balance</h3>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between items-end">
                <span className="text-sm font-black text-rose-600">0.42 MATIC</span>
              </div>
              <div className="h-1.5 w-full bg-main rounded-full overflow-hidden">
                <div className="h-full bg-rose-500" style={{ width: '42%' }}></div>
              </div>
              <p className="text-[9px] text-txt-muted font-medium italic">{t("gas_warning_threshold", { threshold: "1.0" })}</p>
            </div>
          </div>

          <div className="pt-6 border-t border-border space-y-4">
            <div className="flex items-center gap-2 text-txt-muted">
              <Network size={16} />
              <h3 className="text-[10px] font-bold uppercase tracking-widest">RPC connectivity</h3>
            </div>
            <div className="space-y-3">
              <div className="flex flex-col gap-1">
                <span className="text-[10px] font-bold text-txt-muted uppercase">RPC latency</span>
                <span className="text-xs font-black text-amber-600">820 ms · Elevated</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-[10px] font-bold text-txt-muted uppercase">Block height</span>
                <span className="text-xs font-black text-txt-primary">58,201,442</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-[10px] font-bold text-txt-muted uppercase">Last block</span>
                <span className="text-xs font-medium text-txt-muted">{t("seconds_ago", { count: 3 })}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Content - Contract Health & Recent Txs */}
      <div className="xl:col-span-8 space-y-6">
        <div className="bg-surface border border-border rounded-ds-3xl p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-6">
            <Database size={18} className="text-txt-muted" />
            <h3 className="text-sm font-black text-txt-primary">Contract health</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {blockchainMockData.contracts.map((c, i) => (
              <div key={i} className="p-4 rounded-ds-2xl bg-main border border-border">
                <p className="text-xs font-black text-txt-primary mb-1">{c.name}</p>
                <p className="text-[10px] font-medium text-txt-muted mb-3">{c.address}</p>
                <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase border ${c.status === 'Healthy' ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' : 'bg-amber-500/10 text-amber-600 border-amber-500/20'
                  }`}>
                  {c.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-surface border border-border rounded-ds-3xl overflow-hidden shadow-sm">
          <div className="p-6 border-b border-border flex items-center gap-2">
            <ArrowRightLeft size={18} className="text-txt-muted" />
            <h3 className="text-sm font-black text-txt-primary">{t("recent_transactions")}</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-main/50 text-[10px] font-bold text-txt-muted uppercase tracking-widest border-b border-border">
                  <th className="px-6 py-4">Tx hash</th>
                  <th className="px-6 py-4">Action</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">{t("log_time")}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {blockchainMockData.recentTxs.map((tx, i) => (
                  <tr key={i} className="hover:bg-main/30 transition-colors">
                    <td className="px-6 py-4 text-[11px] font-black text-primary">{tx.hash}</td>
                    <td className="px-6 py-4 text-[11px] font-bold text-txt-secondary">{tx.action}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase border ${tx.status === 'Confirmed' ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' :
                        tx.status === 'Failed' ? 'bg-rose-500/10 text-rose-600 border-rose-500/20' :
                          'bg-amber-500/10 text-amber-600 border-amber-500/20'
                        }`}>
                        {tx.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right text-xs font-medium text-txt-muted">{tx.time}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

function TokenLookupTab({ t }: any) {
  return (
    <div className="space-y-6">
      {/* Search Bar */}
      <div className="bg-surface border border-border rounded-ds-3xl p-4 shadow-sm flex items-center gap-4">
        <Search className="text-txt-muted ml-2" size={20} />
        <input
          type="text"
          placeholder={t("search_token_placeholder")}
          className="flex-1 bg-transparent border-none outline-none text-sm font-medium text-txt-primary placeholder:text-txt-muted"
        />
        <div className="px-3 py-1 bg-main rounded-ds-lg text-[10px] font-bold text-txt-muted border border-border">3 token</div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
        {/* Results Table */}
        <div className="xl:col-span-8 bg-surface border border-border rounded-ds-3xl overflow-hidden shadow-sm h-fit">
          <div className="p-6 border-b border-border flex items-center gap-2">
            <Activity size={18} className="text-txt-muted" />
            <h3 className="text-sm font-black text-txt-primary">{t("token_results")}</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-main/50 text-[10px] font-bold text-txt-muted uppercase tracking-widest border-b border-border">
                  <th className="px-6 py-4">Token ID</th>
                  <th className="px-6 py-4">Owner</th>
                  <th className="px-6 py-4">Event</th>
                  <th className="px-6 py-4">Mint</th>
                  <th className="px-6 py-4">Sync</th>
                  <th className="px-6 py-4 text-right">{t("col_activity")}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {blockchainMockData.tokenResults.map((token, i) => (
                  <tr key={i} className="hover:bg-main/30 transition-colors group cursor-pointer">
                    <td className="px-6 py-4 text-xs font-black text-txt-primary">{token.id}</td>
                    <td className="px-6 py-4 text-[10px] font-medium text-txt-muted">{token.owner}</td>
                    <td className="px-6 py-4 text-xs font-bold text-txt-secondary">{token.event}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase border ${token.mint === 'Minted' ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' : 'bg-rose-500/10 text-rose-600 border-rose-500/20'
                        }`}>
                        {token.mint}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase border ${token.sync === 'OK' ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' :
                        token.sync === 'Mismatch' ? 'bg-rose-500/10 text-rose-600 border-rose-500/20' :
                          'bg-amber-500/10 text-amber-600 border-amber-500/20'
                        }`}>
                        {token.sync}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right text-[10px] font-bold text-txt-muted">{token.activity}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Token Detail Sidebar */}
        <div className="xl:col-span-4 bg-surface border border-border rounded-ds-3xl p-6 shadow-sm h-fit space-y-6">
          <div className="flex items-center gap-2">
            <Database size={18} className="text-indigo-500" />
            <h3 className="text-sm font-black text-txt-primary">{t("token_detail_title", { id: "TKN-5821" })}</h3>
          </div>

          <div className="space-y-6">
            <DetailItemSidebar icon={<Info size={14} />} label="# Token ID" value="TKN-5821" />
            <DetailItemSidebar icon={<User size={14} />} label="Owner" value="0x71ee...82a4 · linh.pham" />
            <DetailItemSidebar icon={<Calendar size={14} />} label="Event" value="Anh Trai Say Hi Concert 2026" />
            <DetailItemSidebar icon={<Database size={14} />} label="Metadata" value="ipfs://Qm...s9d" />
            <DetailItemSidebar icon={<ArrowRightLeft size={14} />} label="Mint Tx" value="0x9af2...3c1d" />
            <DetailItemSidebar icon={<Activity size={14} />} label={t("last_activity")} value="Resale 25/04" />

            <div className="bg-main/50 border border-border rounded-ds-2xl p-4">
              <p className="text-[10px] font-bold text-txt-muted uppercase tracking-widest mb-2">{t("sync_summary")}</p>
              <p className="text-xs text-txt-secondary font-medium leading-relaxed">
                {t("sync_summary_warning")}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Reusable sub-components
function StatsCard({ icon, label, value, sub, color }: any) {
  const colors: any = {
    indigo: "bg-primary/10 text-primary",
    amber: "bg-amber-500/10 text-amber-600",
    rose: "bg-rose-500/10 text-rose-600",
    emerald: "bg-emerald-500/10 text-emerald-600",
    gray: "bg-main text-txt-muted",
  };

  return (
    <div className="bg-surface border border-border rounded-ds-2xl p-5 shadow-sm hover:shadow-md transition-all group">
      <div className="flex items-center gap-3 mb-3">
        <div className={`w-9 h-9 rounded-ds-xl flex items-center justify-center transition-transform group-hover:scale-110 ${colors[color]}`}>
          {icon}
        </div>
        <span className="text-[10px] font-bold text-txt-muted uppercase tracking-widest">{label}</span>
      </div>
      <p className="text-xl font-black text-txt-primary tracking-tight mb-1">{value}</p>
      <p className="text-[10px] text-txt-muted font-medium">{sub}</p>
    </div>
  );
}

function MetricRow({ label, value, highlight }: any) {
  const highlightStyles: any = {
    rose: "text-rose-600",
    amber: "text-amber-600",
    emerald: "text-emerald-600",
    indigo: "text-primary",
  };

  return (
    <div className="flex items-center justify-between py-1 border-b border-border last:border-0 pb-3">
      <span className="text-xs font-medium text-txt-muted">{label}</span>
      <span className={`text-xs font-black ${highlight ? highlightStyles[highlight] : "text-txt-primary"}`}>
        {value}
      </span>
    </div>
  );
}

function DetailItemSidebar({ icon, label, value }: any) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center gap-2 text-txt-muted">
        {icon}
        <span className="text-[10px] font-bold uppercase tracking-widest">{label}</span>
      </div>
      <p className="text-xs font-black text-txt-primary ml-6">{value}</p>
    </div>
  );
}

function User({ size, className }: any) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
    </svg>
  );
}

function Calendar({ size, className }: any) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <rect width="18" height="18" x="3" y="4" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  );
}
