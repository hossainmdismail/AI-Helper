// components/ChatMessages.tsx
import React from "react";

type Message = {
    role: "user" | "assistant";
    content: string;
};

interface ChatMessagesProps {
    messages: Message[];
}

export const ChatMessages: React.FC<ChatMessagesProps> = ({ messages }) => {
    return (
        <div className="mt-16 px-6 mb-[8.5rem] overflow-y-scroll max-h-[calc(100vh-200px)]">
            {messages.map((msg, index) => (
                <div
                    key={index}
                    className={`chat ${msg.role === "user" ? "user flex justify-end" : "ai flex items-start"} mb-4`}
                >
                    <div
                        className={`px-4 py-2 rounded-lg ${msg.role === "user" ? "bg-gray-200 max-w-[80%]" : "bg-blue-100"
                            }`}
                    >
                        <p>{msg.content}</p>
                    </div>
                </div>
            ))}
            <span className="w-full h-32 block"></span>
        </div>
    );
};
