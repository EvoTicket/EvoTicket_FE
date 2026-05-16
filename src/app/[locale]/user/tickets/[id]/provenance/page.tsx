"use client";

import React, { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { ChevronRight, HelpCircle, Copy, ExternalLink, ChevronUp, ChevronDown, Loader2 } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import api from "@/src/lib/axios";

interface ProvenanceData {
    ticket: {
        eventName: string;
        eventDate: string;
        eventTime: string;
        venue: string;
        ticketType: string;
        seat: string;
        ticketCode: string;
        tokenId: string;
        status: string;
        originalPrice: string;
        mintStatus: string;
        checkInStatus: string;
    };
    blockchain: {
        network: string;
        onChainStatus: string;
        transactionHash: string;
        contractAddress: string;
        fromBlock: number;
        toBlock: number;
        lastUpdated: string;
    };
    history: {
        type: string;
        title: string;
        description: string;
        timestamp: string;
        details: any;
    }[];
}

export default function ProvenancePage() {
    const t = useTranslations("Provenance");
    const params = useParams();
    const locale = params?.locale || "vi";
    const id = params?.id;

    const [data, setData] = useState<ProvenanceData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [hasError, setHasError] = useState(false);
    const [expandedBlocks, setExpandedBlocks] = useState<number[]>([]);

    const fetchProvenance = async () => {
        setIsLoading(true);
        setHasError(false);
        try {
            const response = await api.get(`/order-service/api/v1/tickets/${id}/provenance`);
            if (response.data && response.data.data) {
                setData(response.data.data);
            } else {
                setHasError(true);
            }
        } catch (error) {
            console.error("Failed to fetch provenance", error);
            setHasError(true);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (id) {
            fetchProvenance();
        }
    }, [id]);

    const toggleBlock = (index: number) => {
        if (expandedBlocks.includes(index)) {
            setExpandedBlocks(expandedBlocks.filter(i => i !== index));
        } else {
            setExpandedBlocks([...expandedBlocks, index]);
        }
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
    };

    const openExplorer = () => {
        if (data?.blockchain.contractAddress && data?.ticket.tokenId) {
            const tokenIdNum = data.ticket.tokenId.replace("#", "");
            window.open(
                `https://amoy.polygonscan.com/nft/${data.blockchain.contractAddress}/${tokenIdNum}`,
                "_blank"
            );
        }
    };

    const openTxExplorer = (txHash: string) => {
        window.open(`https://amoy.polygonscan.com/tx/${txHash}`, "_blank");
    };

    // Loading state
    if (isLoading) {
        return (
            <div className="container mx-auto px-4 pb-12 max-w-[90%]">
                <div className="flex items-center gap-2 text-sm text-text-secondary mt-6 mb-4">
                    <Link href={`/${locale}/user/homepage`} className="hover:text-button-primary-bg-default transition-colors">{t("breadcrumb_account")}</Link>
                    <ChevronRight size={14} />
                    <Link href={`/${locale}/user/tickets`} className="hover:text-button-primary-bg-default transition-colors">{t("breadcrumb_my_tickets")}</Link>
                    <ChevronRight size={14} />
                    <span className="text-text-primary">{t("page_title")}</span>
                </div>
                <div className="py-20 flex flex-col items-center justify-center bg-bg-surface border border-border-default rounded-lg">
                    <Loader2 className="w-10 h-10 text-button-primary-bg-default animate-spin mb-4" />
                    <p className="text-sm text-text-secondary font-medium">{t("loading")}</p>
                </div>
            </div>
        );
    }

    // Error state
    if (hasError || !data) {
        return (
            <div className="container mx-auto px-4 pb-12 max-w-7xl">
                {/* Breadcrumbs */}
                <div className="flex items-center gap-2 text-sm text-text-secondary mt-6 mb-4">
                    <Link href={`/${locale}/user/homepage`} className="hover:text-button-primary-bg-default transition-colors">{t("breadcrumb_account")}</Link>
                    <ChevronRight size={14} />
                    <Link href={`/${locale}/user/tickets`} className="hover:text-button-primary-bg-default transition-colors">{t("breadcrumb_my_tickets")}</Link>
                    <ChevronRight size={14} />
                    <span className="text-text-primary">{t("page_title")}</span>
                </div>

                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                    <div>
                        <h1 className="text-4xl font-bold text-text-primary mb-2">{t("page_title")}</h1>
                        <p className="text-text-secondary">{t("page_subtitle")}</p>
                    </div>
                    <Link href={`/${locale}/user/tickets`}>
                        <button className="bg-button-secondary-bg-default hover:bg-button-secondary-bg-hover text-button-secondary-text-default border border-button-secondary-border-default px-6 py-2.5 rounded-lg outline-none font-medium transition-colors text-sm active:scale-[0.98]">
                            {t("back_to_ticket")}
                        </button>
                    </Link>
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
                                onClick={() => fetchProvenance()}
                                className="bg-button-primary-bg-default hover:bg-button-primary-bg-hover text-button-primary-text-default px-6 py-2.5 rounded-lg font-medium transition-colors text-sm flex-1 max-w-[140px]"
                            >
                                {t("retry")}
                            </button>
                            <Link href={`/${locale}/user/tickets`}>
                                <button className="bg-transparent hover:bg-secondary text-button-primary-bg-default px-6 py-2.5 rounded-lg font-medium transition-colors text-sm">
                                    {t("back_to_ticket")}
                                </button>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    const truncateHash = (hash: string) => {
        if (!hash || hash.length < 12) return hash || "—";
        return `${hash.substring(0, 6)}...${hash.substring(hash.length - 4)}`;
    };

    return (
        <div className="container mx-auto px-4 pb-12 max-w-[90%]">
            {/* Breadcrumbs */}
            <div className="flex items-center gap-2 text-sm text-text-secondary mt-6 mb-4">
                <Link href={`/${locale}/user/homepage`} className="hover:text-button-primary-bg-default transition-colors">{t("breadcrumb_account")}</Link>
                <ChevronRight size={14} />
                <Link href={`/${locale}/user/tickets`} className="hover:text-button-primary-bg-default transition-colors">{t("breadcrumb_my_tickets")}</Link>
                <ChevronRight size={14} />
                <span className="text-text-primary">{t("page_title")}</span>
            </div>

            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                <div>
                    <h1 className="text-4xl font-bold text-text-primary mb-2">{t("page_title")}</h1>
                    <p className="text-text-secondary">{t("page_subtitle")}</p>
                </div>
                <Link href={`/${locale}/user/tickets`}>
                    <button className="bg-button-secondary-bg-default hover:bg-button-secondary-bg-hover text-button-secondary-text-default border border-button-secondary-border-default px-6 py-2.5 rounded-lg outline-none font-medium transition-colors text-sm active:scale-[0.98]">
                        {t("back_to_ticket")}
                    </button>
                </Link>
            </div>

            {/* Ticket Info Card */}
            <div className="bg-bg-surface border border-border-default rounded-xl p-6 mb-8">
                <h2 className="text-xl font-bold text-text-primary mb-1">{data.ticket.eventName}</h2>
                <div className="text-sm text-text-secondary mb-6">
                    <p>{data.ticket.eventTime} - {data.ticket.eventDate}</p>
                    <p>{data.ticket.venue}</p>
                </div>

                <div className="border-t border-border-default pt-4 flex flex-wrap gap-x-6 gap-y-3 text-xs md:text-sm items-center justify-between">
                    <div>
                        <span className="text-text-muted">{t("ticket_type")}: </span>
                        <span className="font-semibold text-text-primary">{data.ticket.ticketType}</span>
                    </div>
                    <div>
                        <span className="text-text-muted">{t("seat")}: </span>
                        <span className="font-semibold text-text-primary">{data.ticket.seat}</span>
                    </div>
                    <div>
                        <span className="text-text-muted">{t("ticket_code")}: </span>
                        <span className="font-semibold text-text-primary">{data.ticket.ticketCode}</span>
                    </div>
                    <div>
                        <span className="text-text-muted">{t("token_id")}: </span>
                        <span className="font-semibold text-text-primary">{data.ticket.tokenId}</span>
                    </div>
                    <div className="bg-bg-inverse text-text-inverse px-2 py-1 rounded text-xs font-semibold">
                        {data.ticket.status}
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

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-8 text-sm mb-6 max-w-full">
                            <div className="text-text-muted">{t("network")}</div>
                            <div className="font-medium text-right text-text-primary">{data.blockchain.network}</div>

                            <div className="text-text-muted">{t("token_id")}</div>
                            <div className="font-medium text-right text-text-primary">{data.ticket.tokenId}</div>

                            <div className="text-text-muted">{t("on_chain_status")}</div>
                            <div className="font-medium text-right text-text-primary">{t(data.blockchain.onChainStatus)}</div>

                            <div className="text-text-muted">{t("current_owner")}</div>
                            <div className="font-medium text-right text-text-primary">{t("your_account")}</div>

                            <div className="text-text-muted">{t("transaction")}</div>
                            <div className="font-medium text-right text-text-primary font-mono text-xs">
                                {truncateHash(data.blockchain.transactionHash)}
                            </div>

                            <div className="text-text-muted">{t("last_updated")}</div>
                            <div className="font-medium text-right text-text-primary">{data.blockchain.lastUpdated}</div>
                        </div>

                        <div className="flex flex-wrap gap-3">
                            <button
                                onClick={() => copyToClipboard(data.ticket.tokenId)}
                                className="flex items-center gap-1.5 px-3 py-1.5 border border-border-default rounded-md text-xs font-medium text-text-primary hover:bg-secondary transition-colors"
                            >
                                <Copy size={14} /> {t("copy_token_id")}
                            </button>
                            <button
                                onClick={() => copyToClipboard(data.blockchain.transactionHash)}
                                className="flex items-center gap-1.5 px-3 py-1.5 border border-border-default rounded-md text-xs font-medium text-text-primary hover:bg-secondary transition-colors"
                            >
                                <Copy size={14} /> {t("copy_tx")}
                            </button>
                            <button
                                onClick={openExplorer}
                                className="flex items-center gap-1.5 px-3 py-1.5 border border-border-default rounded-md text-xs font-medium text-text-primary hover:bg-secondary transition-colors"
                            >
                                <ExternalLink size={14} /> {t("open_explorer")}
                            </button>
                        </div>
                    </div>

                    {/* Ticket Info */}
                    <div className="bg-bg-surface border border-border-default rounded-xl p-6">
                        <h3 className="font-bold text-text-primary text-base mb-6">{t("ticket_info_card")}</h3>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-8 text-sm max-w-full">
                            <div className="text-text-muted">{t("original_price")}</div>
                            <div className="font-medium text-right text-text-primary">{data.ticket.originalPrice}</div>

                            <div className="text-text-muted">{t("ticket_state")}</div>
                            <div className="font-medium text-right text-text-primary">{data.ticket.status}</div>

                            <div className="text-text-muted">{t("mint_state")}</div>
                            <div className="font-medium text-right text-text-primary">{data.ticket.mintStatus}</div>

                            <div className="text-text-muted">{t("check_in_status")}</div>
                            <div className="font-medium text-right text-text-primary">{t(data.ticket.checkInStatus)}</div>
                        </div>
                    </div>

                    {/* Ownership History */}
                    <div className="bg-bg-surface border border-border-default rounded-xl p-6">
                        <h3 className="font-bold text-text-primary text-base mb-2">{t("ownership_history")}</h3>
                        <p className="text-xs text-text-secondary mb-8">{t("ownership_history_desc")}</p>

                        <div className="ml-2 relative">
                            {/* Vertical Line */}
                            <div className="absolute left-[4px] top-2 bottom-0 w-px bg-border-default"></div>

                            {data.history.map((item, index) => (
                                <div key={index} className={`relative pl-6 ${index === data.history.length - 1 ? "" : "pb-8"}`}>
                                    <div className="absolute w-2.5 h-2.5 bg-bg-page border-2 border-text-primary rounded-full -left-[1px] top-1"></div>

                                    {/* White mask for the last item to cover the bottom of the vertical line */}
                                    {index === data.history.length - 1 && (
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
                                                    <div className="sm:col-span-3 text-text-muted">{t("token_id")}:</div>
                                                    <div className="sm:col-span-9 font-medium">{item.details.tokenId || "—"}</div>
                                                    <div className="sm:col-span-3 text-text-muted">{t("tx_label")}:</div>
                                                    <div className="sm:col-span-9 font-medium font-mono text-[10px]">
                                                        {item.details.txHash ? (
                                                            <button
                                                                onClick={() => openTxExplorer(item.details.txHash)}
                                                                className="text-button-primary-bg-default hover:underline"
                                                            >
                                                                {truncateHash(item.details.txHash)}
                                                            </button>
                                                        ) : "—"}
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {(item.type === "OWNERSHIP_ASSIGNED" || item.type === "TRANSFERRED") && (
                                            <>
                                                <div className="text-[11px] mb-3">
                                                    <span className="text-text-muted w-20 inline-block">{t("owner")}:</span>
                                                    <span className="font-medium text-text-primary">{item.details.owner === "your_account" ? t("your_account") : (item.details.owner || t("your_account"))}</span>
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
                                                                <div className="sm:col-span-9 font-medium font-mono text-[10px]">{item.details.fromWallet || "—"}</div>
                                                                <div className="sm:col-span-3 text-text-muted">{t("to_wallet")}:</div>
                                                                <div className="sm:col-span-9 font-medium font-mono text-[10px]">{item.details.toWallet || "—"}</div>
                                                                <div className="sm:col-span-3 text-text-muted">{t("tx_hash")}:</div>
                                                                <div className="sm:col-span-9 font-medium font-mono text-[10px]">
                                                                    {item.details.txHash ? (
                                                                        <button
                                                                            onClick={() => openTxExplorer(item.details.txHash)}
                                                                            className="text-button-primary-bg-default hover:underline"
                                                                        >
                                                                            {truncateHash(item.details.txHash)}
                                                                        </button>
                                                                    ) : "—"}
                                                                </div>
                                                                <div className="sm:col-span-3 text-text-muted">{t("block_time")}:</div>
                                                                <div className="sm:col-span-9 font-medium">{item.details.blockTime || "—"}</div>
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
                                                    <div className="sm:col-span-9 font-medium">{item.details.status ? t(item.details.status) : ""}</div>
                                                </div>
                                            </div>
                                        )}

                                        {item.type !== "OWNERSHIP_ASSIGNED" && item.type !== "TRANSFERRED" && (
                                            <button onClick={() => openTxExplorer(item.details.txHash)} className="mt-2 text-xs font-medium text-text-secondary hover:text-text-primary underline underline-offset-2 w-full text-left">
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
                    <div className="bg-bg-subtle border border-border-default rounded-xl p-6">
                        <h3 className="font-bold text-text-primary text-sm mb-4">{t("verified_summary")}</h3>

                        <div className="grid grid-cols-2 gap-y-3 text-xs">
                            <div className="text-text-muted">{t("valid_ticket")}</div>
                            <div className="font-medium text-text-primary text-right">{t("yes")}</div>

                            <div className="text-text-muted">{t("token_id")}</div>
                            <div className="font-medium text-text-primary text-right">{data.ticket.tokenId}</div>

                            <div className="text-text-muted">{t("current_owner")}</div>
                            <div className="font-medium text-text-primary text-right">{t("your_account")}</div>

                            <div className="text-text-muted">{t("ticket_state")}</div>
                            <div className="font-medium text-text-primary text-right">{data.ticket.status}</div>

                            <div className="text-text-muted">{t("history")}</div>
                            <div className="font-medium text-text-primary text-right">{t("milestones", { count: data.history.length })}</div>
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
                            <Link href={`/${locale}/user/tickets`}>
                                <button className="w-full bg-button-secondary-bg-default hover:bg-button-secondary-bg-hover text-button-secondary-text-default border border-button-secondary-border-default px-4 py-2.5 rounded-lg text-sm font-medium transition-colors active:scale-[0.98]">
                                    {t("back_to_ticket")}
                                </button>
                            </Link>
                            <Link href={`/${locale}/user/tickets/${id}/resell`}>
                                <button className="w-full bg-button-primary-bg-default hover:bg-button-primary-bg-hover text-button-primary-text-default px-4 py-2.5 rounded-lg text-sm font-medium transition-colors active:scale-[0.98]">
                                    {t("resell_ticket")}
                                </button>
                            </Link>
                            <button className="w-full bg-bg-surface border border-border-default hover:bg-bg-subtle text-text-secondary px-4 py-2.5 rounded-lg text-sm font-medium transition-colors active:scale-[0.98]">
                                {t("contact_support")}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
