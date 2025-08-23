import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Sparkles, RefreshCw } from "lucide-react";

interface AIGenreSuggestionProps {
  lyrics: string;
  className?: string;
}

interface GenreSuggestion {
  genre: string;
  confidence: number;
  reason: string;
}

export default function AIGenreSuggestion({ lyrics, className = "" }: AIGenreSuggestionProps) {
  const [suggestions, setSuggestions] = useState<GenreSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [lastAnalyzedLyrics, setLastAnalyzedLyrics] = useState("");

  const analyzeGenre = async (lyricsText: string) => {
    if (!lyricsText.trim() || lyricsText === lastAnalyzedLyrics) return;
    
    setIsLoading(true);
    setLastAnalyzedLyrics(lyricsText);

    try {
      const response = await fetch("/api/ai/analyze-genre", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ lyrics: lyricsText }),
      });

      if (!response.ok) {
        throw new Error("Failed to analyze genre");
      }

      const data = await response.json();
      setSuggestions(data.suggestions || []);
    } catch (error) {
      console.error("Error analyzing genre:", error);
      // Fallback suggestions based on simple keyword analysis
      setSuggestions(getFallbackSuggestions(lyricsText));
    } finally {
      setIsLoading(false);
    }
  };

  // Fallback function for when AI service is unavailable
  const getFallbackSuggestions = (text: string): GenreSuggestion[] => {
    const lowerText = text.toLowerCase();
    const suggestions: GenreSuggestion[] = [];

    const genrePatterns = [
      {
        genre: "Pop",
        keywords: ["love", "heart", "baby", "tonight", "dance", "party"],
        reason: "Contains common pop themes and accessible language"
      },
      {
        genre: "Rock",
        keywords: ["power", "strong", "fight", "fire", "rock", "roll", "wild"],
        reason: "Features energetic and rebellious themes"
      },
      {
        genre: "Hip-Hop",
        keywords: ["money", "street", "real", "hustle", "grind", "flow"],
        reason: "Incorporates urban themes and rhythmic patterns"
      },
      {
        genre: "Country",
        keywords: ["home", "road", "truck", "beer", "small", "town", "farm"],
        reason: "Contains rural and traditional American themes"
      },
      {
        genre: "R&B",
        keywords: ["soul", "feeling", "smooth", "groove", "sweet", "honey"],
        reason: "Features soulful and romantic expressions"
      },
      {
        genre: "Electronic",
        keywords: ["beat", "pulse", "digital", "neon", "cyber", "future"],
        reason: "Contains futuristic and technological references"
      }
    ];

    genrePatterns.forEach(pattern => {
      const matches = pattern.keywords.filter(keyword => 
        lowerText.includes(keyword)
      ).length;
      
      if (matches > 0) {
        suggestions.push({
          genre: pattern.genre,
          confidence: Math.min(matches * 0.2 + 0.3, 0.9),
          reason: pattern.reason
        });
      }
    });

    return suggestions.sort((a, b) => b.confidence - a.confidence).slice(0, 3);
  };

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (lyrics.trim() && lyrics.length > 20) {
        analyzeGenre(lyrics);
      }
    }, 1000); // Debounce for 1 second

    return () => clearTimeout(timeoutId);
  }, [lyrics]);

  const refreshAnalysis = () => {
    setLastAnalyzedLyrics("");
    analyzeGenre(lyrics);
  };

  if (!lyrics.trim() || lyrics.length < 20) {
    return null;
  }

  return (
    <Card className={`glass-effect border-neon-glow p-4 ${className}`} data-testid="genre-suggestion">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-neon-purple" />
          <h3 className="font-cyber text-sm text-neon-gold">AI Genre Suggestions</h3>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={refreshAnalysis}
          disabled={isLoading}
          className="h-6 w-6 p-0 hover:bg-neon-purple/20"
          data-testid="refresh-genre"
        >
          <RefreshCw className={`h-3 w-3 text-neon-blue ${isLoading ? "animate-spin" : ""}`} />
        </Button>
      </div>

      {isLoading ? (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <div className="w-2 h-2 bg-neon-blue rounded-full animate-pulse"></div>
          <span>Analyzing lyrics...</span>
        </div>
      ) : suggestions.length > 0 ? (
        <div className="space-y-2">
          {suggestions.map((suggestion, index) => (
            <div key={index} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Badge
                  variant="outline"
                  className="border-neon-pink text-neon-gold bg-cyber-purple/30"
                  data-testid={`genre-badge-${suggestion.genre.toLowerCase()}`}
                >
                  {suggestion.genre}
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
          ))}
          {suggestions[0] && (
            <p className="text-xs text-muted-foreground mt-2 italic">
              {suggestions[0].reason}
            </p>
          )}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">
          Keep writing to get genre suggestions...
        </p>
      )}
    </Card>
  );
}