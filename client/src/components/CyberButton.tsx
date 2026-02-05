import { ButtonHTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils";

interface CyberButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md" | "lg" | "icon";
  isLoading?: boolean;
}

export const CyberButton = forwardRef<HTMLButtonElement, CyberButtonProps>(
  ({ className, variant = "primary", size = "md", isLoading, children, ...props }, ref) => {
    
    const variants = {
      primary: "bg-primary/10 text-primary border-primary/50 hover:bg-primary/20 hover:border-primary hover:shadow-[0_0_15px_rgba(0,255,255,0.3)]",
      secondary: "bg-secondary/10 text-secondary border-secondary/50 hover:bg-secondary/20 hover:border-secondary hover:shadow-[0_0_15px_rgba(180,0,255,0.3)]",
      ghost: "bg-transparent text-muted-foreground border-transparent hover:text-foreground hover:bg-white/5",
      danger: "bg-destructive/10 text-destructive border-destructive/50 hover:bg-destructive/20 hover:border-destructive hover:shadow-[0_0_15px_rgba(255,0,0,0.3)]",
    };

    const sizes = {
      sm: "h-8 px-3 text-xs",
      md: "h-10 px-4 text-sm",
      lg: "h-12 px-6 text-base",
      icon: "h-10 w-10 p-0 flex items-center justify-center",
    };

    return (
      <button
        ref={ref}
        disabled={isLoading || props.disabled}
        className={cn(
          "relative border font-mono uppercase tracking-wider transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed clip-path-slant",
          variants[variant],
          sizes[size],
          className
        )}
        {...props}
      >
        {isLoading && (
          <span className="animate-spin mr-2">
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </span>
        )}
        {children}
        {/* Corner accents */}
        <span className="absolute top-0 left-0 w-1 h-1 bg-current opacity-50" />
        <span className="absolute bottom-0 right-0 w-1 h-1 bg-current opacity-50" />
      </button>
    );
  }
);
