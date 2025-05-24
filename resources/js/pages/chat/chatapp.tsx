import React, { useState } from "react";
import { Head } from "@inertiajs/react";
import AppLayout from "@/layouts/app-layout";
import ChatWindow from "@/components/chat/ChatWindow";
import ChatDrawer from "@/components/chat/ChatDrawer";
import MessageInput from "@/components/chat/MessageInput";
import { useForm } from "@inertiajs/react";
import { type BreadcrumbItem } from "@/types";
import axios from "@/lib/axios";

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: "Chat App",
        href: "/chatapp",
    },
];

export default function ChatApp() {
    // State to manage messages , chat ID , thinking status and error
    const [messages, setMessages] = useState<
        { sender_type: "user" | "assistant" | "error"; content: string; streaming?: boolean; }[]
    >([]);
    const [thinking, setThinking] = useState(false);

    const [refreshKey, setRefreshKey] = useState(0);

    const [chatId, setChatId] = useState<number | null>(null);

    const { data, setData, post, processing, reset } = useForm<{
        message: string;
        chat_id?: number;
        images: File[] | null;
    }>({
        message: "",
        chat_id: chatId ?? undefined,
        images: null,
    });

    const handleSend = async (message: string, images: File[] | null) => {

        // Add user message immediately
        setMessages((prev) => [...prev, { sender_type: "user", content: message }]);
        setThinking(true);
        const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute("content") || "";

        try {
            const formData = new FormData();
            formData.append("message", message);

            if (chatId) {
                formData.append("chat_id", chatId.toString());
            }

            if (images) {
                images.forEach((image) => {
                    formData.append("images[]", image); // ✅ important!
                });
            }
            const response = await fetch("/chatapp/stream", {
                method: "POST",
                headers: {
                    "X-CSRF-TOKEN": csrfToken,
                    // Do NOT set Content-Type for FormData
                },
                body: formData,
            });

            if (!response.ok || !response.body) {
                throw new Error("Failed to connect to stream");
            }

            const reader = response.body.getReader();
            const decoder = new TextDecoder("utf-8");
            let assistantMsg = "";

            // Add a streaming assistant message placeholder
            setMessages((prev) => [
                ...prev,
                { sender_type: "assistant", content: "", streaming: true },
            ]);

            while (true) {
                const { value, done } = await reader.read();
                if (done) break;

                const chunk = decoder.decode(value, { stream: true });
                assistantMsg += chunk;

                // Update the streaming message content without duplicating
                setMessages((prev) => {
                    const others = prev.filter((m) => !m.streaming);
                    return [...others, { sender_type: "assistant", content: assistantMsg, streaming: true }];
                });
            }

            // Replace the streaming message with the final one (no streaming flag)
            setMessages((prev) => {
                const others = prev.filter((m) => !m.streaming);
                return [...others, { sender_type: "assistant", content: assistantMsg }];
            });

            reset("message", "images");
            setThinking(false);

            if (!chatId) refreshDrawer();

        } catch (err) {
            console.error("Stream error:", err);
            setMessages(prev => [
                ...prev,
                { sender_type: "error", content: err.message },
            ]);

            setThinking(false);

        }
    };


    const fetchMessages = (id: number) => {
        axios.get(`/chatapp/messages/${id}`).then((res) => {
            setMessages(res.data.messages);

            setChatId(id);
        });
    };
    const refreshDrawer = () => setRefreshKey((prev) => prev + 1);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="AI Chat" />
            <div className="w-full">
                <ChatDrawer onSelectChat={fetchMessages} selectedChatId={chatId} refreshKey={refreshKey} />
                <div className="flex flex-col h-screen w-full md:w-full lg:w-4/5 m-auto">
                    <div className="flex-grow overflow-y-auto mt-16">
                        <ChatWindow messages={messages} thinking={thinking} type={chatId} />
                    </div>
                    <MessageInput onSend={handleSend} />
                </div>
            </div>
        </AppLayout>
    );
}
