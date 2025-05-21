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
    const [messages, setMessages] = useState<
        { sender_type: "user" | "assistant"; content: string }[]
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

    const handleSend = async (message: string) => {
        setMessages((prev) => [...prev, { sender_type: "user", content: message }]);
        setThinking(true);

        try {
            const formData = new FormData();
            formData.append("message", message);
            if (chatId) {
                formData.append("chat_id", chatId.toString());
            }
            if (data.images) {
                data.images.forEach((img, index) => {
                    formData.append(`images[${index}]`, img);
                });
            }

            const response = await axios.post("/chatapp/send", formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });

            // ✅ Grab new chat_id from response JSON
            if (response.data?.chat_id) {
                if (!chatId) {
                    refreshDrawer();
                }
                setChatId(response.data.chat_id);
            }

            // reset the form inputs (like useForm reset)
            reset("message", "images");

            // Fake assistant reply for demo
            setTimeout(() => {
                setMessages((prev) => [
                    ...prev,
                    { sender_type: "assistant", content: response.data?.message },
                ]);
                setThinking(false);
            }, 1000);
        } catch (error) {
            console.error("Error sending message:", error);
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
            <div className="flex flex-col h-screen">
                <div className="flex-grow overflow-y-auto mt-11">
                    <ChatDrawer onSelectChat={fetchMessages} selectedChatId={chatId} refreshKey={refreshKey} />
                    <ChatWindow messages={messages} thinking={thinking} type={chatId}/>
                </div>
                <MessageInput onSend={handleSend} />
            </div>
        </AppLayout>
    );
}
