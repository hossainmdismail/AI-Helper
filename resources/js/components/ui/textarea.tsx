import * as React from "react";
import { cn } from "@/lib/utils";

type TextareaProps = React.ComponentProps<"textarea"> & {
  maxHeight?: number;
};

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, maxHeight = 120, onInput, ...props }, ref) => {
    const innerRef = React.useRef<HTMLTextAreaElement>(null);
    const textareaRef = (ref || innerRef) as React.RefObject<HTMLTextAreaElement>;

    const handleInput = React.useCallback(
      (e?: React.FormEvent<HTMLTextAreaElement>) => {
        const textarea = textareaRef.current;
        if (!textarea) return;

        textarea.style.height = "auto";
        textarea.style.height = Math.min(textarea.scrollHeight, maxHeight) + "px";

        // Call parent onInput if needed
        if (onInput) onInput(e as any);
      },
      [maxHeight, onInput]
    );

    React.useEffect(() => {
      handleInput();
    }, [handleInput]);

    return (
      <textarea
        {...props}
        ref={textareaRef}
        rows={1}
        onInput={handleInput}
        placeholder="Ask anything..."
        className={cn(
          "placeholder:text-muted-foreground py-1 selection:bg-primary selection:text-primary-foreground flex w-full min-w-0 bg-transparent text-base  outline-none resize-none overflow-y-auto scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-200 md:text-sm",
          className
        )}
        style={{ maxHeight: maxHeight + "px" }}
      />
    );
  }
);

Textarea.displayName = "Textarea";

export { Textarea };
