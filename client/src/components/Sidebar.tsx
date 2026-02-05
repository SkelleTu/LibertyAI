import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Plus, MessageSquare, Trash2, Settings, Menu, X } from "lucide-react";
import { useConversations, useCreateConversation, useDeleteConversation } from "@/hooks/use-chat";
import { CyberButton } from "./CyberButton";
import { SettingsDialog } from "./SettingsDialog";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
}

export function Sidebar({ isOpen, onToggle }: SidebarProps) {
  const [location] = useLocation();
  const { data: conversations, isLoading } = useConversations();
  const createMutation = useCreateConversation();
  const deleteMutation = useDeleteConversation();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Extract ID from /chat/:id
  const currentId = location.startsWith("/chat/") 
    ? parseInt(location.split("/")[2]) 
    : null;

  const handleCreate = () => {
    createMutation.mutate({ title: "New Session" }, {
      onSuccess: (data) => {
        // Use wouter navigation imperatively if needed, or link handles it
        window.location.href = `/chat/${data.id}`;
      }
    });
  };

  const handleDelete = (e: React.MouseEvent, id: number) => {
    e.preventDefault();
    e.stopPropagation();
    if (confirm("Terminate this session protocol?")) {
      deleteMutation.mutate(id);
      if (currentId === id) {
        window.location.href = "/";
      }
    }
  };

  return (
    <>
      {/* Mobile Overlay */}
      <div 
        className={cn(
          "fixed inset-0 bg-black/80 backdrop-blur-sm z-40 md:hidden transition-opacity",
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
        onClick={onToggle}
      />

      {/* Sidebar Content */}
      <aside className={cn(
        "fixed md:static inset-y-0 left-0 z-50 w-72 bg-card border-r border-border transform transition-transform duration-300 md:transform-none flex flex-col",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="p-4 border-b border-border/50 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded bg-primary/20 flex items-center justify-center border border-primary/50 group-hover:shadow-[0_0_10px_rgba(0,255,255,0.4)] transition-all">
              <span className="font-mono font-bold text-primary">L</span>
            </div>
            <h1 className="font-mono text-xl font-bold tracking-widest text-foreground">LUMENIA</h1>
          </Link>
          <button onClick={onToggle} className="md:hidden text-muted-foreground hover:text-foreground">
            <X size={20} />
          </button>
        </div>

        <div className="p-4">
          <CyberButton 
            onClick={handleCreate} 
            disabled={createMutation.isPending}
            className="w-full"
          >
            <Plus size={16} />
            Initialize Session
          </CyberButton>
        </div>

        <div className="flex-1 overflow-y-auto px-2 py-2 space-y-1 scrollbar-thin">
          <h3 className="text-xs font-mono text-muted-foreground px-4 mb-2 uppercase tracking-widest">History</h3>
          
          {isLoading ? (
            <div className="text-center p-4 text-muted-foreground animate-pulse">Scanning database...</div>
          ) : conversations?.length === 0 ? (
            <div className="text-center p-4 text-muted-foreground text-sm border border-dashed border-border/50 m-2 rounded">
              No active protocols found.
            </div>
          ) : (
            conversations?.map((chat) => (
              <Link key={chat.id} href={`/chat/${chat.id}`}>
                <div className={cn(
                  "group flex items-center justify-between p-3 rounded cursor-pointer border border-transparent transition-all hover:bg-white/5",
                  currentId === chat.id 
                    ? "bg-primary/5 border-primary/30 text-primary shadow-[inset_0_0_10px_rgba(0,255,255,0.05)]" 
                    : "text-muted-foreground"
                )}>
                  <div className="flex items-center gap-3 overflow-hidden">
                    <MessageSquare size={14} className={currentId === chat.id ? "text-primary" : "text-muted-foreground"} />
                    <div className="flex flex-col truncate">
                      <span className="truncate text-sm font-medium font-sans">
                        {chat.title || `Session #${chat.id}`}
                      </span>
                      <span className="text-[10px] opacity-50 font-mono">
                        {format(new Date(chat.createdAt), 'MMM d, HH:mm')}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={(e) => handleDelete(e, chat.id)}
                    className="opacity-0 group-hover:opacity-100 hover:text-destructive transition-opacity"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </Link>
            ))
          )}
        </div>

        <div className="p-4 border-t border-border/50 bg-black/20">
          <CyberButton 
            variant="ghost" 
            className="w-full justify-start" 
            onClick={() => setIsSettingsOpen(true)}
          >
            <Settings size={16} />
            System Config
          </CyberButton>
        </div>
      </aside>
      
      <SettingsDialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen} />
    </>
  );
}
