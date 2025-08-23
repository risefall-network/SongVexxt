import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  Music, 
  Plus, 
  Eye, 
  EyeOff, 
  Edit, 
  Save, 
  X, 
  FileText,
  Layers
} from "lucide-react";

interface SongSection {
  id: string;
  name: string;
  lyrics: string;
  isVisible: boolean;
  order: number;
}

interface SongStructureEnhancedProps {
  currentSection: string;
  onSectionChange: (section: string) => void;
  className?: string;
}

export default function SongStructureEnhanced({ 
  currentSection, 
  onSectionChange, 
  className = "" 
}: SongStructureEnhancedProps) {
  const [sections, setSections] = useState<SongSection[]>([
    { id: "verse1", name: "Verse 1", lyrics: "Every morning I wake up thinking of you\nWondering if you feel the same way too", isVisible: true, order: 1 },
    { id: "chorus", name: "Chorus", lyrics: "You're my everything, my heart, my soul\nWithout you here I'm not whole", isVisible: true, order: 2 },
    { id: "verse2", name: "Verse 2", lyrics: "Walking through the streets we used to know\nMemories of love begin to show", isVisible: true, order: 3 },
    { id: "bridge", name: "Bridge", lyrics: "Time stands still when you're near\nAll my doubts just disappear", isVisible: true, order: 4 }
  ]);
  
  const [showCombined, setShowCombined] = useState(false);
  const [editingSection, setEditingSection] = useState<string | null>(null);
  const [newSectionName, setNewSectionName] = useState("");

  const addNewSection = () => {
    if (!newSectionName.trim()) return;
    
    const newSection: SongSection = {
      id: Date.now().toString(),
      name: newSectionName,
      lyrics: "",
      isVisible: true,
      order: sections.length + 1
    };
    
    setSections(prev => [...prev, newSection]);
    setNewSectionName("");
    onSectionChange(newSection.name);
  };

  const toggleSectionVisibility = (id: string) => {
    setSections(prev => prev.map(section => 
      section.id === id 
        ? { ...section, isVisible: !section.isVisible }
        : section
    ));
  };

  const updateSectionLyrics = (id: string, lyrics: string) => {
    setSections(prev => prev.map(section => 
      section.id === id 
        ? { ...section, lyrics }
        : section
    ));
  };

  const getSectionById = (name: string) => {
    return sections.find(section => section.name === name);
  };

  const getCombinedLyrics = () => {
    return sections
      .filter(section => section.isVisible)
      .sort((a, b) => a.order - b.order)
      .map(section => `[${section.name}]\n${section.lyrics}`)
      .join('\n\n');
  };

  const getWordCount = (lyrics: string) => {
    return lyrics.split(/\s+/).filter(word => word.trim().length > 0).length;
  };

  if (showCombined) {
    return (
      <Card className={`glass-effect border-neon-glow p-4 h-full ${className}`} data-testid="song-structure-combined">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-neon-blue" />
            <h3 className="font-cyber text-sm text-neon-gold">Complete Song</h3>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowCombined(false)}
            className="h-6 w-6 p-0 hover:bg-neon-blue/20"
            data-testid="hide-combined"
          >
            <X className="h-3 w-3 text-neon-blue" />
          </Button>
        </div>

        <div className="space-y-4">
          <div className="text-center">
            <div className="text-xs text-neon-gold/70 mb-2">
              {sections.filter(s => s.isVisible).length} sections • {getWordCount(getCombinedLyrics())} words
            </div>
          </div>

          <div className="max-h-[600px] overflow-y-auto">
            <pre className="text-neon-gold font-mono text-sm leading-relaxed whitespace-pre-wrap bg-cyber-purple/10 p-4 rounded-lg border border-neon-blue/20">
              {getCombinedLyrics() || "No lyrics written yet..."}
            </pre>
          </div>

          <div className="flex flex-wrap gap-2">
            {sections.map(section => (
              <Badge
                key={section.id}
                variant="outline"
                className={`text-xs cursor-pointer ${
                  section.isVisible 
                    ? "border-neon-blue text-neon-blue bg-cyber-blue/20" 
                    : "border-neon-gold/30 text-neon-gold/30 bg-cyber-purple/10"
                }`}
                onClick={() => toggleSectionVisibility(section.id)}
                data-testid={`section-badge-${section.id}`}
              >
                {section.isVisible ? <Eye className="w-2 h-2 mr-1" /> : <EyeOff className="w-2 h-2 mr-1" />}
                {section.name}
              </Badge>
            ))}
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className={`glass-effect border-neon-glow p-4 h-full ${className}`} data-testid="song-structure-enhanced">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Layers className="h-4 w-4 text-neon-purple" />
          <h3 className="font-cyber text-sm text-neon-gold">Song Structure</h3>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowCombined(true)}
          className="h-6 w-6 p-0 hover:bg-neon-blue/20"
          data-testid="show-combined"
        >
          <FileText className="h-3 w-3 text-neon-blue" />
        </Button>
      </div>

      <div className="space-y-3 mb-4">
        {sections.map((section) => (
          <div
            key={section.id}
            className={`p-3 rounded-lg border transition-all duration-200 cursor-pointer ${
              currentSection === section.name
                ? "bg-neon-blue/20 border-neon-blue"
                : "bg-cyber-purple/20 border-neon-purple/30 hover:border-neon-purple/50"
            }`}
            onClick={() => onSectionChange(section.name)}
            data-testid={`section-${section.id}`}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <h4 className="font-medium text-neon-gold text-sm">
                  {section.name}
                </h4>
                {currentSection === section.name && (
                  <Badge variant="outline" className="border-neon-cyan text-neon-cyan bg-cyber-blue/20 text-xs">
                    Active
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleSectionVisibility(section.id);
                  }}
                  className="h-5 w-5 p-0 hover:bg-neon-purple/20"
                  data-testid={`toggle-visibility-${section.id}`}
                >
                  {section.isVisible ? (
                    <Eye className="h-2 w-2 text-neon-blue" />
                  ) : (
                    <EyeOff className="h-2 w-2 text-neon-gold/50" />
                  )}
                </Button>
              </div>
            </div>
            
            <div className="text-xs text-neon-gold/70">
              {section.lyrics ? (
                <>
                  {section.lyrics.split('\n')[0]}
                  {section.lyrics.split('\n').length > 1 && "..."}
                  <div className="mt-1">
                    {getWordCount(section.lyrics)} words • {section.lyrics.split('\n').length} lines
                  </div>
                </>
              ) : (
                <span className="italic">No lyrics yet...</span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Add New Section */}
      <div className="space-y-2">
        <Input
          value={newSectionName}
          onChange={(e) => setNewSectionName(e.target.value)}
          placeholder="New section name..."
          className="text-xs bg-cyber-purple/30 border-neon-blue/30 text-neon-gold placeholder-neon-gold/40"
          onKeyPress={(e) => e.key === 'Enter' && addNewSection()}
          data-testid="input-new-section"
        />
        <Button
          onClick={addNewSection}
          disabled={!newSectionName.trim()}
          className="w-full cyber-button text-xs"
          data-testid="button-add-section"
        >
          <Plus className="h-3 w-3 mr-1" />
          Add Section
        </Button>
      </div>

      <div className="mt-4 pt-3 border-t border-neon-blue/20">
        <div className="text-xs text-neon-gold/70 text-center">
          <div>Total: {sections.length} sections</div>
          <div>Visible: {sections.filter(s => s.isVisible).length}</div>
        </div>
      </div>
    </Card>
  );
}