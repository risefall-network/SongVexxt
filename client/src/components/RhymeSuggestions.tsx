import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Lightbulb } from "lucide-react";

interface RhymeSuggestionsProps {
  words: {word: string, lineNumber: number}[];
  show: boolean;
  onSelect: (word: string) => void;
  onClose: () => void;
}

export default function RhymeSuggestions({ words, show, onSelect, onClose }: RhymeSuggestionsProps) {
  // Create queries for each word
  const rhymeQueries = words.map(({word}) => {
    const { data: rhymes = [], isLoading } = useQuery<string[]>({
      queryKey: ["/api/rhymes", word],
      enabled: !!word && show,
    });
    return { word, rhymes: rhymes as string[], isLoading };
  });

  if (!show || words.length === 0) {
    return null;
  }

  return (
    <div 
      className="absolute top-full left-0 mt-2 w-full glass-effect rounded-lg p-4 border border-neon-blue/30 animate-slide-up z-20"
      data-testid="panel-rhyme-suggestions"
    >
      {rhymeQueries.map(({word, rhymes, isLoading}, index) => {
        const fallbackRhymes = ["start", "part", "art", "smart", "chart", "dart"];
        const displayRhymes = rhymes.length > 0 ? rhymes : fallbackRhymes;
        
        return (
          <div key={word} className={index > 0 ? "mt-4 pt-4 border-t border-neon-blue/20" : ""}>
            <div className="text-xs text-neon-blue mb-2 font-cyber" data-testid={`text-rhyme-title-${word}`}>
              Rhymes for "{word}" (line {words[index].lineNumber + 1}):
            </div>
            
            {isLoading ? (
              <div className="text-sm text-gray-400">Loading rhymes...</div>
            ) : (
              <div className="flex flex-wrap gap-2">
                {displayRhymes.slice(0, 6).map((rhyme: string) => (
                  <Button 
                    key={`${word}-${rhyme}`}
                    onClick={() => onSelect(rhyme)}
                    className="cyber-button px-3 py-1 rounded text-sm hover:text-neon-cyan transition-colors"
                    data-testid={`button-rhyme-${rhyme}`}
                  >
                    {rhyme}
                  </Button>
                ))}
              </div>
            )}
          </div>
        );
      })}
      
      <div className="mt-3 text-xs text-gray-400 flex items-center" data-testid="text-rhyme-hint">
        <Lightbulb className="w-3 h-3 text-neon-blue mr-1" />
        Click any word to insert it into your text
      </div>
    </div>
  );
}
