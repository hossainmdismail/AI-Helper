import MarkdownRenderer from "./MarkdownRenderer";

interface MessageBubbleProps {
  type: 'user' | 'assistant' | 'error';
  content: string;
  isThinking?: boolean;
}

export default function MessageBubble({ type, content, isThinking = false }: MessageBubbleProps) {
  const isUser = type === 'user';
  const isError = type === 'error';

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`
          px-4 py-2 rounded-lg whitespace-pre-line
          ${isError ? 'bg-red-100 text-red-700 border border-red-400 w-fit' : ''}
          ${isUser && !isError ? 'bg-[#F4F4F4] text-gray-900 max-w-3/5  w-fit text-end' : ''}
          ${!isUser && !isError ? 'bg-white text-black w-11/12' : ''}
        `}
      >
        {isThinking ? <span className="animate-pulse">Thinking...</span> : <MarkdownRenderer content={content} />}
      </div>
    </div>
  );
}
