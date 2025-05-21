import MarkdownRenderer from "./MarkdownRenderer";

interface MessageBubbleProps {
  type: 'user' | 'assistant';
  content: string;
  isThinking?: boolean;
}

export default function MessageBubble({ type, content, isThinking = false }: MessageBubbleProps) {
  const isUser = type === 'user';
  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div className={` px-4 py-2 rounded-lg ${isUser ? 'bg-[#F4F4F4] text-gray-900 w-fit text-end' : 'bg-white text-black w-11/12'} whitespace-pre-line`}>
        {isThinking ? <span className="animate-pulse">Thinking...</span> : <MarkdownRenderer content={content} />}
      </div>
    </div>
  );
}
