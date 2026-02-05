import { Link } from "wouter";
import { CyberButton } from "@/components/CyberButton";
import { AlertTriangle } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-background text-foreground p-4">
      <div className="cyber-card p-8 md:p-12 max-w-md w-full text-center space-y-6 neon-border relative group">
        
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary to-transparent opacity-50" />
        
        <div className="flex justify-center mb-6">
          <AlertTriangle size={64} className="text-destructive animate-pulse" />
        </div>
        
        <h1 className="text-6xl font-mono font-bold text-destructive glitch-text" data-text="404">404</h1>
        
        <div className="space-y-2">
          <h2 className="text-xl font-bold tracking-widest uppercase">Signal Lost</h2>
          <p className="text-muted-foreground text-sm font-mono">
            The requested protocol address does not exist in this sector.
          </p>
        </div>

        <Link href="/">
          <CyberButton className="w-full mt-4">
            Return to Base
          </CyberButton>
        </Link>
      </div>
    </div>
  );
}
