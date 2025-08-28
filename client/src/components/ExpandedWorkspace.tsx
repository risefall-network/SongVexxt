import SongStructureEnhanced from "./SongStructureEnhanced";
import AIAssistant from "./AIAssistant";
import Dictionary from "./Dictionary";
import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { WandSparkles, Book, Save, BarChart3, X, Share2, Search, BookOpen, Mic } from "lucide-react";
import SocialShare from "./SocialShare";
import MoodVisualizer from "./MoodVisualizer";
import AIGenreSuggestion from "./AIGenreSuggestion";
import KeyboardSounds from "./KeyboardSounds";
import TypingIndicator from "./TypingIndicator";
import AISuggestedLines from "./AISuggestedLines";
import Thesaurus from "./Thesaurus";
import SavedAudioFiles from "./SavedAudioFiles";
import TopNavigation from "./TopNavigation";
import PreferencesModal from "./PreferencesModal";
import RhymeAssistant from "./RhymeAssistant";

export default function ExpandedWorkspace() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [lyrics, setLyrics] = useState("I love you with all my heart\nNothing can tear us apart\nYou're my light, you're my art\nA perfect work from the start");
  const [projectTitle, setProjectTitle] = useState("Untitled Song");
  const [currentSection, setCurrentSection] = useState("Chorus");
  const [showDictionaryPanel, setShowDictionaryPanel] = useState(false);
  const [showAIPanel, setShowAIPanel] = useState(false);
  const [showThesaurusPanel, setShowThesaurusPanel] = useState(false);
  const [showAudioPanel, setShowAudioPanel] = useState(false);
  const [leftSidebarCollapsed, setLeftSidebarCollapsed] = useState(false);
  const [rightSidebarCollapsed, setRightSidebarCollapsed] = useState(false);
  const [isAIThinking, setIsAIThinking] = useState(false);
  const [visualEffectsEnabled, setVisualEffectsEnabled] = useState(true);
  const [showPreferences, setShowPreferences] = useState(false);

  // Get active project
  const { data: activeProject, isLoading: projectLoading } = useQuery({
    queryKey: ["/api/projects/active"],
    enabled: !!user,
  });

  // Handle auth errors
  useEffect(() => {
    if (activeProject === undefined && !projectLoading && user) {
      // Check if this is an auth error
      fetch('/api/projects/active')
        .then(res => {
          if (res.status === 401) {
            toast({
              title: "Unauthorized",
              description: "You are logged out. Logging in again...",
              variant: "destructive",
            });
            setTimeout(() => {
              window.location.href = "/api/login";
            }, 500);
          }
        })
        .catch(console.error);
    }
  }, [activeProject, projectLoading, user, toast]);

  // Update project mutation
  const updateProjectMutation = useMutation({
    mutationFn: async (data: { title?: string; lyrics?: string }) => {
      if (!activeProject || !(activeProject as any).id) return;
      await apiRequest("PUT", `/api/projects/${(activeProject as any).id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/projects/active"] });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
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
      toast({
        title: "Error",
        description: "Failed to save project",
        variant: "destructive",
      });
    },
  });

  // Create project mutation
  const createProjectMutation = useMutation({
    mutationFn: async (data: { title: string; lyrics: string }) => {
      await apiRequest("POST", "/api/projects", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/projects/active"] });
      toast({
        title: "Success",
        description: "New project created",
      });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
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
      toast({
        title: "Error",
        description: "Failed to create project",
        variant: "destructive",
      });
    },
  });

  // Auto-save effect
  useEffect(() => {
    if (!activeProject) return;
    
    const timeoutId = setTimeout(() => {
      if ((activeProject as any).lyrics !== lyrics || (activeProject as any).title !== projectTitle) {
        updateProjectMutation.mutate({ title: projectTitle, lyrics });
      }
    }, 2000);

    return () => clearTimeout(timeoutId);
  }, [lyrics, projectTitle, activeProject]);

  // Load project data
  useEffect(() => {
    if (activeProject) {
      setLyrics((activeProject as any).lyrics || "");
      setProjectTitle((activeProject as any).title || "Untitled Song");
    }
  }, [activeProject]);

  const handleSave = () => {
    if (activeProject) {
      updateProjectMutation.mutate({ title: projectTitle, lyrics });
    } else {
      createProjectMutation.mutate({ title: projectTitle, lyrics });
    }
  };

  const handleSelectAISuggestion = (suggestion: string) => {
    const newLyrics = lyrics + (lyrics.endsWith('\n') ? '' : '\n') + suggestion;
    setLyrics(newLyrics);
  };

  const handleSelectRhyme = (word: string) => {
    const lines = lyrics.split('\n');
    const currentLineIndex = lines.length - 1;
    const currentLine = lines[currentLineIndex] || '';
    const words = currentLine.trim().split(/\s+/);
    
    if (words.length === 0 || (words.length === 1 && words[0] === '')) {
      lines[currentLineIndex] = word;
    } else {
      words[words.length - 1] = word;
      lines[currentLineIndex] = words.join(' ');
    }
    
    setLyrics(lines.join('\n'));
  };

  const getLyricsStats = () => {
    const lines = lyrics.split('\n').filter(line => line.trim().length > 0);
    const words = lyrics.split(/\s+/).filter(word => word.trim().length > 0);
    return {
      lineCount: lines.length,
      wordCount: words.length,
      rhymeScheme: "AAAA" // Simplified for demo
    };
  };

  const stats = getLyricsStats();

  return (
    <div className="flex flex-col min-h-screen relative" data-testid="expanded-workspace">
      {/* Top Navigation */}
      <TopNavigation
        isExpanded={true}
        onToggleMode={() => {}}
        visualEffectsEnabled={visualEffectsEnabled}
        onToggleVisualEffects={setVisualEffectsEnabled}
        onOpenPreferences={() => setShowPreferences(true)}
      />
      
      <div className="flex flex-1 relative min-h-0">
        {/* Mood Visualizer Background */}
        <MoodVisualizer lyrics={lyrics} className="z-0" isEnabled={visualEffectsEnabled} />
      
      {/* Keyboard Sounds */}
      <KeyboardSounds enabled={true} />
      
      {/* Left Sidebar - Song Structure & Tools */}
      <div className={`${leftSidebarCollapsed ? 'w-12' : 'w-64 lg:w-72 xl:w-80'} transition-all duration-300 glass-effect border-r border-neon-blue/20 flex flex-col relative z-10 overflow-y-auto max-h-screen scrollbar-custom`}>
        <Button
          onClick={() => setLeftSidebarCollapsed(!leftSidebarCollapsed)}
          className="absolute -right-3 top-4 z-20 cyber-button p-1 rounded-full w-6 h-6"
          data-testid="button-toggle-left-sidebar"
        >
          {leftSidebarCollapsed ? '>' : '<'}
        </Button>
        {!leftSidebarCollapsed && <div className="p-3 border-b border-neon-blue/20">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-cyber text-lg text-neon-blue" data-testid="text-project-title">Current Project</h3>
            <Button 
              onClick={handleSave}
              className="cyber-button p-2 rounded"
              disabled={updateProjectMutation.isPending || createProjectMutation.isPending}
              data-testid="button-save"
            >
              <Save className="w-4 h-4" />
            </Button>
          </div>
          <Input 
            value={projectTitle}
            onChange={(e) => setProjectTitle(e.target.value)}
            placeholder="Untitled Song"
            className="bg-cyber-purple/30 border-neon-blue/30 focus:border-neon-blue"
            data-testid="input-project-title"
          />
        </div>}

        {!leftSidebarCollapsed && (
          <>
            <SongStructureEnhanced 
              currentSection={currentSection}
              onSectionChange={setCurrentSection}
            />
            
            {/* AI Genre Suggestion */}
            <div className="p-3">
              <AIGenreSuggestion lyrics={lyrics} />
            </div>
          </>
        )}
      </div>

      {/* Main Writing Area */}
      <div className="flex-1 flex flex-col relative z-10 overflow-y-auto max-h-screen scrollbar-custom">
        {/* Toolbar */}
        <div className="glass-effect border-b border-neon-blue/20 p-2 xl:p-4">
          <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-2">
            <div className="flex flex-wrap items-center gap-2 xl:space-x-2">
              <Button 
                onClick={() => setShowAIPanel(!showAIPanel)}
                className={`cyber-button px-2 xl:px-4 py-1 xl:py-2 rounded text-xs xl:text-sm ${showAIPanel ? 'bg-neon-purple/30 border-neon-purple' : ''}`} 
                data-testid="button-ai-assist-toolbar"
              >
                <WandSparkles className="w-3 xl:w-4 h-3 xl:h-4 xl:mr-2" />
                <span className="hidden sm:inline">AI Assist</span>
              </Button>
              <Button 
                onClick={() => setShowDictionaryPanel(!showDictionaryPanel)}
                className={`cyber-button px-2 xl:px-4 py-1 xl:py-2 rounded text-xs xl:text-sm ${showDictionaryPanel ? 'bg-neon-blue/30 border-neon-blue' : ''}`} 
                data-testid="button-dictionary-toolbar"
              >
                <Book className="w-3 xl:w-4 h-3 xl:h-4 xl:mr-2" />
                <span className="hidden sm:inline">Dictionary</span>
              </Button>
              <Button 
                onClick={() => setShowThesaurusPanel(!showThesaurusPanel)}
                className={`cyber-button px-2 xl:px-4 py-1 xl:py-2 rounded text-xs xl:text-sm ${showThesaurusPanel ? 'bg-neon-purple/30 border-neon-purple' : ''}`} 
                data-testid="button-thesaurus-toolbar"
              >
                <BookOpen className="w-3 xl:w-4 h-3 xl:h-4 xl:mr-2" />
                <span className="hidden sm:inline">Thesaurus</span>
              </Button>
              <Button 
                onClick={() => setShowAudioPanel(!showAudioPanel)}
                className={`cyber-button px-2 xl:px-4 py-1 xl:py-2 rounded text-xs xl:text-sm ${showAudioPanel ? 'bg-neon-cyan/30 border-neon-cyan' : ''}`} 
                data-testid="button-audio-toolbar"
              >
                <Mic className="w-3 xl:w-4 h-3 xl:h-4 xl:mr-2" />
                <span className="hidden sm:inline">Audio</span>
              </Button>
              <SocialShare 
                lyrics={lyrics}
                songTitle={projectTitle}
                currentSection={currentSection}
              >
                <Button className="cyber-button px-2 xl:px-4 py-1 xl:py-2 rounded text-xs xl:text-sm">
                  <Share2 className="w-3 xl:w-4 h-3 xl:h-4 xl:mr-2" />
                  <span className="hidden sm:inline">Share</span>
                </Button>
              </SocialShare>
            </div>
            
            <div className="flex items-center space-x-2 xl:space-x-4">
              {isAIThinking && <TypingIndicator />}
              <div className="text-xs xl:text-sm text-muted-foreground" data-testid="text-save-status">
                <Save className="w-3 xl:w-4 h-3 xl:h-4 text-neon-blue inline mr-1" />
                <span className="hidden sm:inline">Auto-saved 2s ago</span>
                <span className="sm:hidden">Saved</span>
              </div>
            </div>
          </div>
        </div>

        {/* Main Editor */}
        <div className="flex-1 p-2 lg:p-4 xl:p-6 overflow-y-auto max-h-[calc(100vh-200px)] scrollbar-custom">
          <div className="space-y-4">
            {/* Lyrics Editor */}
            <div className="w-full">
              <div className="mb-3">
                <h3 className="font-cyber text-base lg:text-lg text-neon-blue mb-2" data-testid="text-editor-title">
                  Lyrics Workspace
                </h3>
                <div className="text-xs lg:text-sm text-neon-gold/70" data-testid="text-current-section">
                  Currently editing: <span className="text-neon-cyan">{currentSection}</span>
                </div>
              </div>
              
              <textarea 
                value={lyrics}
                onChange={(e) => setLyrics(e.target.value)}
                placeholder="Start writing your lyrics here..."
                className="w-full h-48 lg:h-64 xl:h-80 bg-cyber-purple/20 border border-neon-blue/30 rounded-xl p-3 lg:p-4 xl:p-6 text-neon-gold placeholder-neon-gold/40 focus:border-neon-blue focus:outline-none font-mono resize-y text-sm lg:text-base xl:text-lg leading-relaxed scrollbar-custom"
                data-testid="textarea-lyrics-main"
              />

              {/* Writing Stats */}
              <div className="mt-3 flex flex-wrap items-center gap-4 text-xs lg:text-sm text-neon-gold/70">
                <div data-testid="stat-lines">
                  Lines: <span className="text-neon-blue">{stats.lineCount}</span>
                </div>
                <div data-testid="stat-words">
                  Words: <span className="text-neon-blue">{stats.wordCount}</span>
                </div>
                <div data-testid="stat-rhyme-scheme">
                  Rhyme Scheme: <span className="text-neon-cyan">{stats.rhymeScheme}</span>
                </div>
              </div>
            </div>

            {/* Rhyme Assistant */}
            <div className="w-full">
              <RhymeAssistant 
                lyrics={lyrics}
                onSelectWord={handleSelectRhyme}
              />
            </div>

            {/* AI Suggestions Panel */}
            <div className="w-full">
              <AISuggestedLines 
                lyrics={lyrics}
                section={currentSection}
                onSelectSuggestion={handleSelectAISuggestion}
                className="mb-4"
              />
            </div>

            {/* AI Assistant Panel */}
            {showAIPanel && (
              <div className="w-full">
                <AIAssistant lyrics={lyrics} section={currentSection} />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Right Panel - Dictionary, Thesaurus & Audio */}
        {(showDictionaryPanel || showThesaurusPanel || showAudioPanel) && (
          <div className={`${rightSidebarCollapsed ? 'w-12' : 'w-64 lg:w-72 xl:w-80'} transition-all duration-300 glass-effect border-l border-neon-blue/20 flex flex-col relative z-10 overflow-y-auto max-h-screen scrollbar-custom`}>
            <Button
              onClick={() => setRightSidebarCollapsed(!rightSidebarCollapsed)}
              className="absolute -left-3 top-4 z-20 cyber-button p-1 rounded-full w-6 h-6"
              data-testid="button-toggle-right-sidebar"
            >
              {rightSidebarCollapsed ? '<' : '>'}
            </Button>
            {!rightSidebarCollapsed && (
              <>
                {showDictionaryPanel && <Dictionary />}
                {showThesaurusPanel && <Thesaurus />}
                {showAudioPanel && <SavedAudioFiles currentSection={currentSection} />}
              </>
            )}
          </div>
        )}
      </div>
      
      {/* Preferences Modal */}
      <PreferencesModal
        isOpen={showPreferences}
        onClose={() => setShowPreferences(false)}
        visualEffectsEnabled={visualEffectsEnabled}
        onToggleVisualEffects={setVisualEffectsEnabled}
      />
    </div>
  );
}
