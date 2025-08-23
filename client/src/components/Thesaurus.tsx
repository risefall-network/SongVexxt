import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Search, Star } from "lucide-react";

interface ThesaurusProps {
  className?: string;
}

interface Synonym {
  word: string;
  relevance: number;
  category: string;
}

export default function Thesaurus({ className = "" }: ThesaurusProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [synonyms, setSynonyms] = useState<Synonym[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedWord, setSelectedWord] = useState("");

  const searchSynonyms = async (word: string) => {
    if (!word.trim()) {
      setSynonyms([]);
      return;
    }

    setIsLoading(true);
    setSelectedWord(word);

    try {
      const response = await fetch(`/api/synonyms?word=${encodeURIComponent(word)}`);
      
      if (!response.ok) {
        throw new Error("Failed to fetch synonyms");
      }

      const data = await response.json();
      
      // Transform the response to our format
      const transformedSynonyms: Synonym[] = data.slice(0, 20).map((item: any, index: number) => ({
        word: item.word || item,
        relevance: Math.max(1, 5 - Math.floor(index / 4)),
        category: getCategoryForWord(item.word || item, word)
      }));

      setSynonyms(transformedSynonyms);
    } catch (error) {
      console.error("Error fetching synonyms:", error);
      // Fallback with some common synonyms
      const fallbackSynonyms = getFallbackSynonyms(word);
      setSynonyms(fallbackSynonyms);
    } finally {
      setIsLoading(false);
    }
  };

  const getCategoryForWord = (synonym: string, originalWord: string): string => {
    const categories = {
      emotion: ["happy", "sad", "love", "hate", "joy", "anger", "fear", "hope"],
      action: ["run", "walk", "dance", "sing", "jump", "fly", "move", "go"],
      descriptive: ["beautiful", "ugly", "big", "small", "bright", "dark", "fast", "slow"],
      time: ["night", "day", "morning", "evening", "forever", "never", "always", "sometimes"]
    };

    for (const [category, words] of Object.entries(categories)) {
      if (words.some(word => synonym.toLowerCase().includes(word) || originalWord.toLowerCase().includes(word))) {
        return category;
      }
    }
    return "general";
  };

  const getFallbackSynonyms = (word: string): Synonym[] => {
    const fallbacks: Record<string, string[]> = {
      love: ["adore", "cherish", "treasure", "devotion", "passion", "affection"],
      heart: ["soul", "spirit", "core", "essence", "center", "feelings"],
      beautiful: ["gorgeous", "stunning", "lovely", "pretty", "attractive", "radiant"],
      music: ["melody", "harmony", "rhythm", "song", "tune", "sound"],
      night: ["evening", "darkness", "twilight", "midnight", "dusk", "shadows"],
      light: ["bright", "glow", "shine", "radiance", "beam", "illumination"]
    };

    const wordLower = word.toLowerCase();
    const matches = fallbacks[wordLower] || ["similar", "related", "comparable", "equivalent"];
    
    return matches.map((synonym, index) => ({
      word: synonym,
      relevance: Math.max(1, 5 - index),
      category: getCategoryForWord(synonym, word)
    }));
  };

  useEffect(() => {
    if (searchTerm.trim()) {
      const timeoutId = setTimeout(() => {
        searchSynonyms(searchTerm);
      }, 500);
      return () => clearTimeout(timeoutId);
    } else {
      setSynonyms([]);
      setSelectedWord("");
    }
  }, [searchTerm]);

  const handleWordSelect = (word: string) => {
    // Copy to clipboard
    navigator.clipboard.writeText(word).then(() => {
      // Could show a toast or feedback here
    });
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      emotion: "border-neon-pink text-neon-pink bg-cyber-purple/20",
      action: "border-neon-blue text-neon-blue bg-cyber-blue/20", 
      descriptive: "border-neon-purple text-neon-purple bg-cyber-purple/20",
      time: "border-neon-cyan text-neon-cyan bg-cyber-blue/20",
      general: "border-neon-gold text-neon-gold bg-cyber-purple/20"
    };
    return colors[category] || colors.general;
  };

  return (
    <Card className={`glass-effect border-neon-glow p-4 h-full ${className}`} data-testid="thesaurus">
      <div className="flex items-center gap-2 mb-4">
        <BookOpen className="h-4 w-4 text-neon-purple" />
        <h3 className="font-cyber text-sm text-neon-gold">Thesaurus</h3>
      </div>

      <div className="space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-neon-blue/50" />
          <Input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Find synonyms..."
            className="pl-10 bg-cyber-purple/30 border-neon-blue/30 focus:border-neon-blue text-neon-gold placeholder-neon-gold/40"
            data-testid="input-thesaurus-search"
          />
        </div>

        {selectedWord && (
          <div className="text-center">
            <p className="text-xs text-neon-gold/70">Synonyms for:</p>
            <p className="font-cyber text-sm text-neon-cyan">"{selectedWord}"</p>
          </div>
        )}

        {isLoading ? (
          <div className="flex items-center justify-center py-6">
            <div className="w-6 h-6 border-2 border-neon-blue border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : synonyms.length > 0 ? (
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {synonyms.map((synonym, index) => (
              <div
                key={index}
                className="group p-2 rounded-lg bg-cyber-purple/20 border border-neon-blue/20 hover:border-neon-purple/50 cursor-pointer transition-all duration-200"
                onClick={() => handleWordSelect(synonym.word)}
                data-testid={`synonym-${index}`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-neon-gold font-mono text-sm">
                      {synonym.word}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge
                        variant="outline"
                        className={`text-xs ${getCategoryColor(synonym.category)}`}
                      >
                        {synonym.category}
                      </Badge>
                      <div className="flex items-center gap-1">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-2 h-2 ${
                              i < synonym.relevance 
                                ? "text-neon-blue fill-neon-blue" 
                                : "text-muted"
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : searchTerm ? (
          <div className="text-center py-6">
            <BookOpen className="h-8 w-8 text-neon-purple/50 mx-auto mb-2" />
            <p className="text-xs text-neon-gold/70">
              No synonyms found for "{searchTerm}"
            </p>
          </div>
        ) : (
          <div className="text-center py-6">
            <Search className="h-8 w-8 text-neon-purple/50 mx-auto mb-2" />
            <p className="text-xs text-neon-gold/70">
              Enter a word to find synonyms and alternatives
            </p>
          </div>
        )}
      </div>
    </Card>
  );
}