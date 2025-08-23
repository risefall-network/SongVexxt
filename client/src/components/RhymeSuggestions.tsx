import { useQueries } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Lightbulb, X, ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";

interface RhymeSuggestionsProps {
  words: {word: string, lineNumber: number}[];
  show: boolean;
  onSelect: (word: string) => void;
  onClose: () => void;
  onCloseWord: (word: string) => void;
}

export default function RhymeSuggestions({ words, show, onSelect, onClose, onCloseWord }: RhymeSuggestionsProps) {
  const [expandedWords, setExpandedWords] = useState<{[key: string]: boolean}>({});
  const [minimized, setMinimized] = useState(false);
  // Create queries for each word using useQueries
  const rhymeQueries = useQueries({
    queries: words.map(({word}) => ({
      queryKey: ["/api/rhymes", word],
      enabled: !!word && show,
    }))
  });

  const rhymeData = words.map(({word}, index) => ({
    word,
    rhymes: (rhymeQueries[index]?.data || []) as string[],
    isLoading: rhymeQueries[index]?.isLoading || false
  }));

  if (!show || words.length === 0) {
    return null;
  }

  // Minimized view when there are multiple words or when minimized is true
  if ((words.length > 1 && minimized) || minimized) {
    return (
      <div 
        className="absolute top-full left-0 mt-2 glass-effect rounded-lg p-2 border border-neon-blue/30 animate-slide-up z-20"
        data-testid="panel-rhyme-suggestions-minimized"
      >
        <div className="flex items-center justify-between">
          <div className="text-xs text-neon-blue font-cyber">
            {words.length} rhyme suggestion{words.length > 1 ? 's' : ''} available
          </div>
          <div className="flex space-x-1">
            <Button
              onClick={() => setMinimized(false)}
              className="cyber-button p-1 rounded text-xs"
              data-testid="button-expand-suggestions"
            >
              <ChevronDown className="w-3 h-3" />
            </Button>
            <Button
              onClick={onClose}
              className="cyber-button p-1 rounded text-xs"
              data-testid="button-close-all-suggestions"
            >
              <X className="w-3 h-3" />
            </Button>
          </div>
        </div>
        <div className="flex flex-wrap gap-1 mt-2">
          {words.map(({word}) => (
            <Button
              key={word}
              onClick={() => setMinimized(false)}
              className="cyber-button px-2 py-1 rounded text-xs"
              data-testid={`button-word-${word}`}
            >
              {word}
            </Button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div 
      className="absolute top-full left-0 mt-2 w-full glass-effect rounded-lg p-4 border border-neon-blue/30 animate-slide-up z-20 max-h-96 overflow-y-auto"
      data-testid="panel-rhyme-suggestions"
    >
      <div className="flex items-center justify-between mb-2">
        <div className="text-xs text-neon-blue font-cyber">
          Rhyme Suggestions
        </div>
        <div className="flex space-x-1">
          {words.length > 1 && (
            <Button
              onClick={() => setMinimized(true)}
              className="cyber-button p-1 rounded text-xs"
              data-testid="button-minimize-suggestions"
            >
              <ChevronUp className="w-3 h-3" />
            </Button>
          )}
          <Button
            onClick={onClose}
            className="cyber-button p-1 rounded text-xs"
            data-testid="button-close-all-suggestions"
          >
            <X className="w-3 h-3" />
          </Button>
        </div>
      </div>
      
      {rhymeData.map(({word, rhymes, isLoading}, index) => {
        const fallbackRhymes = ["start", "part", "art", "smart", "chart", "dart"];
        const displayRhymes = rhymes.length > 0 ? rhymes : fallbackRhymes;
        
        return (
          <div key={word} className={index > 0 ? "mt-4 pt-4 border-t border-neon-blue/20" : ""}>
            <div className="flex items-center justify-between mb-2">
              <div className="text-xs text-neon-blue font-cyber" data-testid={`text-rhyme-title-${word}`}>
                Rhymes for "{word}" (line {words[index].lineNumber + 1}):
              </div>
              <Button
                onClick={() => onCloseWord(word)}
                className="cyber-button p-1 rounded text-xs"
                data-testid={`button-close-${word}`}
              >
                <X className="w-3 h-3" />
              </Button>
            </div>
            
            {isLoading ? (
              <div className="text-sm text-gray-400">Loading rhymes...</div>
            ) : (
              <>
                <div className="flex flex-wrap gap-2">
                  {displayRhymes.slice(0, expandedWords[word] ? 20 : 8).map((rhyme: string) => (
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
                {displayRhymes.length > 8 && (
                  <Button
                    onClick={() => setExpandedWords(prev => ({...prev, [word]: !prev[word]}))}
                    className="mt-2 cyber-button px-2 py-1 rounded text-xs"
                    data-testid={`button-expand-${word}`}
                  >
                    {expandedWords[word] ? (
                      <><ChevronUp className="w-3 h-3 mr-1" />Show Less</>
                    ) : (
                      <><ChevronDown className="w-3 h-3 mr-1" />Show More ({displayRhymes.length - 8} more)</>
                    )}
                  </Button>
                )}
              </>
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
