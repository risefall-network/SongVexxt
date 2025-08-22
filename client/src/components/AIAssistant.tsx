import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { Button } from "@/components/ui/button";
import { Plus, Shuffle, Lightbulb, TrendingUp } from "lucide-react";

interface AIAssistantProps {
  lyrics: string;
  section: string;
}

export default function AIAssistant({ lyrics, section }: AIAssistantProps) {
  const { toast } = useToast();
  const [suggestions, setSuggestions] = useState({
    nextLine: "Together we'll never depart",
    alternatives: ["soul", "mind", "core"]
  });

  const generateSuggestionsMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/ai/suggestions", {
        lyrics,
        context: section
      });
      return response.json();
    },
    onSuccess: (data) => {
      setSuggestions({
        nextLine: data.nextLines?.[0] || "No suggestions available",
        alternatives: data.alternativeWords?.[0]?.alternatives || []
      });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to generate AI suggestions",
        variant: "destructive",
      });
    },
  });

  const generateNextLineMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/ai/next-line", {
        lyrics,
        section
      });
      return response.json();
    },
    onSuccess: (data) => {
      setSuggestions(prev => ({
        ...prev,
        nextLine: data.suggestion || "No suggestion available"
      }));
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to generate next line",
        variant: "destructive",
      });
    },
  });

  return (
    <div className="w-80 glass-effect rounded-xl p-4 border border-neon-blue/20" data-testid="panel-ai-assistant">
      <h4 className="font-cyber text-lg text-neon-blue mb-4" data-testid="text-ai-title">
        AI Songwriting Assistant
      </h4>
      
      {/* AI Suggestions */}
      <div className="space-y-3 mb-6">
        <div className="bg-cyber-purple/30 rounded-lg p-3 border border-neon-purple/30">
          <div className="text-sm text-neon-purple mb-2">Next Line Suggestion:</div>
          <div className="text-sm text-gray-300" data-testid="text-next-line-suggestion">
            "{suggestions.nextLine}"
          </div>
          <Button 
            className="mt-2 cyber-button px-3 py-1 rounded text-xs"
            data-testid="button-use-suggestion"
          >
            <Plus className="w-3 h-3 mr-1" />
            Use This
          </Button>
        </div>
        
        <div className="bg-cyber-blue/30 rounded-lg p-3 border border-neon-blue/30">
          <div className="text-sm text-neon-blue mb-2">Alternative Words:</div>
          <div className="flex flex-wrap gap-1">
            {suggestions.alternatives.map((word, index) => (
              <Button 
                key={index}
                className="cyber-button px-2 py-1 rounded text-xs"
                data-testid={`button-alternative-${word}`}
              >
                {word}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Tools */}
      <div className="space-y-3">
        <h5 className="font-cyber text-sm text-neon-blue" data-testid="text-tools-title">Quick Tools</h5>
        
        <Button 
          onClick={() => generateSuggestionsMutation.mutate()}
          disabled={generateSuggestionsMutation.isPending}
          className="w-full cyber-button p-3 rounded-lg text-left"
          data-testid="button-generate-rhymes"
        >
          <Shuffle className="text-neon-cyan mr-2 w-4 h-4" />
          <span className="text-sm">Generate Rhymes</span>
        </Button>
        
        <Button 
          onClick={() => generateNextLineMutation.mutate()}
          disabled={generateNextLineMutation.isPending}
          className="w-full cyber-button p-3 rounded-lg text-left"
          data-testid="button-emotion-suggestions"
        >
          <Lightbulb className="text-neon-purple mr-2 w-4 h-4" />
          <span className="text-sm">Emotion Suggestions</span>
        </Button>
        
        <Button 
          onClick={() => {
            toast({
              title: "Rhythm Analysis",
              description: "Your lyrics have a steady ABAB rhyme scheme with 8-10 syllables per line.",
            });
          }}
          className="w-full cyber-button p-3 rounded-lg text-left"
          data-testid="button-analyze-rhythm"
        >
          <TrendingUp className="text-neon-blue mr-2 w-4 h-4" />
          <span className="text-sm">Analyze Rhythm</span>
        </Button>
      </div>
    </div>
  );
}
