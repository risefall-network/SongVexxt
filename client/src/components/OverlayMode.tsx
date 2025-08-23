import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { WandSparkles, Book, X } from "lucide-react";
import RhymeSuggestions from "./RhymeSuggestions";
import Dictionary from "./Dictionary";
import AIAssistant from "./AIAssistant";

export default function OverlayMode() {
  const [textContent, setTextContent] = useState("I love you with all my heart");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [rhymeWords, setRhymeWords] = useState<{word: string, lineNumber: number}[]>([]);
  const [currentSection, setCurrentSection] = useState("Verse 1");
  const [showDictionary, setShowDictionary] = useState(false);
  const [showAIAssistant, setShowAIAssistant] = useState(false);
  const [dismissedWords, setDismissedWords] = useState<Set<string>>(new Set());
  const textareaRef = useRef<HTMLTextAreaElement>(null);
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
    const lines = text.split('\n');
    const currentLineIndex = lines.length - 1;
    const rhymeWords: {word: string, lineNumber: number}[] = [];
    
    // Get last word from previous line (line before current)
    if (currentLineIndex >= 1) {
      const prevLineWord = extractLastWord(lines[currentLineIndex - 1]);
      if (prevLineWord && prevLineWord.length > 2) {
        rhymeWords.push({word: prevLineWord, lineNumber: currentLineIndex - 1});
      }
    }
    
    // Get last word from line before that (two lines back)
    if (currentLineIndex >= 2) {
      const prevPrevLineWord = extractLastWord(lines[currentLineIndex - 2]);
      if (prevPrevLineWord && prevPrevLineWord.length > 2) {
        rhymeWords.push({word: prevPrevLineWord, lineNumber: currentLineIndex - 2});
      }
    }
    
    return rhymeWords;
  };

  useEffect(() => {
    const text = textContent.trim();
    clearTimeout(timeoutRef.current);
    
    if (text.length > 0) {
      const previousWords = getPreviousLineWords(text);
      
      if (previousWords.length > 0) {
        // Filter out dismissed words
        const filteredWords = previousWords.filter(({word}) => !dismissedWords.has(word));
        
        if (filteredWords.length > 0) {
          timeoutRef.current = setTimeout(() => {
            setRhymeWords(filteredWords);
            setShowSuggestions(true);
          }, 500);
        } else {
          setShowSuggestions(false);
        }
      } else {
        setShowSuggestions(false);
      }
    } else {
      setShowSuggestions(false);
    }
  }, [textContent]);

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setTextContent(e.target.value);
  };

  const handleRhymeSelect = (word: string) => {
    setTextContent(prev => {
      const lines = prev.split('\n');
      if (lines.length === 0) {
        return word;
      }
      
      const lastLineIndex = lines.length - 1;
      const lastLine = lines[lastLineIndex];
      const words = lastLine.trim().split(/\s+/);
      
      if (words.length === 0) {
        lines[lastLineIndex] = word;
      } else {
        // Replace the last word of the last line
        words[words.length - 1] = word;
        lines[lastLineIndex] = words.join(' ');
      }
      
      return lines.join('\n');
    });
    // Don't close suggestions automatically - let user choose
  };

  const handleCloseWord = (wordToClose: string) => {
    setDismissedWords(prev => new Set(Array.from(prev).concat(wordToClose)));
    setRhymeWords(prev => prev.filter(({word}) => word !== wordToClose));
  };

  const handleCloseAllSuggestions = () => {
    setShowSuggestions(false);
    setDismissedWords(new Set());
  };

  return (
    <div className="relative h-full" data-testid="overlay-mode">
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl px-4">
        <div className="glass-effect rounded-xl p-6 neon-border">
          <div className="mb-4">
            <h3 className="font-cyber text-lg text-neon-blue" data-testid="text-overlay-title">
              Write in any text field - SongVexxt will help!
            </h3>
            <div className="text-sm text-gray-400 mt-1" data-testid="text-current-section">
              Currently writing: <span className="text-neon-cyan">{currentSection}</span>
            </div>
          </div>
          
          <div className="relative">
            <textarea 
              ref={textareaRef}
              value={textContent}
              onChange={handleTextChange}
              placeholder="Start writing your lyrics here... Rhyme suggestions will appear as you type!"
              className="w-full h-32 bg-cyber-purple/30 border border-neon-blue/30 rounded-lg p-4 text-white placeholder-gray-400 focus:border-neon-blue focus:outline-none font-mono resize-none"
              data-testid="textarea-lyrics"
            />
            
            <RhymeSuggestions 
              words={rhymeWords}
              show={showSuggestions}
              onSelect={handleRhymeSelect}
              onClose={handleCloseAllSuggestions}
              onCloseWord={handleCloseWord}
            />
          </div>
          
          <div className="flex items-center justify-between mt-4">
            <div className="flex space-x-2">
              <Button 
                onClick={() => setShowAIAssistant(!showAIAssistant)}
                className={`cyber-button px-3 py-1 rounded text-xs ${showAIAssistant ? 'bg-neon-purple/30 border-neon-purple' : ''}`}
                data-testid="button-ai-assist"
              >
                <WandSparkles className="w-3 h-3 mr-1" />
                AI Assist
              </Button>
              <Button 
                onClick={() => setShowDictionary(!showDictionary)}
                className={`cyber-button px-3 py-1 rounded text-xs ${showDictionary ? 'bg-neon-blue/30 border-neon-blue' : ''}`}
                data-testid="button-dictionary"
              >
                <Book className="w-3 h-3 mr-1" />
                Dictionary
              </Button>
            </div>
            <div className="text-xs text-gray-400" data-testid="text-status">
              SongVexxt is watching for rhyme opportunities...
            </div>
          </div>
        </div>
      </div>

      {/* Floating Status Indicator */}
      <div className="fixed bottom-6 right-6 glass-effect rounded-full p-3 neon-border" data-testid="indicator-status">
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-neon-blue rounded-full animate-pulse" />
          <span className="text-xs font-cyber">Active</span>
        </div>
      </div>

      {/* AI Assistant Panel */}
      {showAIAssistant && (
        <div className="fixed top-4 right-4 z-30">
          <div className="relative">
            <Button
              onClick={() => setShowAIAssistant(false)}
              className="absolute -top-2 -right-2 cyber-button p-1 rounded-full z-40"
              data-testid="button-close-ai"
            >
              <X className="w-4 h-4" />
            </Button>
            <AIAssistant lyrics={textContent} section={currentSection} />
          </div>
        </div>
      )}

      {/* Dictionary Panel */}
      {showDictionary && (
        <div className="fixed top-4 left-4 z-30">
          <div className="relative">
            <Button
              onClick={() => setShowDictionary(false)}
              className="absolute -top-2 -right-2 cyber-button p-1 rounded-full z-40"
              data-testid="button-close-dictionary"
            >
              <X className="w-4 h-4" />
            </Button>
            <Dictionary />
          </div>
        </div>
      )}
    </div>
  );
}
