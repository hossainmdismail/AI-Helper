import { Sheet, SheetTrigger, SheetContent, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import ScrollArea from "@/components/ui/ScrollArea";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { History } from "lucide-react";
import axios from "@/lib/axios";

interface ChatSummary {
    id: number;
    title: string;
    created_at: string;
}

export default function ChatDrawer({ onSelectChat, refreshKey, selectedChatId }: { onSelectChat: (chatId: number) => void, refreshKey: number, selectedChatId: number|null; }) {
    const [chats, setChats] = useState<ChatSummary[]>([]);


    useEffect(() => {
        axios.get("/chatapp/history").then((res) => setChats(res.data));

    }, [refreshKey]);

    return (
        <Sheet>
            <SheetTrigger className="opacity-30 hover:opacity-100 transition-all" asChild>
                <button className="absolute top-16 p-2 border border-gray-300 z-50 cursor-pointer"><History className="text-gray-500 size-5"></History></button>
            </SheetTrigger>
            <SheetContent side="right" className="w-full h-full px-6 py-8">
                <SheetTitle>Chat History</SheetTitle>
                <SheetDescription>Select a conversation to continue</SheetDescription>
                <ScrollArea className="h-full flex flex-col gap-1 custom-scroll">
                    {chats.map((chat) => (
                        //   <Button
                        //   key={chat.id}
                        //   variant="ghost"
                        //   className="w-full justify-start text-left"
                        //   onClick={() => onSelectChat(chat.id)}
                        // >
                        //   🗨️ {chat.title || "Untitled"}
                        // </Button>
                        //   <button className="cursor-pointer inline-block" onClick={() => onSelectChat(chat.id)}>{chat.title || "Untitled"}</button>
                        <button
                            onClick={() => onSelectChat(chat.id)}
                            className={`
                                        w-full text-left px-4 py-2 rounded-md transition-colors duration-200
                                        hover:bg-[#ECECEC] hover:text-gray-900
                                        text-sm text-gray-900
                                        ${chat.id === selectedChatId ? 'bg-[#ECECEC] text-black' : ''}
                                    `}
                        >
                            <span>
                            {chat.title || "Untitled"}
                            </span>
                        </button>

                    ))}
                </ScrollArea>
            </SheetContent>
        </Sheet>
    );
}
