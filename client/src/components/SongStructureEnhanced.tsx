import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { DragDropContext, Droppable, Draggable, DropResult } from "react-beautiful-dnd";
import { 
  Music, 
  Plus, 
  Eye, 
  EyeOff, 
  Edit, 
  Save, 
  X, 
  FileText,
  Layers,
  GripVertical
} from "lucide-react";
import type { Section } from "@shared/schema";

interface SongStructureEnhancedProps {
  projectId: string | null;
  currentSection: string;
  onSectionChange: (section: Section) => void;
  onSectionContentChange: (sectionId: string, content: string) => void;
  currentLyrics: string;
  className?: string;
  onSectionSelect?: () => void; // New callback for auto-collapse
}

export default function SongStructureEnhanced({ 
  projectId,
  currentSection, 
  onSectionChange,
  onSectionContentChange,
  currentLyrics,
  className = "",
  onSectionSelect
}: SongStructureEnhancedProps) {
  const [showCombined, setShowCombined] = useState(false);
  const [newSectionName, setNewSectionName] = useState("");
  const [visibleSections, setVisibleSections] = useState<Set<string>>(new Set());
  const queryClient = useQueryClient();
  
  // Fetch sections for the current project
  const { data: sections = [], isLoading } = useQuery<Section[]>({
    queryKey: ["/api/projects", projectId, "sections"],
    enabled: !!projectId,
  });
  
  // Initialize all sections as visible
  useEffect(() => {
    if (sections.length > 0) {
      setVisibleSections(new Set(sections.map((s: Section) => s.id)));
    }
  }, [sections]);

  // Mutations for section operations
  const createSectionMutation = useMutation({
    mutationFn: async (data: { projectId: string; type: string; order: number }) => {
      return await apiRequest("POST", "/api/sections", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/projects", projectId, "sections"] });
    },
  });
  
  const updateSectionMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Section> }) => {
      return await apiRequest("PUT", `/api/sections/${id}`, updates);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/projects", projectId, "sections"] });
    },
  });
  
  const reorderSectionsMutation = useMutation({
    mutationFn: async (sectionOrders: { id: string; order: number }[]) => {
      return await apiRequest("PUT", `/api/projects/${projectId}/sections/reorder`, { sectionOrders });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/projects", projectId, "sections"] });
    },
  });
  
  const addNewSection = async () => {
    if (!newSectionName.trim() || !projectId) return;
    
    await createSectionMutation.mutateAsync({
      projectId,
      type: newSectionName,
      order: sections.length + 1,
    });
    
    setNewSectionName("");
  };
  
  const handleDragEnd = async (result: DropResult) => {
    if (!result.destination) return;
    
    const sourceIndex = result.source.index;
    const destinationIndex = result.destination.index;
    
    if (sourceIndex === destinationIndex) return;
    
    // Optimistically update the UI
    const reorderedSections = Array.from(sections);
    const [movedSection] = reorderedSections.splice(sourceIndex, 1);
    reorderedSections.splice(destinationIndex, 0, movedSection);
    
    // Update the orders
    const sectionOrders = reorderedSections.map((section: Section, index) => ({
      id: section.id,
      order: index + 1,
    }));
    
    try {
      await reorderSectionsMutation.mutateAsync(sectionOrders);
    } catch (error) {
      console.error('Failed to reorder sections:', error);
    }
  };

  const toggleSectionVisibility = (id: string) => {
    setVisibleSections(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };
  
  const handleSectionClick = async (section: Section) => {
    // Save current section content before switching
    if (currentSection && currentLyrics) {
      const currentSectionData = sections.find((s: Section) => s.type === currentSection);
      if (currentSectionData && currentSectionData.content !== currentLyrics) {
        await updateSectionMutation.mutateAsync({
          id: currentSectionData.id,
          updates: { content: currentLyrics },
        });
      }
    }
    
    // Switch to new section
    onSectionChange(section);
    
    // Trigger auto-collapse of left sidebar
    if (onSectionSelect) {
      onSectionSelect();
    }
  };

  const getSectionById = (type: string) => {
    return sections.find((section: Section) => section.type === type);
  };

  const getCombinedLyrics = () => {
    return sections
      .filter((section: Section) => visibleSections.has(section.id))
      .sort((a: Section, b: Section) => a.order - b.order)
      .map((section: Section) => `[${section.type}]\n${section.content || ""}`)
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
              {sections.filter((s: Section) => visibleSections.has(s.id)).length} sections • {getWordCount(getCombinedLyrics())} words
            </div>
          </div>

          <div className="max-h-[500px] overflow-y-auto scrollbar-custom">
            <div className="bg-cyber-purple/10 p-4 rounded-lg border border-neon-blue/20">
              {sections.filter((s: Section) => visibleSections.has(s.id)).length === 0 ? (
                <div className="text-center text-neon-gold/50 py-8">
                  <FileText className="w-8 h-8 mx-auto mb-2 text-neon-blue/30" />
                  <p>No sections visible</p>
                  <p className="text-xs mt-1">Enable sections below to see your complete song</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {sections
                    .filter((s: Section) => visibleSections.has(s.id))
                    .sort((a: Section, b: Section) => a.order - b.order)
                    .map((section: Section, index) => (
                      <div key={section.id} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <h4 className="font-cyber text-sm text-neon-cyan bg-cyber-blue/20 px-2 py-1 rounded border border-neon-blue/30">
                            {section.type}
                          </h4>
                          <Button
                            onClick={() => {
                              onSectionChange(section);
                              if (onSectionSelect) {
                                onSectionSelect();
                              }
                            }}
                            className="cyber-button text-xs px-2 py-1"
                            data-testid={`edit-section-${section.id}`}
                          >
                            <Edit className="w-3 h-3 mr-1" />
                            Edit
                          </Button>
                        </div>
                        <div className="pl-4 border-l-2 border-neon-blue/30">
                          {section.content ? (
                            <pre className="text-neon-gold font-mono text-sm leading-relaxed whitespace-pre-wrap">
                              {section.content}
                            </pre>
                          ) : (
                            <div className="text-neon-gold/50 italic text-sm py-2">
                              No lyrics yet - click Edit to add content
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </div>
          </div>

          <div className="space-y-3">
            <div className="text-xs text-neon-gold/70 text-center">
              Toggle section visibility:
            </div>
            <div className="flex flex-wrap gap-2">
              {sections.map((section: Section) => (
                <Badge
                  key={section.id}
                  variant="outline"
                  className={`text-xs cursor-pointer transition-colors ${
                    visibleSections.has(section.id) 
                      ? "border-neon-blue text-neon-blue bg-cyber-blue/20 hover:bg-cyber-blue/30" 
                      : "border-neon-gold/30 text-neon-gold/30 bg-cyber-purple/10 hover:bg-cyber-purple/20"
                  }`}
                  onClick={() => toggleSectionVisibility(section.id)}
                  data-testid={`section-badge-${section.id}`}
                >
                  {visibleSections.has(section.id) ? <Eye className="w-2 h-2 mr-1" /> : <EyeOff className="w-2 h-2 mr-1" />}
                  {section.type}
                </Badge>
              ))}
            </div>
            
            <div className="flex gap-2 pt-2">
              <Button
                onClick={() => setVisibleSections(new Set(sections.map((s: Section) => s.id)))}
                className="cyber-button text-xs flex-1"
                data-testid="show-all-sections"
              >
                <Eye className="w-3 h-3 mr-1" />
                Show All
              </Button>
              <Button
                onClick={() => setVisibleSections(new Set())}
                className="cyber-button text-xs flex-1"
                data-testid="hide-all-sections"
              >
                <EyeOff className="w-3 h-3 mr-1" />
                Hide All
              </Button>
            </div>
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
        {isLoading ? (
          <div className="text-center text-neon-gold/50 py-4">Loading sections...</div>
        ) : sections.length === 0 ? (
          <div className="text-center text-neon-gold/50 py-4">
            <p>No sections yet. Add your first section below!</p>
          </div>
        ) : (
          <DragDropContext onDragEnd={handleDragEnd}>
            <Droppable droppableId="sections-list">
              {(provided) => (
                <div
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                  className="space-y-3"
                >
                  {sections.map((section: Section, index) => (
                    <Draggable key={section.id} draggableId={section.id} index={index}>
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          className={`p-3 rounded-lg border transition-all duration-200 cursor-pointer ${
                            currentSection === section.type
                              ? "bg-neon-blue/20 border-neon-blue"
                              : "bg-cyber-purple/20 border-neon-purple/30 hover:border-neon-purple/50"
                          } ${
                            snapshot.isDragging ? "shadow-lg shadow-neon-blue/50 rotate-1" : ""
                          }`}
                          onClick={() => !snapshot.isDragging && handleSectionClick(section)}
                          data-testid={`section-${section.id}`}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <div
                                {...provided.dragHandleProps}
                                className="cursor-grab active:cursor-grabbing"
                              >
                                <GripVertical className="h-3 w-3 text-neon-gold/50 hover:text-neon-gold" />
                              </div>
                              <h4 className="font-medium text-neon-gold text-sm">
                                {section.type}
                              </h4>
                              {currentSection === section.type && (
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
                                {visibleSections.has(section.id) ? (
                                  <Eye className="h-2 w-2 text-neon-blue" />
                                ) : (
                                  <EyeOff className="h-2 w-2 text-neon-gold/50" />
                                )}
                              </Button>
                            </div>
                          </div>
                          
                          <div className="text-xs text-neon-gold/70">
                            {section.content ? (
                              <>
                                {section.content.split('\n')[0]}
                                {section.content.split('\n').length > 1 && "..."}
                                <div className="mt-1">
                                  {getWordCount(section.content)} words • {section.content.split('\n').length} lines
                                </div>
                              </>
                            ) : (
                              <span className="italic">No lyrics yet...</span>
                            )}
                          </div>
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>
        )}
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
          disabled={!newSectionName.trim() || createSectionMutation.isPending}
          className="w-full cyber-button text-xs"
          data-testid="button-add-section"
        >
          <Plus className="h-3 w-3 mr-1" />
          {createSectionMutation.isPending ? "Adding..." : "Add Section"}
        </Button>
      </div>

      <div className="mt-4 pt-3 border-t border-neon-blue/20">
        <div className="text-xs text-neon-gold/70 text-center">
          <div>Total: {sections.length} sections</div>
          <div>Visible: {sections.filter((s: Section) => visibleSections.has(s.id)).length}</div>
        </div>
      </div>
    </Card>
  );
}