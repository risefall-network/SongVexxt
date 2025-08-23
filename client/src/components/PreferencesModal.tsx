import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Palette, Zap, Eye } from "lucide-react";

interface PreferencesModalProps {
  isOpen: boolean;
  onClose: () => void;
  visualEffectsEnabled: boolean;
  onToggleVisualEffects: (enabled: boolean) => void;
}

export default function PreferencesModal({
  isOpen,
  onClose,
  visualEffectsEnabled,
  onToggleVisualEffects,
}: PreferencesModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl glass-effect border-neon-blue/30" data-testid="modal-preferences">
        <DialogHeader>
          <DialogTitle className="font-cyber text-xl text-neon-blue flex items-center gap-2">
            <Palette className="w-5 h-5" />
            Preferences
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Visual Effects Section */}
          <Card className="glass-effect border-neon-purple/20">
            <CardHeader>
              <CardTitle className="text-neon-purple flex items-center gap-2 text-base">
                <Eye className="w-4 h-4" />
                Visual Effects
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label htmlFor="typing-effects" className="text-neon-gold font-medium">
                    Typing Emotion Indicator
                  </Label>
                  <p className="text-sm text-neon-gold/70">
                    Enable visual effects that respond to your typing emotions and mood
                  </p>
                </div>
                <Switch
                  id="typing-effects"
                  checked={visualEffectsEnabled}
                  onCheckedChange={onToggleVisualEffects}
                  data-testid="switch-visual-effects"
                />
              </div>
              
              <div className="p-3 bg-cyber-purple/20 rounded-lg border border-neon-blue/20">
                <div className="flex items-center gap-2 mb-2">
                  <Zap className="w-4 h-4 text-neon-cyan" />
                  <span className="text-sm text-neon-cyan">Preview</span>
                </div>
                <p className="text-xs text-neon-gold/70">
                  When enabled, the background will pulse and glow with colors that match the emotional tone of your lyrics as you type.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Future Features Section */}
          <Card className="glass-effect border-neon-blue/20 opacity-60">
            <CardHeader>
              <CardTitle className="text-neon-blue flex items-center gap-2 text-base">
                More Settings Coming Soon
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm text-neon-gold/50">
                <div>• Custom color themes</div>
                <div>• Audio feedback settings</div>
                <div>• AI assistance preferences</div>
                <div>• Keyboard shortcuts</div>
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}