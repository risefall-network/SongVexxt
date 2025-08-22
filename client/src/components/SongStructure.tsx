import { Button } from "@/components/ui/button";
import { ChevronRight, Star, Youtube } from "lucide-react";

interface SongStructureProps {
  currentSection: string;
  onSectionChange: (section: string) => void;
}

const songSections = [
  { name: "Verse 1", description: "Tell your story, set the scene" },
  { name: "Pre-Chorus", description: "Build tension, lead to chorus" },
  { name: "Chorus", description: "Your main hook, memorable part", featured: true },
  { name: "Verse 2", description: "Continue the story" },
  { name: "Bridge", description: "Different perspective/emotion" },
];

const tutorials = [
  { title: "How to Write a Killer Chorus", duration: "5:42", views: "2M" },
  { title: "Rhyme Schemes That Work", duration: "8:15", views: "1.5M" },
  { title: "Song Structure Masterclass", duration: "12:30", views: "987K" },
];

export default function SongStructure({ currentSection, onSectionChange }: SongStructureProps) {
  return (
    <div className="flex-1 overflow-y-auto scrollbar-custom">
      <div className="p-4">
        <h4 className="font-cyber text-sm text-neon-blue mb-3" data-testid="text-structure-title">
          Song Structure
        </h4>
        
        <div className="space-y-2 mb-6">
          {songSections.map((section) => (
            <Button
              key={section.name}
              onClick={() => onSectionChange(section.name)}
              className={`w-full cyber-button p-3 rounded-lg text-left hover:bg-cyber-purple-light/50 transition-colors ${
                currentSection === section.name ? 'bg-cyber-purple-light/30 border-neon-cyan' : ''
              } ${section.featured ? 'border-neon-cyan' : ''}`}
              data-testid={`button-section-${section.name.toLowerCase().replace(' ', '-')}`}
            >
              <div className="flex items-center justify-between">
                <span className={`text-sm font-medium ${
                  section.featured ? 'text-neon-cyan' : 'text-white'
                }`}>
                  {section.name}
                </span>
                {section.featured ? (
                  <Star className="w-4 h-4 text-neon-cyan" />
                ) : (
                  <ChevronRight className="w-4 h-4 text-neon-blue" />
                )}
              </div>
              <div className="text-xs text-gray-400 mt-1">{section.description}</div>
            </Button>
          ))}
        </div>

        {/* Learning Resources */}
        <h4 className="font-cyber text-sm text-neon-blue mb-3" data-testid="text-resources-title">
          Learn & Improve
        </h4>
        <div className="space-y-2">
          {tutorials.map((tutorial, index) => (
            <a 
              key={index}
              href="#" 
              className="block cyber-button p-3 rounded-lg hover:bg-cyber-purple-light/50 transition-colors"
              data-testid={`link-tutorial-${index}`}
            >
              <div className="flex items-center space-x-3">
                <Youtube className="w-5 h-5 text-red-400" />
                <div>
                  <div className="text-sm">{tutorial.title}</div>
                  <div className="text-xs text-gray-400">
                    {tutorial.duration} • {tutorial.views} views
                  </div>
                </div>
              </div>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
