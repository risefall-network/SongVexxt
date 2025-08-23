import { useState, useEffect } from "react";

interface TypingIndicatorProps {
  text?: string;
  className?: string;
}

export default function TypingIndicator({ text = "SongVexxt is thinking", className = "" }: TypingIndicatorProps) {
  const [dots, setDots] = useState("");

  useEffect(() => {
    const interval = setInterval(() => {
      setDots(prev => {
        if (prev.length >= 3) return "";
        return prev + ".";
      });
    }, 500);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className={`flex items-center gap-2 ${className}`} data-testid="typing-indicator">
      <div className="flex items-center gap-1">
        {/* Animated cyberpunk dots */}
        {[0, 1, 2].map((index) => (
          <div
            key={index}
            className="w-2 h-2 rounded-full bg-neon-blue animate-pulse"
            style={{
              animationDelay: `${index * 0.2}s`,
              animationDuration: "1.4s",
              boxShadow: "0 0 8px hsl(var(--neon-blue))"
            }}
          />
        ))}
      </div>
      
      <span className="text-sm text-neon-gold font-cyber animate-cyber-flicker">
        {text}
        <span className="text-neon-pink">{dots}</span>
      </span>
      
      {/* Neon line effect */}
      <div className="flex-1 h-px bg-gradient-to-r from-neon-blue via-neon-purple to-transparent opacity-50" />
    </div>
  );
}