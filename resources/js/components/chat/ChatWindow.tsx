import { useEffect, useRef } from "react";
import MessageBubble from "@/components/chat/MessageBubble";

interface Message {
    sender_type: "user" | "assistant";
    content: string;
}

interface ChatWindowProps {
    messages: Message[];
    thinking: boolean;
    type: number | null;
}

export default function ChatWindow({ messages, thinking, type }: ChatWindowProps) {
    const bottomRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, thinking]);

    return (
        <div className="p-2 space-y-4 overflow-y-auto max-h-full custom-scroll">
            {messages.map((msg, idx) => (
                <MessageBubble key={idx} type={msg.sender_type} content={msg.content} />
            ))}

            {thinking && (
                <MessageBubble type="assistant" content="..." isThinking />
            )}
            {/* {!type ? <div className="w-full pt-40 pb-40"><h1 className="text-center font-extrabold">What can I help with?</h1></div> : ''} */}


            {/* Invisible div for scroll anchor */}
            <div ref={bottomRef} />
        </div>
    );
}
