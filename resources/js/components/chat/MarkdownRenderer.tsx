// components/MarkdownRenderer.tsx
import React from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeHighlight from 'rehype-highlight'
import 'highlight.js/styles/default.css'

export default function MarkdownRenderer({ content }: { content: string }) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      rehypePlugins={[rehypeHighlight]}
      components={{
        // Prevent <pre> inside <p> issue
        p({ node, children }) {
          // Check if the only child is a <pre> element (usually code blocks)
          const isOnlyPre =
            React.isValidElement(children[0]) &&
            (children[0].type as any) === 'pre';

          if (isOnlyPre) {
            return <>{children}</>; // Avoid wrapping <pre> in <p>
          }

          return <p>{children}</p>;
        },

        // Handle code blocks + inline code
        code({ className, children, ...props }) {
          const isBlock = className?.includes('language-');

          if (isBlock) {
            return (
              <pre className="bg-gray-100 text-gray-800 rounded-xl p-2 overflow-x-auto my-4 relative">
                <code className={className} {...props}>
                  {children}
                </code>
                <button
                  onClick={() =>
                    navigator.clipboard.writeText(children as string)
                  }
                  className="absolute top-2 right-2 bg-white text-black text-xs px-2 py-1 rounded hover:bg-gray-200"
                >
                  Copy
                </button>
              </pre>
            );
          }

          // Inline code (within text)
          return (
            <code className="bg-gray-200 px-1 rounded text-sm" {...props}>
              {children}
            </code>
          );
        },
      }}
    >
      {content}
    </ReactMarkdown>
  );
}
