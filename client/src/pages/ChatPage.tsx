import { useState, useEffect } from "react";
import { useRoute } from "wouter";
import { Sidebar } from "@/components/Sidebar";
import { MessageList } from "@/components/MessageList";
import { useConversation, useSendMessage } from "@/hooks/use-chat";
import { CyberButton } from "@/components/CyberButton";
import { Send, Menu, Loader2 } from "lucide-react";
import TextareaAutosize from "react-textarea-autosize";

export default function ChatPage() {
  const [match, params] = useRoute("/chat/:id");
  const id = params?.id ? parseInt(params.id) : null;
  
  const { data: conversation, isLoading: isChatLoading, error } = useConversation(id);
  const sendMessageMutation = useSendMessage();
  
  const [input, setInput] = useState("");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Auto-focus input on load
  const inputRef = (element: HTMLTextAreaElement) => {
    if (element) {
      // element.focus(); // Optional: might be annoying on mobile
    }
  };

  const handleSend = () => {
    if (!input.trim() || !id) return;
    sendMessageMutation.mutate({ id, content: input });
    setInput("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (!id) {
    return (
      <div className="flex h-screen bg-background text-foreground overflow-hidden">
        <Sidebar isOpen={isSidebarOpen} onToggle={() => setIsSidebarOpen(!isSidebarOpen)} />
        <main className="flex-1 flex items-center justify-center p-4">
          <div className="text-center space-y-4 max-w-md">
            <h1 className="text-4xl md:text-6xl font-mono text-primary animate-pulse tracking-widest">LUMENIA</h1>
            <p className="text-muted-foreground font-light">
              Secure quantum uplink established. Select a protocol from the sidebar or initialize a new session.
            </p>
            <CyberButton onClick={() => setIsSidebarOpen(true)} className="md:hidden w-full">
              Open Menu
            </CyberButton>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-background text-foreground overflow-hidden relative">
      {/* Background Grid Effect */}
      <div className="absolute inset-0 z-0 opacity-5 pointer-events-none" 
           style={{ 
             backgroundImage: 'linear-gradient(var(--primary) 1px, transparent 1px), linear-gradient(90deg, var(--primary) 1px, transparent 1px)', 
             backgroundSize: '40px 40px' 
           }} 
      />

      <Sidebar isOpen={isSidebarOpen} onToggle={() => setIsSidebarOpen(!isSidebarOpen)} />

      <main className="flex-1 flex flex-col h-full relative z-10 w-full max-w-full">
        {/* Header */}
        <header className="h-16 border-b border-border/50 bg-background/80 backdrop-blur flex items-center px-4 justify-between shrink-0">
          <div className="flex items-center gap-3">
            <button onClick={() => setIsSidebarOpen(true)} className="md:hidden text-muted-foreground hover:text-primary transition-colors">
              <Menu size={24} />
            </button>
            <div className="flex flex-col">
              <h2 className="font-mono font-bold text-lg tracking-wide truncate max-w-[200px] md:max-w-md text-foreground">
                {isChatLoading ? "LOADING..." : conversation?.title || "UNTITLED SESSION"}
              </h2>
              <span className="text-[10px] text-primary uppercase tracking-widest flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                Online Encrypted
              </span>
            </div>
          </div>
        </header>

        {/* Chat Area */}
        <div className="flex-1 overflow-hidden flex flex-col relative">
          {isChatLoading ? (
            <div className="flex-1 flex items-center justify-center flex-col gap-4">
              <Loader2 className="animate-spin text-primary" size={40} />
              <p className="font-mono text-xs text-muted-foreground animate-pulse">DECRYPTING HISTORY...</p>
            </div>
          ) : error ? (
            <div className="flex-1 flex items-center justify-center text-destructive">
              Error loading session protocol.
            </div>
          ) : (
            <MessageList 
              messages={conversation?.messages || []} 
              isTyping={sendMessageMutation.isPending} 
            />
          )}
        </div>

        {/* Input Area */}
        <div className="p-4 bg-background/90 border-t border-border/50 backdrop-blur shrink-0">
          <div className="max-w-4xl mx-auto flex gap-2 items-end">
            <div className="flex-1 relative">
              <TextareaAutosize
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Enter command or message..."
                minRows={1}
                maxRows={5}
                disabled={sendMessageMutation.isPending || isChatLoading}
                className="w-full resize-none rounded-lg bg-secondary/5 border border-primary/20 focus:border-primary/60 focus:ring-1 focus:ring-primary/30 p-3 pr-10 text-sm font-mono transition-all outline-none text-foreground placeholder:text-muted-foreground/50 shadow-inner"
              />
              <div className="absolute bottom-2 right-2 flex gap-1">
                 {/* Optional: Add attachment or other buttons here */}
              </div>
            </div>
            <CyberButton 
              size="icon" 
              onClick={handleSend}
              disabled={!input.trim() || sendMessageMutation.isPending || isChatLoading}
              className={cn("h-[42px] w-[42px] shrink-0", !input.trim() && "opacity-50")}
            >
              {sendMessageMutation.isPending ? <Loader2 className="animate-spin" size={18} /> : <Send size={18} />}
            </CyberButton>
          </div>
          <div className="max-w-4xl mx-auto mt-2 text-center">
             <p className="text-[10px] text-muted-foreground/40 font-mono uppercase tracking-widest">
               AI output is generated and may be unpredictable. No filters active.
             </p>
          </div>
        </div>
      </main>
    </div>
  );
}
