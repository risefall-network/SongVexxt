import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { WandSparkles, Book } from "lucide-react";
import RhymeSuggestions from "./RhymeSuggestions";
import { extractLastWord } from "../../../server/services/rhymeService";

export default function OverlayMode() {
  const [textContent, setTextContent] = useState("I love you with all my heart");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [lastWord, setLastWord] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    const text = textContent.toLowerCase();
    clearTimeout(timeoutRef.current);
    
    if (text.includes('heart')) {
      timeoutRef.current = setTimeout(() => {
        setLastWord("heart");
        setShowSuggestions(true);
      }, 500);
    } else {
      setShowSuggestions(false);
    }
  }, [textContent]);

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setTextContent(e.target.value);
  };

  const handleRhymeSelect = (word: string) => {
    setTextContent(prev => prev + '\nIt was meant to be a new ' + word);
    setShowSuggestions(false);
  };

  return (
    <div className="relative h-full" data-testid="overlay-mode">
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl px-4">
        <div className="glass-effect rounded-xl p-6 neon-border">
          <h3 className="font-cyber text-lg mb-4 text-neon-blue" data-testid="text-overlay-title">
            Write in any text field - SongVexxt will help!
          </h3>
          
          <div className="relative">
            <textarea 
              ref={textareaRef}
              value={textContent}
              onChange={handleTextChange}
              placeholder="Start writing your lyrics here... Type 'heart' to see rhyme suggestions appear!"
              className="w-full h-32 bg-cyber-purple/30 border border-neon-blue/30 rounded-lg p-4 text-white placeholder-gray-400 focus:border-neon-blue focus:outline-none font-mono resize-none"
              data-testid="textarea-lyrics"
            />
            
            <RhymeSuggestions 
              word={lastWord}
              show={showSuggestions}
              onSelect={handleRhymeSelect}
              onClose={() => setShowSuggestions(false)}
            />
          </div>
          
          <div className="flex items-center justify-between mt-4">
            <div className="flex space-x-2">
              <Button 
                className="cyber-button px-3 py-1 rounded text-xs"
                data-testid="button-ai-assist"
              >
                <WandSparkles className="w-3 h-3 mr-1" />
                AI Assist
              </Button>
              <Button 
                className="cyber-button px-3 py-1 rounded text-xs"
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
    </div>
  );
}
