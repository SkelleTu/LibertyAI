import { useEffect, useRef } from "react";
import { Message } from "@shared/schema";
import { cn } from "@/lib/utils";
import ReactMarkdown from "react-markdown";
import { format } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";

interface MessageListProps {
  messages: Message[];
  isTyping?: boolean;
}

export function MessageList({ messages, isTyping }: MessageListProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-6 scrollbar-thin">
      <AnimatePresence initial={false}>
        {messages.map((msg) => (
          <motion.div
            key={msg.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={cn(
              "flex w-full",
              msg.role === "user" ? "justify-end" : "justify-start"
            )}
          >
            <div className={cn(
              "max-w-[85%] md:max-w-[70%] lg:max-w-[60%] flex gap-3",
              msg.role === "user" ? "flex-row-reverse" : "flex-row"
            )}>
              {/* Avatar */}
              <div className={cn(
                "w-8 h-8 rounded-sm shrink-0 flex items-center justify-center font-mono text-xs border",
                msg.role === "user" 
                  ? "bg-secondary/10 border-secondary/50 text-secondary" 
                  : "bg-primary/10 border-primary/50 text-primary shadow-[0_0_10px_rgba(0,255,255,0.2)]"
              )}>
                {msg.role === "user" ? "U" : "AI"}
              </div>

              {/* Message Bubble */}
              <div className={cn(
                "flex flex-col",
                msg.role === "user" ? "items-end" : "items-start"
              )}>
                <div className={cn(
                  "px-4 py-3 rounded-lg text-sm leading-relaxed shadow-lg backdrop-blur-sm border",
                  msg.role === "user" 
                    ? "bg-secondary/5 border-secondary/20 text-foreground rounded-tr-none" 
                    : "bg-primary/5 border-primary/20 text-foreground rounded-tl-none"
                )}>
                  <div className="prose prose-invert prose-sm max-w-none break-words">
                    <ReactMarkdown>{msg.content}</ReactMarkdown>
                  </div>
                </div>
                
                <span className="text-[10px] font-mono text-muted-foreground mt-1 opacity-50 px-1">
                  {format(new Date(msg.createdAt), "HH:mm:ss")}
                </span>
              </div>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>

      {isTyping && (
        <motion.div 
          initial={{ opacity: 0 }} 
          animate={{ opacity: 1 }}
          className="flex justify-start w-full"
        >
          <div className="max-w-[80%] flex gap-3">
            <div className="w-8 h-8 rounded-sm bg-primary/10 border border-primary/50 text-primary flex items-center justify-center font-mono text-xs">
              AI
            </div>
            <div className="bg-primary/5 border border-primary/20 px-4 py-3 rounded-lg rounded-tl-none flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce [animation-delay:-0.3s]"></span>
              <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce [animation-delay:-0.15s]"></span>
              <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce"></span>
            </div>
          </div>
        </motion.div>
      )}

      <div ref={bottomRef} className="h-1" />
    </div>
  );
}
