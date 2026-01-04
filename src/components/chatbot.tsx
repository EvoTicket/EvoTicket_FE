"use client";

import { useState, useEffect, useRef } from "react";
import { MessageCircle, X, Send, Paperclip, Loader2 } from "lucide-react";
import Cookies from "js-cookie";
import api from "@/src/lib/axios";
import { toast } from "react-toastify";
import Image from "next/image";

interface ChatMessage {
    id: number;
    message: string;
    images: string[];
    senderType: "USER" | "ASSISTANT";
    createdAt: string;
}

const PDF_PLACEHOLDER = "https://img.freepik.com/premium-vector/modern-flat-design-of-pdf-file-icon-for-web_599062-7115.jpg?w=2000";

export function ChatBot() {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [inputMessage, setInputMessage] = useState("");
    const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isLoadingHistory, setIsLoadingHistory] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    useEffect(() => {
        if (isOpen && messages.length === 0) {
            fetchChatHistory();
        } else if (isOpen && messages.length > 0) {
            setTimeout(scrollToBottom, 100);
        }
    }, [isOpen]);

    const fetchChatHistory = async () => {
        const token = Cookies.get("token");
        if (!token) {
            toast.error("Vui lòng đăng nhập để sử dụng chatbot");
            return;
        }

        setIsLoadingHistory(true);
        try {
            const response = await api.get("/inventory-service/api/chatbot/history", {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (response.data && response.data.status === 200) {
                const historyMessages = response.data.data.reverse();
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
        if (!inputMessage.trim() && selectedFiles.length === 0) return;

        const token = Cookies.get("token");
        if (!token) {
            toast.error("Vui lòng đăng nhập để sử dụng chatbot");
            return;
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
        const filesToSend = [...selectedFiles];
        setInputMessage("");
        setSelectedFiles([]);

        setIsLoading(true);

        try {
            const formData = new FormData();
            filesToSend.forEach((file) => {
                formData.append("files", file);
            });

            const response = await api.post(
                `/inventory-service/api/chatbot/ask?question=${encodeURIComponent(messageToSend)}`,
                formData,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "multipart/form-data",
                    },
                }
            );

            if (response.data && response.data.status === 200) {
                const assistantMessage: ChatMessage = {
                    id: Date.now() + 1,
                    message: response.data.data.answer,
                    images: [],
                    senderType: "ASSISTANT",
                    createdAt: new Date().toISOString(),
                };

                setMessages((prev) => [...prev, assistantMessage]);
            }
        } catch (error: any) {
            if (error.response?.status === 500) {
                toast.error("Đã có lỗi xảy ra");
            } else {
                toast.error("Không thể gửi tin nhắn");
            }
            console.error("Failed to send message", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            setSelectedFiles(Array.from(e.target.files));
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

    return (
        <>
            {/* Floating Button */}
            <div className="fixed bottom-6 right-6 z-50 group">
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="bg-primary hover:bg-primary-hover text-white rounded-full p-4 shadow-lg transition-all duration-300 hover:scale-110"
                    aria-label="Chat Bot"
                >
                    {isOpen ? <X size={24} /> : <MessageCircle size={24} />}
                </button>

                <div className="absolute bottom-full right-0 mb-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
                    <div className="bg-gray-800 text-white text-sm px-3 py-1 rounded whitespace-nowrap">
                        Sử dụng chat bot
                    </div>
                </div>
            </div>

            {/* Chat Window */}
            {isOpen && (
                <div className="fixed bottom-24 right-6 z-50 w-[450px] h-[600px] bg-main border border-border rounded-lg shadow-2xl flex flex-col">
                    {/* Header */}
                    <div className="bg-primary text-white p-4 rounded-t-lg flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <MessageCircle size={20} />
                            <h3 className="font-semibold">Chat Bot Hỗ Trợ</h3>
                        </div>
                        <button
                            onClick={() => setIsOpen(false)}
                            className="hover:bg-white/20 rounded p-1 transition-colors"
                        >
                            <X size={20} />
                        </button>
                    </div>

                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-surface">
                        {isLoadingHistory ? (
                            <div className="flex items-center justify-center h-full">
                                <Loader2 className="animate-spin text-primary" size={32} />
                            </div>
                        ) : messages.length === 0 ? (
                            <div className="flex items-center justify-center h-full text-txt-muted">
                                <p>Chưa có tin nhắn nào. Hãy bắt đầu trò chuyện!</p>
                            </div>
                        ) : (
                            messages.map((msg) => (
                                <div
                                    key={msg.id}
                                    className={`flex ${msg.senderType === "USER" ? "justify-end" : "justify-start"}`}
                                >
                                    <div
                                        className={`max-w-[75%] rounded-lg p-3 ${msg.senderType === "USER"
                                            ? "bg-primary text-white"
                                            : "bg-secondary text-txt-primary"
                                            }`}
                                    >
                                        <p className="text-sm whitespace-pre-wrap break-words">{msg.message}</p>
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
                                                                        <span className="text-xs bg-white/90 px-2 py-1 rounded">Click để xem PDF</span>
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
                                <div className="max-w-[75%] rounded-lg p-3 bg-secondary text-txt-primary">
                                    <div className="flex items-center gap-2">
                                        <Loader2 className="animate-spin" size={16} />
                                        <span className="text-sm">Đang trả lời...</span>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input */}
                    <div className="p-4 border-t border-border bg-main">
                        {selectedFiles.length > 0 && (
                            <div className="mb-2 flex flex-wrap gap-2">
                                {selectedFiles.map((file, idx) => (
                                    <div
                                        key={idx}
                                        className="bg-secondary text-txt-primary text-xs px-2 py-1 rounded flex items-center gap-1"
                                    >
                                        <Paperclip size={12} />
                                        <span className="max-w-[100px] truncate">{file.name}</span>
                                        <button
                                            onClick={() =>
                                                setSelectedFiles((prev) => prev.filter((_, i) => i !== idx))
                                            }
                                            className="hover:text-error"
                                        >
                                            <X size={12} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                        <div className="flex gap-2">
                            <input
                                type="file"
                                ref={fileInputRef}
                                onChange={handleFileSelect}
                                multiple
                                className="hidden"
                            />
                            <button
                                onClick={() => fileInputRef.current?.click()}
                                className="p-2 hover:bg-secondary rounded-lg transition-colors text-txt-secondary"
                                disabled={isLoading}
                            >
                                <Paperclip size={20} />
                            </button>
                            <input
                                type="text"
                                value={inputMessage}
                                onChange={(e) => setInputMessage(e.target.value)}
                                onKeyPress={handleKeyPress}
                                placeholder="Nhập tin nhắn..."
                                className="flex-1 px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-surface text-txt-primary"
                                disabled={isLoading}
                            />
                            <button
                                onClick={handleSendMessage}
                                disabled={!inputMessage.trim() && selectedFiles.length === 0}
                                className="bg-primary hover:bg-primary-hover text-white px-4 py-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
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
