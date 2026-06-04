"use client";

import { useState, useEffect, useRef } from "react";
import { MessageCircle, X, Send, Loader2, Menu, Plus, Trash2 } from "lucide-react";
import api from "@/src/lib/axios";
import { toast } from "react-toastify";
import Image from "next/image";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import { useTranslations } from "next-intl";
import { usePathname } from "next/navigation";
import { store } from "@/src/store";

interface ChatMessage {
    id: number;
    message: string;
    images: string[];
    senderType: "USER" | "ASSISTANT";
    createdAt: string;
}

interface ChatConversation {
    id: string;
    userId: number;
    title: string;
    createdAt: string;
    updatedAt: string;
}

const PDF_PLACEHOLDER = "https://img.freepik.com/premium-vector/modern-flat-design-of-pdf-file-icon-for-web_599062-7115.jpg?w=2000";

export function ChatBot() {
    const pathname = usePathname();
    const t = useTranslations("Chatbot");
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [inputMessage, setInputMessage] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [isLoadingHistory, setIsLoadingHistory] = useState(false);
    const [conversations, setConversations] = useState<ChatConversation[]>([]);
    const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isLoadingConversations, setIsLoadingConversations] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const targetTextRef = useRef("");
    const currentTextRef = useRef("");
    const streamFinishedRef = useRef(false);
    const typingTimerRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        return () => {
            if (typingTimerRef.current) clearInterval(typingTimerRef.current);
        };
    }, []);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    useEffect(() => {
        if (isOpen) {
            fetchConversations();
        }
    }, [isOpen]);

    useEffect(() => {
        if (isOpen && currentConversationId) {
            fetchChatHistory(currentConversationId);
        }
    }, [currentConversationId, isOpen]);

    const fetchConversations = async () => {
        setIsLoadingConversations(true);
        try {
            const response = await api.get("/inventory-service/api/chatbot/conversations");
            if (response.data && response.data.status === 200) {
                const list = response.data.data;
                setConversations(list);
                
                // If there's list, select the first one if we don't have a current one
                if (list.length > 0) {
                    if (!currentConversationId) {
                        setCurrentConversationId(list[0].id);
                    }
                } else {
                    // Create one if list is empty
                    await handleCreateConversation();
                }
            }
        } catch (error) {
            console.error("Failed to fetch conversations", error);
        } finally {
            setIsLoadingConversations(false);
        }
    };

    const handleCreateConversation = async () => {
        try {
            const response = await api.post("/inventory-service/api/chatbot/conversations");
            if (response.data && response.data.status === 200) {
                const newConv = response.data.data;
                setConversations(prev => [newConv, ...prev]);
                setCurrentConversationId(newConv.id);
                setMessages([]); // clear message window for the new chat
                return newConv.id;
            }
        } catch (error) {
            console.error("Failed to create conversation", error);
            toast.error("Failed to create new conversation");
        }
        return null;
    };

    const handleDeleteConversation = async (e: React.MouseEvent, id: string) => {
        e.stopPropagation(); // prevent selecting the conversation
        if (!confirm("Bạn có chắc chắn muốn xóa cuộc trò chuyện này?")) return;
        
        try {
            const response = await api.delete(`/inventory-service/api/chatbot/conversations/${id}`);
            if (response.data && response.data.status === 200) {
                setConversations(prev => prev.filter(c => c.id !== id));
                if (currentConversationId === id) {
                    // If deleted active conversation, switch to another one
                    const remaining = conversations.filter(c => c.id !== id);
                    if (remaining.length > 1) { // note: conversations state might be stale so we use remaining filter
                        const nextConv = remaining.find(c => c.id !== id);
                        if (nextConv) {
                            setCurrentConversationId(nextConv.id);
                        }
                    } else {
                        // Or create a new one
                        await handleCreateConversation();
                    }
                }
                toast.success("Đã xóa cuộc trò chuyện");
            }
        } catch (error) {
            console.error("Failed to delete conversation", error);
            toast.error("Không thể xóa cuộc trò chuyện");
        }
    };

    const handleSelectConversation = (id: string) => {
        setCurrentConversationId(id);
        setIsSidebarOpen(false);
    };

    const fetchChatHistory = async (convId: string) => {
        if (!convId) return;
        setIsLoadingHistory(true);
        try {
            const response = await api.get("/inventory-service/api/chatbot/history", {
                params: { conversationId: convId }
            });

            if (response.data && response.data.status === 200) {
                const historyMessages = response.data.data.map((msg: any, index: number) => ({
                    id: index,
                    message: msg.text ? msg.text.replace(/\n\n\[Thông tin phiên: .*\]/g, "") : "",
                    images: msg.media || [],
                    senderType: msg.messageType === "USER" ? "USER" : "ASSISTANT",
                    createdAt: new Date().toISOString()
                }));

                setMessages(historyMessages);
                setTimeout(scrollToBottom, 100);
            }
        } catch (error) {
            console.error("Failed to fetch chat history", error);
        } finally {
            setIsLoadingHistory(false);
        }
    };

    const handleSendMessage = async () => {
        if (!inputMessage.trim()) return;

        let activeConvId = currentConversationId;
        if (!activeConvId) {
            activeConvId = await handleCreateConversation();
            if (!activeConvId) return;
        }

        const userMessage: ChatMessage = {
            id: Date.now(),
            message: inputMessage,
            images: [],
            senderType: "USER",
            createdAt: new Date().toISOString(),
        };

        setMessages((prev) => [...prev, userMessage]);

        const messageToSend = inputMessage;
        setInputMessage("");

        setIsLoading(true);
        let accumulatedMessage = "";

        targetTextRef.current = "";
        currentTextRef.current = "";
        streamFinishedRef.current = false;
        if (typingTimerRef.current) {
            clearInterval(typingTimerRef.current);
            typingTimerRef.current = null;
        }

        try {
            const token = store.getState().auth.token;
            const url = `${process.env.NEXT_PUBLIC_API_GATEWAY_BE || ""}/inventory-service/api/chatbot/stream-ask?question=${encodeURIComponent(messageToSend)}&conversationId=${activeConvId}`;

            const response = await fetch(url, {
                method: "GET",
                headers: {
                    "Authorization": token ? `Bearer ${token}` : "",
                },
            });

            if (!response.ok) {
                throw new Error("Failed to start chat stream");
            }

            const reader = response.body?.getReader();
            const decoder = new TextDecoder("utf-8");

            if (!reader) {
                throw new Error("Response body is not readable");
            }

            const assistantMessageId = Date.now();
            const assistantMessage: ChatMessage = {
                id: assistantMessageId,
                message: "",
                images: [],
                senderType: "ASSISTANT",
                createdAt: new Date().toISOString(),
            };
            setMessages((prev) => [...prev, assistantMessage]);

            // Start typing timer
            typingTimerRef.current = setInterval(() => {
                const target = targetTextRef.current;
                let current = currentTextRef.current;
                if (current.length < target.length) {
                    const diff = target.length - current.length;
                    const step = diff > 30 ? Math.ceil(diff / 5) : 1;
                    const nextText = current + target.substring(current.length, current.length + step);
                    currentTextRef.current = nextText;
                    setMessages((prev) =>
                        prev.map((msg) =>
                            msg.id === assistantMessageId
                                ? { ...msg, message: nextText }
                                : msg
                        )
                    );
                } else if (streamFinishedRef.current) {
                    if (typingTimerRef.current) {
                        clearInterval(typingTimerRef.current);
                        typingTimerRef.current = null;
                    }
                }
            }, 15);

            let buffer = "";

            while (true) {
                const { value, done } = await reader.read();
                if (done) break;

                buffer += decoder.decode(value, { stream: true });
                let boundary = buffer.indexOf("\n\n");
                while (boundary !== -1) {
                    const message = buffer.slice(0, boundary);
                    buffer = buffer.slice(boundary + 2);

                    const lines = message.split("\n");
                    const dataLines: string[] = [];
                    for (const line of lines) {
                        if (line.startsWith("data:")) {
                            let dataVal = line.slice(5);
                            if (dataVal.startsWith(" ")) {
                                dataVal = dataVal.slice(1);
                            }
                            dataLines.push(dataVal);
                        }
                    }
                    if (dataLines.length > 0) {
                        accumulatedMessage += dataLines.join("\n");
                    }

                    boundary = buffer.indexOf("\n\n");
                }

                const cleanAnswer = accumulatedMessage ? accumulatedMessage.replace(/\n\n\[Thông tin phiên: .*\]/g, "") : "";
                targetTextRef.current = cleanAnswer;
            }
        } catch (error: any) {
            if (!accumulatedMessage) {
                toast.error(t("error_send_failed"));
                console.error("Failed to send message", error);
            } else {
                console.log("Chat stream connection ended:", error.message || error);
            }
        } finally {
            setIsLoading(false);
            streamFinishedRef.current = true;
            fetchConversations();
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    const isImageFile = (url: string) => {
        return /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(url);
    };

    if (!pathname || !pathname.match(/^\/[^/]+\/user(\/|$)/)) {
        return null;
    }

    return (
        <>
            {/* Floating Button */}
            <div className="fixed bottom-6 right-6 z-50 group">
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="bg-button-primary-bg-default hover:bg-button-primary-bg-hover text-button-primary-text-default rounded-full p-4 shadow-lg transition-all duration-300 hover:scale-110"
                    aria-label={t("btn_aria")}
                >
                    {isOpen ? <X size={24} /> : <MessageCircle size={24} />}
                </button>

                <div className="absolute bottom-full right-0 mb-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
                    <div className="bg-gray-800 text-white text-sm px-3 py-1 rounded whitespace-nowrap">
                        {t("btn_tooltip")}
                    </div>
                </div>
            </div>

            {/* Chat Window */}
            {isOpen && (
                <div className="fixed bottom-24 right-6 z-50 w-[calc(100vw-48px)] sm:w-[450px] h-[600px] max-h-[calc(100vh-120px)] bg-bg-page border border-border-default rounded-ds-lg shadow-2xl flex flex-col overflow-hidden">
                    {/* Sidebar Drawer */}
                    {isSidebarOpen && (
                        <div 
                            className="absolute inset-0 bg-black/40 z-30 transition-opacity duration-300 animate-fade-in"
                            onClick={() => setIsSidebarOpen(false)}
                        />
                    )}
                    <div className={`absolute top-0 left-0 h-full w-[280px] bg-bg-surface border-r border-border-default z-40 flex flex-col transition-transform duration-300 ease-in-out ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}`}>
                        {/* Sidebar Header */}
                        <div className="p-4 border-b border-border-default flex items-center justify-between bg-bg-page">
                            <h4 className="font-bold text-text-primary text-sm flex items-center gap-2">
                                <MessageCircle size={16} />
                                {t("conversations_title") || "Hội thoại gần đây"}
                            </h4>
                            <button 
                                onClick={() => setIsSidebarOpen(false)}
                                className="text-text-secondary hover:text-text-primary rounded p-1 transition-colors"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        {/* New Chat Button */}
                        <div className="p-3">
                            <button
                                onClick={() => {
                                    handleCreateConversation();
                                    setIsSidebarOpen(false);
                                }}
                                className="w-full flex items-center justify-center gap-2 bg-button-primary-bg-default hover:bg-button-primary-bg-hover text-button-primary-text-default text-xs font-bold py-2 px-3 rounded-ds-lg transition-colors cursor-pointer"
                            >
                                <Plus size={14} />
                                {t("new_chat_btn") || "Cuộc trò chuyện mới"}
                            </button>
                        </div>

                        {/* Conversations List */}
                        <div className="flex-1 overflow-y-auto px-3 pb-3 space-y-1">
                            {isLoadingConversations ? (
                                <div className="flex items-center justify-center py-8">
                                    <Loader2 className="animate-spin text-primary" size={24} />
                                </div>
                            ) : conversations.length === 0 ? (
                                <div className="text-center text-xs text-text-muted py-8">
                                    {t("no_conversations") || "Chưa có cuộc trò chuyện nào"}
                                </div>
                            ) : (
                                conversations.map((conv) => (
                                    <div
                                        key={conv.id}
                                        onClick={() => handleSelectConversation(conv.id)}
                                        className={`group flex items-center justify-between p-2.5 rounded-ds-lg cursor-pointer text-xs transition-colors ${
                                            currentConversationId === conv.id
                                                ? "bg-primary/10 text-primary font-semibold border border-primary/20"
                                                : "hover:bg-secondary text-text-secondary hover:text-text-primary border border-transparent"
                                        }`}
                                    >
                                        <span className="truncate flex-1 pr-2">{conv.title}</span>
                                        <button
                                            onClick={(e) => handleDeleteConversation(e, conv.id)}
                                            className="opacity-0 group-hover:opacity-100 text-text-muted hover:text-error p-1 rounded hover:bg-bg-page transition-all shrink-0 cursor-pointer"
                                            title={t("delete_chat") || "Xóa cuộc trò chuyện"}
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    {/* Header */}
                    <div className="bg-button-primary-bg-default text-button-primary-text-default p-4 rounded-t-lg flex items-center justify-between z-20">
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setIsSidebarOpen(true)}
                                className="hover:bg-white/20 rounded p-1 transition-colors -ml-1 cursor-pointer"
                                title={t("history_tooltip") || "Lịch sử cuộc trò chuyện"}
                            >
                                <Menu size={20} />
                            </button>
                            <h3 className="font-semibold truncate max-w-[200px] sm:max-w-[250px]">
                                {conversations.find(c => c.id === currentConversationId)?.title || t("header_title")}
                            </h3>
                        </div>
                        <div className="flex items-center gap-1">
                            <button
                                onClick={handleCreateConversation}
                                className="hover:bg-white/20 rounded p-1 transition-colors cursor-pointer"
                                title={t("new_chat_btn") || "Cuộc trò chuyện mới"}
                            >
                                <Plus size={20} />
                            </button>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="hover:bg-white/20 rounded p-1 transition-colors cursor-pointer"
                            >
                                <X size={20} />
                            </button>
                        </div>
                    </div>

                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-bg-surface">
                        {isLoadingHistory ? (
                            <div className="flex items-center justify-center h-full">
                                <Loader2 className="animate-spin text-primary" size={32} />
                            </div>
                        ) : messages.length === 0 ? (
                            <div className="flex items-center justify-center h-full text-text-muted">
                                <p>{t("empty_state")}</p>
                            </div>
                        ) : (
                            messages.map((msg) => (
                                <div
                                    key={msg.id}
                                    className={`flex ${msg.senderType === "USER" ? "justify-end" : "justify-start"}`}
                                >
                                    <div
                                        className={`max-w-[75%] rounded-ds-lg p-3 ${msg.senderType === "USER"
                                            ? "bg-button-primary-bg-default text-button-primary-text-default"
                                            : "bg-secondary text-text-primary"
                                            }`}
                                    >
                                        <div className={`text-sm prose prose-sm max-w-none ${msg.senderType === "USER"
                                            ? "prose-invert"
                                            : "dark:prose-invert text-text-primary"
                                            }`}>
                                            <ReactMarkdown
                                                remarkPlugins={[remarkGfm]}
                                                rehypePlugins={[rehypeRaw]}
                                                components={{
                                                    // Custom styling for markdown elements
                                                    p: ({ children }) => <p className="mb-2 last:mb-0 whitespace-pre-wrap break-words">{children}</p>,
                                                    h1: ({ children }) => <h1 className="text-lg font-bold mb-2">{children}</h1>,
                                                    h2: ({ children }) => <h2 className="text-base font-bold mb-2">{children}</h2>,
                                                    h3: ({ children }) => <h3 className="text-sm font-bold mb-1">{children}</h3>,
                                                    ul: ({ children }) => <ul className="list-disc list-inside mb-2 space-y-1">{children}</ul>,
                                                    ol: ({ children }) => <ol className="list-decimal list-inside mb-2 space-y-1">{children}</ol>,
                                                    li: ({ children }) => <li className="ml-2">{children}</li>,
                                                    code: ({ inline, children, ...props }: any) =>
                                                        inline ? (
                                                            <code
                                                                className={`px-1.5 py-0.5 rounded text-xs font-mono ${msg.senderType === "USER"
                                                                    ? "bg-white/20"
                                                                    : "bg-gray-200 text-gray-800 dark:bg-bg-surface dark:text-text-primary"
                                                                    }`}
                                                                {...props}
                                                            >
                                                                {children}
                                                            </code>
                                                        ) : (
                                                            <code
                                                                className={`block px-3 py-2 rounded text-xs font-mono overflow-x-auto my-2 ${msg.senderType === "USER"
                                                                    ? "bg-white/20"
                                                                    : "bg-gray-200 text-gray-800 dark:bg-bg-surface dark:text-text-primary"
                                                                    }`}
                                                                {...props}
                                                            >
                                                                {children}
                                                            </code>
                                                        ),
                                                    pre: ({ children }) => <pre className="overflow-x-auto">{children}</pre>,
                                                    a: ({ href, children }) => (
                                                        <a
                                                            href={href}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className={`underline hover:no-underline ${msg.senderType === "USER"
                                                                ? "text-white font-semibold"
                                                                : "text-primary font-semibold"
                                                                }`}
                                                        >
                                                            {children}
                                                        </a>
                                                    ),
                                                    strong: ({ children }) => <strong className="font-bold">{children}</strong>,
                                                    em: ({ children }) => <em className="italic">{children}</em>,
                                                    blockquote: ({ children }) => (
                                                        <blockquote className={`border-l-4 pl-3 my-2 ${msg.senderType === "USER"
                                                            ? "border-white/50"
                                                            : "border-gray-400 dark:border-border-default"
                                                            }`}>
                                                            {children}
                                                        </blockquote>
                                                    ),
                                                    hr: () => <hr className={`my-2 ${msg.senderType === "USER" ? "border-white/30" : "border-gray-300 dark:border-border-default"}`} />,
                                                }}
                                            >
                                                {msg.message}
                                            </ReactMarkdown>
                                        </div>
                                        {msg.images && msg.images.length > 0 && (
                                            <div className="mt-2 space-y-2">
                                                {msg.images.map((img, idx) => {
                                                    const isPdf = !isImageFile(img);

                                                    return (
                                                        <a
                                                            key={idx}
                                                            href={img}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="block cursor-pointer hover:opacity-80 transition-opacity"
                                                        >
                                                            <div className="relative w-full">
                                                                <img
                                                                    src={isPdf ? PDF_PLACEHOLDER : img}
                                                                    alt="Attachment"
                                                                    className="w-full h-auto rounded object-contain max-h-[300px]"
                                                                />
                                                                {isPdf && (
                                                                    <div className="absolute inset-0 flex items-center justify-center bg-black/10 rounded">
                                                                        <span className="text-xs bg-white/90 px-2 py-1 rounded">{t("click_view_pdf")}</span>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </a>
                                                    );
                                                })}
                                            </div>
                                        )}
                                        <p className="text-xs opacity-70 mt-1">
                                            {new Date(msg.createdAt).toLocaleTimeString("vi-VN", {
                                                hour: "2-digit",
                                                minute: "2-digit",
                                            })}
                                        </p>
                                    </div>
                                </div>
                            ))
                        )}

                        {isLoading && (
                            <div className="flex justify-start">
                                <div className="max-w-[75%] rounded-ds-lg p-3 bg-secondary text-text-primary">
                                    <div className="flex items-center gap-2">
                                        <Loader2 className="animate-spin" size={16} />
                                        <span className="text-sm">{t("status_responding")}</span>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input */}
                    <div className="p-4 border-t border-border-default bg-bg-page">
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={inputMessage}
                                onChange={(e) => setInputMessage(e.target.value)}
                                onKeyPress={handleKeyPress}
                                placeholder={t("input_placeholder")}
                                className="flex-1 px-3 py-2 border border-border-default rounded-ds-lg focus:outline-none focus:ring-2 focus:ring-primary bg-bg-surface text-text-primary"
                                disabled={isLoading}
                            />
                            <button
                                onClick={handleSendMessage}
                                disabled={!inputMessage.trim()}
                                className="bg-button-primary-bg-default hover:bg-button-primary-bg-hover text-button-primary-text-default px-4 py-2 rounded-ds-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                            >
                                <Send size={20} />
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
