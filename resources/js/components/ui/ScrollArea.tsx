import React, { ReactNode } from "react";

interface ScrollAreaProps {
  children: ReactNode;
  className?: string;
  maxHeight?: string; // optional max height CSS value
}

export default function ScrollArea({ children, className = "", maxHeight = "100%" }: ScrollAreaProps) {
  return (
    <div
      className={`overflow-auto scrollbar-thin scrollbar-thumb-rounded scrollbar-thumb-gray-400 ${className}`}
      style={{ maxHeight }}
    >
      {children}
    </div>
  );
}
