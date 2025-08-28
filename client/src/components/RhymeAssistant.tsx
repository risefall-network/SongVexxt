import { useState, useEffect, useRef } from "react";
import { useQueries } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Lightbulb, X, ChevronDown, ChevronUp } from "lucide-react";

interface RhymeAssistantProps {
  lyrics: string;
  onSelectWord: (word: string) => void;
}

export default function RhymeAssistant({ lyrics, onSelectWord }: RhymeAssistantProps) {
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [rhymeWords, setRhymeWords] = useState<{word: string, lineNumber: number}[]>([]);
  const [dismissedWords, setDismissedWords] = useState<Set<string>>(new Set());
  const [minimized, setMinimized] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout>();

  // Helper function to extract the last word from a line
  const extractLastWord = (text: string): string => {
    const words = text.trim().split(/\s+/);
    if (words.length === 0) return "";
    
    // Remove punctuation from the last word
    const lastWord = words[words.length - 1].replace(/[.,!?;:'"()]/g, "");
    return lastWord.toLowerCase();
  };

  // Helper function to get rhyme words from previous lines
  const getPreviousLineWords = (text: string): {word: string, lineNumber: number}[] => {
    const lines = text.split('\n').filter(line => line.trim().length > 0);
    const rhymeWords: {word: string, lineNumber: number}[] = [];
    
    // Get last words from previous lines for rhyme matching
    if (lines.length >= 2) {
      const prevLineWord = extractLastWord(lines[lines.length - 2]);
      if (prevLineWord && prevLineWord.length > 2) {
        rhymeWords.push({word: prevLineWord, lineNumber: lines.length - 2});
      }
    }
    
    // Get word from 2 lines back for ABAB schemes
    if (lines.length >= 3) {
      const prevPrevLineWord = extractLastWord(lines[lines.length - 3]);
      if (prevPrevLineWord && prevPrevLineWord.length > 2) {
        rhymeWords.push({word: prevPrevLineWord, lineNumber: lines.length - 3});
      }
    }
    
    return rhymeWords;
  };

  // Create queries for each word using useQueries
  const rhymeQueries = useQueries({
    queries: rhymeWords.map(({word}) => ({
      queryKey: ["/api/rhymes", word],
      enabled: !!word && showSuggestions && rhymeWords.length > 0,
    }))
  });

  const rhymeData = rhymeWords.map(({word}, index) => ({
    word,
    rhymes: (rhymeQueries[index]?.data || []) as string[],
    isLoading: rhymeQueries[index]?.isLoading || false
  }));

  useEffect(() => {
    const text = lyrics.trim();
    clearTimeout(timeoutRef.current);
    
    if (text.length > 10) { // Only show suggestions if there's enough content
      const previousWords = getPreviousLineWords(text);
      
      if (previousWords.length > 0) {
        // Filter out dismissed words
        const filteredWords = previousWords.filter(({word}) => !dismissedWords.has(word));
        
        if (filteredWords.length > 0) {
          timeoutRef.current = setTimeout(() => {
            setRhymeWords(filteredWords);
            setShowSuggestions(true);
          }, 1000);
        } else {
          setShowSuggestions(false);
        }
      } else {
        setShowSuggestions(false);
      }
    } else {
      setShowSuggestions(false);
    }
    
    return () => clearTimeout(timeoutRef.current);
  }, [lyrics, dismissedWords]);

  const handleRhymeSelect = (word: string) => {
    onSelectWord(word);
    setShowSuggestions(false);
    setDismissedWords(new Set()); // Reset dismissed words after selection
  };

  const handleCloseWord = (wordToClose: string) => {
    setDismissedWords(prev => new Set(Array.from(prev).concat(wordToClose)));
    setRhymeWords(prev => prev.filter(({word}) => word !== wordToClose));
  };

  const handleCloseAllSuggestions = () => {
    setShowSuggestions(false);
    setDismissedWords(new Set());
  };

  if (!showSuggestions || rhymeWords.length === 0) {
    return null;
  }

  // Minimized view
  if (minimized) {
    return (
      <div className="glass-effect rounded-lg p-3 border border-neon-blue/30 mb-4">
        <div className="flex items-center justify-between">
          <div className="text-sm text-neon-blue font-cyber">
            Rhyme suggestions available
          </div>
          <div className="flex space-x-2">
            <Button
              onClick={() => setMinimized(false)}
              className="cyber-button p-1 rounded text-xs"
              data-testid="button-expand-rhymes"
            >
              <ChevronDown className="w-4 h-4" />
            </Button>
            <Button
              onClick={handleCloseAllSuggestions}
              className="cyber-button p-1 rounded text-xs"
              data-testid="button-close-rhymes"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="glass-effect rounded-lg p-4 border border-neon-blue/30 mb-4" data-testid="panel-rhyme-assistant">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <Lightbulb className="w-4 h-4 text-neon-blue" />
          <h4 className="font-cyber text-sm text-neon-blue">Rhyme Suggestions</h4>
        </div>
        <div className="flex space-x-2">
          <Button
            onClick={() => setMinimized(true)}
            className="cyber-button p-1 rounded text-xs"
            data-testid="button-minimize-rhymes"
          >
            <ChevronUp className="w-4 h-4" />
          </Button>
          <Button
            onClick={handleCloseAllSuggestions}
            className="cyber-button p-1 rounded text-xs"
            data-testid="button-close-rhymes"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <div className="space-y-3">
        {rhymeData.map(({word, rhymes, isLoading}, wordIndex) => (
          <div key={`${word}-${wordIndex}`} className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="text-xs text-neon-gold">
                Rhymes with "<span className="text-neon-cyan">{word}</span>":
              </div>
              <Button
                onClick={() => handleCloseWord(word)}
                className="cyber-button p-1 rounded text-xs"
                data-testid={`button-close-word-${word}`}
              >
                <X className="w-3 h-3" />
              </Button>
            </div>
            
            {isLoading ? (
              <div className="text-xs text-neon-gold/50">Loading rhymes...</div>
            ) : (
              <div className="flex flex-wrap gap-1">
                {rhymes.slice(0, 8).map((rhyme, rhymeIndex) => (
                  <Button
                    key={`${rhyme}-${rhymeIndex}`}
                    onClick={() => handleRhymeSelect(rhyme)}
                    className="cyber-button px-2 py-1 rounded text-xs hover:bg-neon-blue/20"
                    data-testid={`button-rhyme-${rhyme}`}
                  >
                    {rhyme}
                  </Button>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}