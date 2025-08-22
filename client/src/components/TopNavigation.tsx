import { Music, Expand, Combine } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface TopNavigationProps {
  isExpanded: boolean;
  onToggleMode: () => void;
}

export default function TopNavigation({ isExpanded, onToggleMode }: TopNavigationProps) {
  const { user } = useAuth();

  return (
    <nav className="relative z-50 flex items-center justify-between p-4 glass-effect border-b border-neon-blue/20">
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2">
          <div className="animate-pulse-neon">
            <Music className="text-neon-blue text-2xl w-8 h-8" />
          </div>
          <h1 className="text-2xl font-cyber font-bold text-glow" data-testid="text-app-title">
            SongVexxt
          </h1>
        </div>
        <div className="text-sm text-neon-blue/70" data-testid="text-app-subtitle">
          AI Songwriting Assistant
        </div>
      </div>
      
      <div className="flex items-center space-x-4">
        <Button 
          onClick={onToggleMode}
          className="cyber-button px-4 py-2 rounded-lg text-sm font-medium"
          data-testid="button-toggle-mode"
        >
          {isExpanded ? (
            <Combine className="w-4 h-4 mr-2" />
          ) : (
            <Expand className="w-4 h-4 mr-2" />
          )}
          <span>{isExpanded ? 'Overlay Mode' : 'Expand Workspace'}</span>
        </Button>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="cyber-button px-3 py-2 rounded-lg" data-testid="button-user-menu">
              <div className="flex items-center space-x-2">
                <Avatar className="w-8 h-8">
                  <AvatarImage src={user?.profileImageUrl || ""} />
                  <AvatarFallback className="bg-gradient-to-r from-neon-blue to-neon-purple text-cyber-dark">
                    {user?.firstName?.[0] || user?.email?.[0] || 'U'}
                  </AvatarFallback>
                </Avatar>
                <span className="text-sm" data-testid="text-username">
                  {user?.firstName || user?.email || 'User'}
                </span>
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="glass-effect border-neon-blue/30">
            <DropdownMenuItem 
              onClick={() => window.location.href = "/api/logout"}
              className="text-red-400 hover:text-red-300"
              data-testid="button-logout"
            >
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </nav>
  );
}
