"use client";

import React, { useState } from "react";
import { useTranslations } from "next-intl";
import { ChevronRight, HelpCircle, Copy, ExternalLink, ChevronUp, ChevronDown } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";

export default function ProvenancePage() {
    const t = useTranslations("Provenance");
    const params = useParams();
    const [hasError, setHasError] = useState(false); // Toggle this to view error state

    const [expandedBlocks, setExpandedBlocks] = useState<number[]>([]);

    const MOCK_PROVENANCE = {
        ticket: {
            eventName: "Swan Lake Ballet Night 2026",
            eventDate: "14/06/2026",
            eventTime: "20:00",
            venue: "Nhà hát Hòa Bình, TP.HCM",
            ticketType: "VIP",
            seat: "B08",
            ticketCode: "EVT-TK-000201",
            tokenId: "#3017",
            status: "Active",
            originalPrice: "1.800.000đ",
            mintStatus: "Minted",
            checkInStatus: "unused"
        },
        blockchain: {
            network: "Polygon",
            onChainStatus: "recorded",
            transactionHash: "0x7c4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d91b2",
            lastUpdated: "18/03/2026, 10:24",
        },
        history: [
            {
                type: "ISSUED",
                title: "event_issued",
                description: "event_issued_desc",
                timestamp: "18/05/2026, 09:41",
                details: {
                    tokenId: "#3017",
                    txHash: "0x7c4f...91b2"
                }
            },
            {
                type: "OWNERSHIP_ASSIGNED",
                title: "event_ownership_assigned",
                description: "event_ownership_assigned_desc",
                timestamp: "18/05/2026, 09:42",
                details: {
                    owner: "your_account",
                    fromWallet: "0x12ab...78cd",
                    toWallet: "0x98ef...34ea",
                    txHash: "0x7c4f...93b2",
                    blockTime: "18/05/2026, 09:42"
                }
            },
            {
                type: "RESOLD",
                title: "event_resold",
                description: "event_resold_desc",
                timestamp: "20/05/2026, 14:10",
                details: {
                    status: "locked"
                }
            },
            {
                type: "TRANSFERRED",
                title: "event_transferred",
                description: "event_transferred_desc",
                timestamp: "20/05/2026, 14:13",
                details: {
                    status: "transfer_status",
                    fromWallet: "0x12ab...78cd",
                    toWallet: "0x98ef...34ea",
                    txHash: "0x7c4f...93b2",
                    blockTime: "18/05/2026, 09:42"
                }
            },
            {
                type: "USED",
                title: "event_used",
                description: "event_used_desc",
                timestamp: "14/06/2026, 19:47",
                details: {
                    status: "used"
                }
            }
        ]
    };

    const toggleBlock = (index: number) => {
        if (expandedBlocks.includes(index)) {
            setExpandedBlocks(expandedBlocks.filter(i => i !== index));
        } else {
            setExpandedBlocks([...expandedBlocks, index]);
        }
    };

    if (hasError) {
        return (
            <div className="container mx-auto px-4 pb-12 max-w-7xl">
                {/* Breadcrumbs */}
                <div className="flex items-center gap-2 text-sm text-text-secondary mt-6 mb-4">
                    <span>Tài khoản</span>
                    <ChevronRight size={14} />
                    <span>Vé của tôi</span>
                    <ChevronRight size={14} />
                    <span>Components</span>
                    <ChevronRight size={14} />
                    <span className="text-text-primary">{t("page_title")}</span>
                </div>

                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                    <div>
                        <h1 className="text-4xl font-bold text-text-primary mb-2">{t("page_title")}</h1>
                        <p className="text-text-secondary">{t("page_subtitle")}</p>
                    </div>
                    <button className="bg-[#e4e7ec] hover:bg-[#d0d5dd] text-[#1d2939] dark:bg-[#1e293b] dark:text-white px-6 py-2.5 rounded-lg outline-none font-medium transition-colors text-sm">
                        {t("back_to_ticket")}
                    </button>
                </div>

                {/* Error Box */}
                <div className="flex justify-center items-center py-20">
                    <div className="bg-bg-surface border border-border-default rounded-xl p-8 max-w-md w-full text-center flex flex-col items-center">
                        <div className="w-14 h-14 border border-border-default rounded-lg flex items-center justify-center mb-6 shadow-sm">
                            <HelpCircle size={24} className="text-text-secondary" />
                        </div>
                        <h3 className="text-lg font-bold text-text-primary mb-2">{t("error_title")}</h3>
                        <p className="text-sm text-text-secondary mb-8 leading-relaxed">
                            {t("error_desc")}
                        </p>
                        <div className="flex w-full gap-3 justify-center">
                            <button
                                onClick={() => setHasError(false)}
                                className="bg-primary hover:bg-primary-hover text-white px-6 py-2.5 rounded-lg font-medium transition-colors text-sm flex-1 max-w-[140px]"
                            >
                                {t("retry")}
                            </button>
                            <button className="bg-transparent hover:bg-secondary text-primary px-6 py-2.5 rounded-lg font-medium transition-colors text-sm flex-1 max-w-[160px]">
                                {t("back_to_ticket")}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 pb-12 max-w-7xl">
            {/* Breadcrumbs */}
            <div className="flex items-center gap-2 text-sm text-text-secondary mt-6 mb-4">
                <span>Tài khoản</span>
                <ChevronRight size={14} />
                <span>Vé của tôi</span>
                <ChevronRight size={14} />
                <span>Provenance</span>
            </div>

            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                <div>
                    <h1 className="text-4xl font-bold text-text-primary mb-2">{t("page_title")}</h1>
                    <p className="text-text-secondary">{t("page_subtitle")}</p>
                </div>
                <button className="bg-[#e4e7ec] hover:bg-[#d0d5dd] text-[#1d2939] dark:bg-[#1e293b] dark:text-white px-6 py-2.5 rounded-lg outline-none font-medium transition-colors text-sm">
                    {t("back_to_ticket")}
                </button>
            </div>

            {/* Ticket Info Card */}
            <div className="bg-bg-surface border border-border-default rounded-xl p-6 mb-8">
                <h2 className="text-xl font-bold text-text-primary mb-1">{MOCK_PROVENANCE.ticket.eventName}</h2>
                <div className="text-sm text-text-secondary mb-6">
                    <p>{MOCK_PROVENANCE.ticket.eventTime} - {MOCK_PROVENANCE.ticket.eventDate}</p>
                    <p>{MOCK_PROVENANCE.ticket.venue}</p>
                </div>

                <div className="border-t border-border-default pt-4 flex flex-wrap gap-x-6 gap-y-3 text-xs md:text-sm items-center">
                    <div>
                        <span className="text-text-muted">{t("ticket_type")}: </span>
                        <span className="font-semibold text-text-primary">{MOCK_PROVENANCE.ticket.ticketType}</span>
                    </div>
                    <div>
                        <span className="text-text-muted">{t("seat")}: </span>
                        <span className="font-semibold text-text-primary">{MOCK_PROVENANCE.ticket.seat}</span>
                    </div>
                    <div>
                        <span className="text-text-muted">{t("ticket_code")}: </span>
                        <span className="font-semibold text-text-primary">{MOCK_PROVENANCE.ticket.ticketCode}</span>
                    </div>
                    <div>
                        <span className="text-text-muted">{t("token_id")}: </span>
                        <span className="font-semibold text-text-primary">{MOCK_PROVENANCE.ticket.tokenId}</span>
                    </div>
                    <div className="bg-[#1a1a1a] text-[#f1f5f9] dark:bg-black px-2 py-1 rounded text-xs font-semibold">
                        {t("valid")}
                    </div>
                </div>

                <p className="text-xs text-text-secondary mt-4">
                    {t("help_verify_desc")}
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Left Column */}
                <div className="lg:col-span-8 flex flex-col gap-6">
                    {/* Blockchain Verification */}
                    <div className="bg-bg-surface border border-border-default rounded-xl p-6">
                        <div className="flex items-center gap-2 mb-6">
                            <h3 className="font-bold text-text-primary text-base flex items-center gap-2">
                                <span className="text-lg">📦</span> {t("verified_on_blockchain")}
                            </h3>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-8 text-sm mb-6 max-w-xl">
                            <div className="text-text-muted">{t("network")}</div>
                            <div className="font-medium text-text-primary">{MOCK_PROVENANCE.blockchain.network}</div>

                            <div className="text-text-muted">{t("token_id")}</div>
                            <div className="font-medium text-text-primary">{MOCK_PROVENANCE.ticket.tokenId}</div>

                            <div className="text-text-muted">{t("on_chain_status")}</div>
                            <div className="font-medium text-text-primary">{t(MOCK_PROVENANCE.blockchain.onChainStatus)}</div>

                            <div className="text-text-muted">{t("current_owner")}</div>
                            <div className="font-medium text-text-primary">{t("your_account")}</div>

                            <div className="text-text-muted">{t("transaction")}</div>
                            <div className="font-medium text-text-primary font-mono text-xs">
                                {MOCK_PROVENANCE.blockchain.transactionHash.substring(0, 6)}...{MOCK_PROVENANCE.blockchain.transactionHash.substring(MOCK_PROVENANCE.blockchain.transactionHash.length - 4)}
                            </div>

                            <div className="text-text-muted">{t("last_updated")}</div>
                            <div className="font-medium text-text-primary">{MOCK_PROVENANCE.blockchain.lastUpdated}</div>
                        </div>

                        <div className="flex flex-wrap gap-3">
                            <button className="flex items-center gap-1.5 px-3 py-1.5 border border-border-default rounded-md text-xs font-medium text-text-primary hover:bg-secondary transition-colors">
                                <Copy size={14} /> {t("copy_token_id")}
                            </button>
                            <button className="flex items-center gap-1.5 px-3 py-1.5 border border-border-default rounded-md text-xs font-medium text-text-primary hover:bg-secondary transition-colors">
                                <Copy size={14} /> {t("copy_tx")}
                            </button>
                            <button className="flex items-center gap-1.5 px-3 py-1.5 border border-border-default rounded-md text-xs font-medium text-text-primary hover:bg-secondary transition-colors">
                                <ExternalLink size={14} /> {t("open_explorer")}
                            </button>
                        </div>
                    </div>

                    {/* Ticket Info */}
                    <div className="bg-bg-surface border border-border-default rounded-xl p-6">
                        <h3 className="font-bold text-text-primary text-base mb-6">{t("ticket_info_card")}</h3>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-8 text-sm max-w-xl">
                            <div className="text-text-muted">{t("original_price")}</div>
                            <div className="font-medium text-text-primary">{MOCK_PROVENANCE.ticket.originalPrice}</div>

                            <div className="text-text-muted">{t("ticket_state")}</div>
                            <div className="font-medium text-text-primary">{MOCK_PROVENANCE.ticket.status}</div>

                            <div className="text-text-muted">{t("mint_state")}</div>
                            <div className="font-medium text-text-primary">{MOCK_PROVENANCE.ticket.mintStatus}</div>

                            <div className="text-text-muted">{t("check_in_status")}</div>
                            <div className="font-medium text-text-primary">{t(MOCK_PROVENANCE.ticket.checkInStatus)}</div>
                        </div>
                    </div>

                    {/* Ownership History */}
                    <div className="bg-bg-surface border border-border-default rounded-xl p-6">
                        <h3 className="font-bold text-text-primary text-base mb-2">{t("ownership_history")}</h3>
                        <p className="text-xs text-text-secondary mb-8">{t("ownership_history_desc")}</p>

                        <div className="ml-2 relative">
                            {/* Vertical Line */}
                            <div className="absolute left-[4px] top-2 bottom-0 w-px bg-border-default"></div>

                            {MOCK_PROVENANCE.history.map((item, index) => (
                                <div key={index} className={`relative pl-6 ${index === MOCK_PROVENANCE.history.length - 1 ? "" : "pb-8"}`}>
                                    <div className="absolute w-2.5 h-2.5 bg-bg-page border-2 border-text-primary rounded-full -left-[1px] top-1"></div>
                                    
                                    {/* White mask for the last item to cover the bottom of the vertical line */}
                                    {index === MOCK_PROVENANCE.history.length - 1 && (
                                        <div className="absolute left-[4px] top-4 bottom-[-10px] w-[3px] bg-bg-surface z-0"></div>
                                    )}

                                    <div className="flex flex-col sm:flex-row sm:justify-between items-start gap-1 relative z-10">
                                        <div>
                                            <h4 className="font-semibold text-sm text-text-primary">{t(item.title)}</h4>
                                            <p className="text-xs text-text-secondary mt-1 max-w-sm">{t(item.description)}</p>
                                        </div>
                                        <span className="text-[11px] text-text-muted whitespace-nowrap">{item.timestamp}</span>
                                    </div>

                                    {/* Item Details */}
                                    <div className="mt-4 relative z-10">
                                        {item.type === "ISSUED" && (
                                            <div className="border border-border-default rounded p-3 bg-bg-page">
                                                <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 text-[11px]">
                                                    <div className="sm:col-span-3 text-text-muted">Token ID:</div>
                                                    <div className="sm:col-span-9 font-medium">{item.details.tokenId}</div>
                                                    <div className="sm:col-span-3 text-text-muted">Tx:</div>
                                                    <div className="sm:col-span-9 font-medium font-mono text-[10px]">{item.details.txHash}</div>
                                                </div>
                                            </div>
                                        )}

                                        {(item.type === "OWNERSHIP_ASSIGNED" || item.type === "TRANSFERRED") && (
                                            <>
                                                <div className="text-[11px] mb-3">
                                                    <span className="text-text-muted w-20 inline-block">{t("owner")}:</span>
                                                    <span className="font-medium text-text-primary">{item.details.owner === "your_account" ? t("your_account") : item.details.owner}</span>
                                                </div>
                                                <div className="border border-border-default rounded bg-bg-page overflow-hidden">
                                                    <button 
                                                        onClick={() => toggleBlock(index)}
                                                        className="w-full flex items-center justify-between p-3 text-xs font-medium text-text-secondary hover:bg-secondary transition-colors"
                                                    >
                                                        <span className="underline underline-offset-2">{t("blockchain_details")}</span>
                                                        {expandedBlocks.includes(index) ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                                                    </button>
                                                    
                                                    {expandedBlocks.includes(index) && (
                                                        <div className="p-3 pt-0 border-t border-border-default mt-2">
                                                            <div className="grid grid-cols-1 sm:grid-cols-12 gap-y-2 mt-2 text-[11px]">
                                                                <div className="sm:col-span-3 text-text-muted">{t("from_wallet")}:</div>
                                                                <div className="sm:col-span-9 font-medium font-mono text-[10px]">{item.details.fromWallet}</div>
                                                                <div className="sm:col-span-3 text-text-muted">{t("to_wallet")}:</div>
                                                                <div className="sm:col-span-9 font-medium font-mono text-[10px]">{item.details.toWallet}</div>
                                                                <div className="sm:col-span-3 text-text-muted">{t("tx_hash")}:</div>
                                                                <div className="sm:col-span-9 font-medium font-mono text-[10px]">{item.details.txHash}</div>
                                                                <div className="sm:col-span-3 text-text-muted">{t("block_time")}:</div>
                                                                <div className="sm:col-span-9 font-medium">{item.details.blockTime}</div>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            </>
                                        )}

                                        {(item.type === "RESOLD" || item.type === "USED") && (
                                            <div className="border border-border-default rounded p-3 bg-bg-page">
                                                <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 text-[11px]">
                                                    <div className="sm:col-span-3 text-text-muted">{t("status")}:</div>
                                                    <div className="sm:col-span-9 font-medium">{t(item.details.status)}</div>
                                                </div>
                                            </div>
                                        )}

                                        {item.type !== "OWNERSHIP_ASSIGNED" && item.type !== "TRANSFERRED" && (
                                            <button className="mt-2 text-xs font-medium text-text-secondary hover:text-text-primary underline underline-offset-2 w-full text-left">
                                                {t("blockchain_details")}
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>

                    </div>
                </div>

                {/* Right Column */}
                <div className="lg:col-span-4 flex flex-col gap-6">
                    {/* Summary */}
                    <div className="bg-[#fafafa] dark:bg-[#1a1a1a] border border-border-default rounded-xl p-6">
                        <h3 className="font-bold text-text-primary text-sm mb-4">{t("verified_summary")}</h3>
                        
                        <div className="grid grid-cols-2 gap-y-3 text-xs">
                            <div className="text-text-muted">{t("valid_ticket")}</div>
                            <div className="font-medium text-text-primary text-right">{t("yes")}</div>

                            <div className="text-text-muted">{t("token_id")}</div>
                            <div className="font-medium text-text-primary text-right">{MOCK_PROVENANCE.ticket.tokenId}</div>

                            <div className="text-text-muted">{t("current_owner")}</div>
                            <div className="font-medium text-text-primary text-right">{t("your_account")}</div>

                            <div className="text-text-muted">{t("ticket_state")}</div>
                            <div className="font-medium text-text-primary text-right">{MOCK_PROVENANCE.ticket.status}</div>

                            <div className="text-text-muted">{t("history")}</div>
                            <div className="font-medium text-text-primary text-right">{t("milestones", { count: MOCK_PROVENANCE.history.length })}</div>
                        </div>
                    </div>

                    {/* What is provenance */}
                    <div className="border border-border-default rounded-xl p-6">
                        <h3 className="font-bold text-text-primary flex items-center gap-2 text-sm mb-3">
                            <HelpCircle size={16} /> {t("what_is_provenance")}
                        </h3>
                        <p className="text-xs text-text-secondary leading-relaxed">
                            {t("what_is_provenance_desc")}
                        </p>
                    </div>

                    {/* Actions */}
                    <div className="border border-border-default rounded-xl p-6">
                        <h3 className="font-bold text-text-primary text-sm mb-4">{t("actions")}</h3>
                        
                        <div className="flex flex-col gap-3">
                            <button className="w-full bg-[#f8f9fa] dark:bg-[#262626] hover:bg-[#e9ecef] dark:hover:bg-[#333] border border-transparent text-[#212529] dark:text-white px-4 py-2.5 rounded-lg text-sm font-medium transition-colors">
                                {t("back_to_ticket")}
                            </button>
                            <button className="w-full bg-[#e2e8f0] dark:bg-[#334155] hover:bg-[#cbd5e1] dark:hover:bg-[#475569] text-[#0f172a] dark:text-white px-4 py-2.5 rounded-lg text-sm font-medium transition-colors">
                                {t("resell_ticket")}
                            </button>
                            <button className="w-full bg-[#f1f5f9] dark:bg-[#1e293b] hover:bg-[#e2e8f0] dark:hover:bg-[#334155] text-[#334155] dark:text-[#cbd5e1] px-4 py-2.5 rounded-lg text-sm font-medium transition-colors">
                                {t("contact_support")}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
