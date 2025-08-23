import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { WandSparkles, RefreshCw, Plus } from "lucide-react";
import TypingIndicator from "./TypingIndicator";

interface AISuggestedLinesProps {
  lyrics: string;
  section: string;
  onSelectSuggestion: (suggestion: string) => void;
  className?: string;
}

interface LineSuggestion {
  text: string;
  confidence: number;
  style: string;
}

export default function AISuggestedLines({ 
  lyrics, 
  section, 
  onSelectSuggestion, 
  className = "" 
}: AISuggestedLinesProps) {
  const [suggestions, setSuggestions] = useState<LineSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showMore, setShowMore] = useState(false);
  const [lastAnalyzedLyrics, setLastAnalyzedLyrics] = useState("");

  const generateSuggestions = async (lyricsText: string, forceRefresh = false) => {
    if (!lyricsText.trim() || (lyricsText === lastAnalyzedLyrics && !forceRefresh)) return;
    
    setIsLoading(true);
    setLastAnalyzedLyrics(lyricsText);

    try {
      const response = await fetch("/api/ai/next-line", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ lyrics: lyricsText, section }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate suggestions");
      }

      const data = await response.json();
      
      // Generate multiple variations
      const baseSuggestion = data.suggestion;
      const mockSuggestions: LineSuggestion[] = [
        {
          text: baseSuggestion,
          confidence: 0.9,
          style: "Original"
        },
        {
          text: await generateVariation(baseSuggestion, "alternative"),
          confidence: 0.85,
          style: "Alternative"
        },
        {
          text: await generateVariation(baseSuggestion, "creative"),
          confidence: 0.8,
          style: "Creative"
        }
      ];

      setSuggestions(mockSuggestions);
    } catch (error) {
      console.error("Error generating suggestions:", error);
      // Fallback suggestions
      setSuggestions([
        {
          text: "Let the music carry our hearts away",
          confidence: 0.7,
          style: "Fallback"
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const generateVariation = async (originalLine: string, style: string): Promise<string> => {
    // Simple variations for now - could be enhanced with more AI calls
    const variations = {
      alternative: [
        originalLine.replace(/you/g, "we").replace(/your/g, "our"),
        originalLine.replace(/heart/g, "soul").replace(/love/g, "feel"),
        originalLine.replace(/night/g, "day").replace(/dark/g, "bright")
      ],
      creative: [
        `🎵 ${originalLine} 🎵`,
        originalLine + " (in harmony)",
        originalLine.split(" ").reverse().join(" ")
      ]
    };
    
    const styleVariations = variations[style as keyof typeof variations] || [originalLine];
    return styleVariations[Math.floor(Math.random() * styleVariations.length)];
  };

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (lyrics.trim() && lyrics.length > 10) {
        generateSuggestions(lyrics);
      }
    }, 1500); // Debounce for 1.5 seconds

    return () => clearTimeout(timeoutId);
  }, [lyrics, section]);

  const handleSelectSuggestion = (suggestion: LineSuggestion) => {
    onSelectSuggestion(suggestion.text);
    // Generate new suggestions after selection
    setTimeout(() => {
      generateSuggestions(lyrics + "\n" + suggestion.text, true);
    }, 500);
  };

  const refreshSuggestions = () => {
    generateSuggestions(lyrics, true);
  };

  const loadMoreSuggestions = async () => {
    setIsLoading(true);
    try {
      // Generate additional suggestions
      const moreSuggestions: LineSuggestion[] = [
        {
          text: "Dancing through the neon lights tonight",
          confidence: 0.75,
          style: "Energetic"
        },
        {
          text: "Whispered secrets in the cyber glow",
          confidence: 0.72,
          style: "Mysterious"
        },
        {
          text: "Electric dreams and digital hearts",
          confidence: 0.78,
          style: "Futuristic"
        }
      ];
      
      setSuggestions(prev => [...prev, ...moreSuggestions]);
      setShowMore(true);
    } catch (error) {
      console.error("Error loading more suggestions:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!lyrics.trim() || lyrics.length < 10) {
    return (
      <Card className={`glass-effect border-neon-glow p-4 ${className}`} data-testid="ai-suggestions-empty">
        <div className="text-center">
          <WandSparkles className="h-8 w-8 text-neon-purple mx-auto mb-2 opacity-50" />
          <p className="text-sm text-neon-gold/70">
            Start writing lyrics to get AI suggestions for your next line...
          </p>
        </div>
      </Card>
    );
  }

  return (
    <Card className={`glass-effect border-neon-glow p-4 ${className}`} data-testid="ai-suggestions">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <WandSparkles className="h-4 w-4 text-neon-purple" />
          <h3 className="font-cyber text-sm text-neon-gold">AI Suggested Next Lines</h3>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={refreshSuggestions}
          disabled={isLoading}
          className="h-6 w-6 p-0 hover:bg-neon-purple/20"
          data-testid="refresh-suggestions"
        >
          <RefreshCw className={`h-3 w-3 text-neon-blue ${isLoading ? "animate-spin" : ""}`} />
        </Button>
      </div>

      {isLoading ? (
        <TypingIndicator text="AI is crafting your next line" />
      ) : suggestions.length > 0 ? (
        <div className="space-y-3">
          {suggestions.map((suggestion, index) => (
            <div
              key={index}
              className="group p-3 rounded-lg bg-cyber-purple/20 border border-neon-blue/20 hover:border-neon-purple/50 cursor-pointer transition-all duration-200"
              onClick={() => handleSelectSuggestion(suggestion)}
              data-testid={`suggestion-${index}`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="text-neon-gold font-mono text-sm leading-relaxed">
                    "{suggestion.text}"
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge
                      variant="outline"
                      className="border-neon-cyan text-neon-cyan bg-cyber-blue/20 text-xs"
                    >
                      {suggestion.style}
                    </Badge>
                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, i) => (
                        <div
                          key={i}
                          className={`w-1 h-1 rounded-full ${
                            i < suggestion.confidence * 5 
                              ? "bg-neon-blue" 
                              : "bg-muted"
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                </div>
                <Plus className="h-4 w-4 text-neon-purple opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </div>
          ))}
          
          {!showMore && (
            <Button
              variant="outline"
              onClick={loadMoreSuggestions}
              disabled={isLoading}
              className="w-full border-neon-blue/30 text-neon-blue hover:bg-neon-blue/10"
              data-testid="load-more-suggestions"
            >
              <Plus className="h-4 w-4 mr-2" />
              More AI Suggestions
            </Button>
          )}
        </div>
      ) : (
        <p className="text-sm text-neon-gold/70 text-center">
          No suggestions available. Try writing a few more lines...
        </p>
      )}
    </Card>
  );
}