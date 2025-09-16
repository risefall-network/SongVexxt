import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";

export default function Dictionary() {
  const [searchTerm, setSearchTerm] = useState("heart");

  const { data: synonyms = [] } = useQuery<string[]>({
    queryKey: ["/api/synonyms", searchTerm],
    enabled: !!searchTerm,
  });

  const { data: rhymes = [] } = useQuery<string[]>({
    queryKey: ["/api/rhymes", searchTerm],
    enabled: !!searchTerm,
  });

  // Fallback data for demo
  const fallbackSynonyms: string[] = ["soul", "core", "essence", "spirit"];
  const fallbackRhymes: string[] = ["start", "part", "art", "smart", "chart", "dart"];
  
  const displaySynonyms: string[] = (synonyms && synonyms.length > 0) ? synonyms : fallbackSynonyms;
  const displayRhymes: string[] = (rhymes && rhymes.length > 0) ? rhymes : fallbackRhymes;

  return (
    <div className="w-72 glass-effect border-l border-neon-blue/20 flex flex-col" data-testid="panel-dictionary">
      {/* Search */}
      <div className="p-4 border-b border-neon-blue/20">
        <div className="relative">
          <Input 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search dictionary..."
            className="w-full bg-cyber-purple/30 border-neon-blue/30 focus:border-neon-blue pl-10 pr-4 py-2 text-sm"
            data-testid="input-dictionary-search"
          />
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neon-gold/50 w-4 h-4" />
        </div>
      </div>

      {/* Dictionary Results */}
      <div className="flex-1 overflow-y-auto scrollbar-custom p-4">
        <h4 className="font-cyber text-sm text-neon-blue mb-3" data-testid="text-dictionary-title">
          Dictionary
        </h4>
        
        <div className="space-y-4">
          <div className="bg-cyber-purple/20 rounded-lg p-3">
            <div className="font-medium text-neon-cyan mb-1" data-testid="text-word-definition">
              {searchTerm}
            </div>
            <div className="text-xs text-neon-gold/70 mb-2">/hɑːrt/ • noun</div>
            <div className="text-sm text-neon-gold/80">
              The organ that pumps blood through the body; the center of emotions and feelings.
            </div>
          </div>
          
          <div className="bg-cyber-purple/20 rounded-lg p-3">
            <div className="font-medium text-neon-blue mb-2">Synonyms</div>
            <div className="flex flex-wrap gap-1">
              {displaySynonyms.slice(0, 6).map((synonym, index) => (
                <Button 
                  key={index}
                  className="cyber-button px-2 py-1 rounded text-xs"
                  data-testid={`button-synonym-${synonym}`}
                >
                  {synonym}
                </Button>
              ))}
            </div>
          </div>
          
          <div className="bg-cyber-purple/20 rounded-lg p-3">
            <div className="font-medium text-neon-purple mb-2">Rhymes</div>
            <div className="grid grid-cols-2 gap-1 text-xs">
              {displayRhymes.slice(0, 8).map((rhyme, index) => (
                <Button 
                  key={index}
                  className="cyber-button p-1 rounded text-left text-xs"
                  data-testid={`button-rhyme-${rhyme}`}
                >
                  {rhyme}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
