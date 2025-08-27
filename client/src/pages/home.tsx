import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import TopNavigation from "@/components/TopNavigation";
import OverlayMode from "@/components/OverlayMode";
import ExpandedWorkspace from "@/components/ExpandedWorkspace";
import PreferencesModal from "@/components/PreferencesModal";

export default function Home() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading } = useAuth();
  const [isExpanded, setIsExpanded] = useState(true);
  const [visualEffectsEnabled, setVisualEffectsEnabled] = useState(true);
  const [showPreferences, setShowPreferences] = useState(false);

  // Redirect to home if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }
  }, [isAuthenticated, isLoading, toast]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="glass-effect rounded-xl p-8 text-center">
          <div className="animate-pulse-neon mb-4">
            <div className="w-16 h-16 bg-neon-blue rounded-full mx-auto opacity-50" />
          </div>
          <p className="font-cyber text-neon-blue">Loading SongVexxt...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null; // Will redirect in useEffect
  }

  const toggleMode = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <div className="min-h-screen w-full relative">
      {!isExpanded && (
        <TopNavigation 
          isExpanded={isExpanded} 
          onToggleMode={toggleMode}
          visualEffectsEnabled={visualEffectsEnabled}
          onToggleVisualEffects={setVisualEffectsEnabled}
          onOpenPreferences={() => setShowPreferences(true)}
          data-testid="nav-top"
        />
      )}
      
      {isExpanded ? (
        <ExpandedWorkspace data-testid="workspace-expanded" />
      ) : (
        <OverlayMode
          isExpanded={isExpanded}
          onToggleMode={toggleMode}
          visualEffectsEnabled={visualEffectsEnabled}
          data-testid="workspace-overlay"
        />
      )}
      
      <PreferencesModal
        isOpen={showPreferences}
        onClose={() => setShowPreferences(false)}
        visualEffectsEnabled={visualEffectsEnabled}
        onToggleVisualEffects={setVisualEffectsEnabled}
      />
    </div>
  );
}