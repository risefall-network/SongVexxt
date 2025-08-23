import SongStructure from "./SongStructure";
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
import { WandSparkles, Book, Save, BarChart3, X, Share2 } from "lucide-react";
import SocialShare from "./SocialShare";

export default function ExpandedWorkspace() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [lyrics, setLyrics] = useState("I love you with all my heart\nNothing can tear us apart\nYou're my light, you're my art\nA perfect work from the start");
  const [projectTitle, setProjectTitle] = useState("Untitled Song");
  const [currentSection, setCurrentSection] = useState("Chorus");
  const [showDictionaryPanel, setShowDictionaryPanel] = useState(false);
  const [showAIPanel, setShowAIPanel] = useState(false);

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
      if (!activeProject?.id) return;
      await apiRequest("PUT", `/api/projects/${activeProject.id}`, data);
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
      if (activeProject.lyrics !== lyrics || activeProject.title !== projectTitle) {
        updateProjectMutation.mutate({ title: projectTitle, lyrics });
      }
    }, 2000);

    return () => clearTimeout(timeoutId);
  }, [lyrics, projectTitle, activeProject]);

  // Load project data
  useEffect(() => {
    if (activeProject) {
      setLyrics(activeProject.lyrics || "");
      setProjectTitle(activeProject.title || "Untitled Song");
    }
  }, [activeProject]);

  const handleSave = () => {
    if (activeProject) {
      updateProjectMutation.mutate({ title: projectTitle, lyrics });
    } else {
      createProjectMutation.mutate({ title: projectTitle, lyrics });
    }
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
    <div className="flex h-full" data-testid="expanded-workspace">
      {/* Left Sidebar - Song Structure & Tools */}
      <div className="w-80 glass-effect border-r border-neon-blue/20 flex flex-col">
        <div className="p-4 border-b border-neon-blue/20">
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
        </div>

        <SongStructure 
          currentSection={currentSection}
          onSectionChange={setCurrentSection}
        />
      </div>

      {/* Main Writing Area */}
      <div className="flex-1 flex flex-col">
        {/* Toolbar */}
        <div className="glass-effect border-b border-neon-blue/20 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button 
                onClick={() => setShowAIPanel(!showAIPanel)}
                className={`cyber-button px-4 py-2 rounded-lg ${showAIPanel ? 'bg-neon-purple/30 border-neon-purple' : ''}`} 
                data-testid="button-ai-assist-toolbar"
              >
                <WandSparkles className="w-4 h-4 mr-2" />
                AI Assist
              </Button>
              <Button 
                onClick={() => setShowDictionaryPanel(!showDictionaryPanel)}
                className={`cyber-button px-4 py-2 rounded-lg ${showDictionaryPanel ? 'bg-neon-blue/30 border-neon-blue' : ''}`} 
                data-testid="button-dictionary-toolbar"
              >
                <Book className="w-4 h-4 mr-2" />
                Dictionary
              </Button>
              <SocialShare 
                lyrics={lyrics}
                songTitle={projectTitle}
                currentSection={currentSection}
              >
                <Button className="cyber-button px-4 py-2 rounded-lg">
                  <Share2 className="w-4 h-4 mr-2" />
                  Share
                </Button>
              </SocialShare>
              <Button 
                onClick={() => setShowDictionaryPanel(!showDictionaryPanel)}
                className={`cyber-button px-4 py-2 rounded-lg ${showDictionaryPanel ? 'bg-neon-cyan/30 border-neon-cyan' : ''}`} 
                data-testid="button-thesaurus"
              >
                <Search className="w-4 h-4 mr-2" />
                Thesaurus
              </Button>
            </div>
            
            <div className="flex items-center space-x-2 text-sm text-gray-400" data-testid="text-save-status">
              <Save className="w-4 h-4 text-neon-blue" />
              <span>Auto-saved 2 seconds ago</span>
            </div>
          </div>
        </div>

        {/* Main Editor */}
        <div className="flex-1 p-6">
          <div className="h-full flex space-x-6">
            {/* Lyrics Editor */}
            <div className="flex-1">
              <div className="mb-4">
                <h3 className="font-cyber text-lg text-neon-blue mb-2" data-testid="text-editor-title">
                  Lyrics Workspace
                </h3>
                <div className="text-sm text-gray-400" data-testid="text-current-section">
                  Currently editing: <span className="text-neon-cyan">{currentSection}</span>
                </div>
              </div>
              
              <textarea 
                value={lyrics}
                onChange={(e) => setLyrics(e.target.value)}
                placeholder="Start writing your lyrics here..."
                className="w-full h-96 bg-cyber-purple/20 border border-neon-blue/30 rounded-xl p-6 text-white placeholder-gray-400 focus:border-neon-blue focus:outline-none font-mono resize-none text-lg leading-relaxed"
                data-testid="textarea-lyrics-main"
              />

              {/* Writing Stats */}
              <div className="mt-4 flex items-center space-x-6 text-sm text-gray-400">
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

            {/* AI Assistant Panel */}
            {showAIPanel && <AIAssistant lyrics={lyrics} section={currentSection} />}
          </div>
        </div>
      </div>

      {/* Right Panel - Dictionary & Thesaurus */}
      {showDictionaryPanel && <Dictionary />}
    </div>
  );
}
