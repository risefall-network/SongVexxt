import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Lightbulb } from "lucide-react";

interface RhymeSuggestionsProps {
  word: string;
  show: boolean;
  onSelect: (word: string) => void;
  onClose: () => void;
}

export default function RhymeSuggestions({ word, show, onSelect, onClose }: RhymeSuggestionsProps) {
  const { data: rhymes = [], isLoading } = useQuery({
    queryKey: ["/api/rhymes", word],
    enabled: !!word && show,
  });

  if (!show) {
    return null;
  }

  // Fallback rhymes for demo
  const fallbackRhymes = ["start", "part", "art", "smart", "chart", "dart"];
  const displayRhymes = rhymes.length > 0 ? rhymes : fallbackRhymes;

  return (
    <div 
      className="absolute top-full left-0 mt-2 w-full glass-effect rounded-lg p-4 border border-neon-blue/30 animate-slide-up z-20"
      data-testid="panel-rhyme-suggestions"
    >
      <div className="text-xs text-neon-blue mb-2 font-cyber" data-testid="text-rhyme-title">
        Rhymes for "{word}":
      </div>
      
      {isLoading ? (
        <div className="text-sm text-gray-400">Loading rhymes...</div>
      ) : (
        <div className="flex flex-wrap gap-2">
          {displayRhymes.slice(0, 8).map((rhyme) => (
            <Button 
              key={rhyme}
              onClick={() => onSelect(rhyme)}
              className="cyber-button px-3 py-1 rounded text-sm hover:text-neon-cyan transition-colors"
              data-testid={`button-rhyme-${rhyme}`}
            >
              {rhyme}
            </Button>
          ))}
        </div>
      )}
      
      <div className="mt-3 text-xs text-gray-400 flex items-center" data-testid="text-rhyme-hint">
        <Lightbulb className="w-3 h-3 text-neon-blue mr-1" />
        Click any word to insert it into your text
      </div>
    </div>
  );
}
