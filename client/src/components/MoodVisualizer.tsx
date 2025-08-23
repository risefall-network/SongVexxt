import { useState, useEffect } from "react";

interface MoodVisualizerProps {
  lyrics: string;
  className?: string;
}

interface Mood {
  name: string;
  colors: string[];
  intensity: number;
}

export default function MoodVisualizer({ lyrics, className = "" }: MoodVisualizerProps) {
  const [currentMood, setCurrentMood] = useState<Mood>({
    name: "neutral",
    colors: ["hsl(240, 100%, 2%)", "hsl(280, 100%, 8%)"],
    intensity: 0.3
  });

  // Analyze lyrics to determine mood
  const analyzeMood = (text: string): Mood => {
    const words = text.toLowerCase().split(/\s+/);
    
    // Define mood keywords and their associated colors
    const moodPatterns = {
      love: {
        keywords: ["love", "heart", "kiss", "forever", "together", "romance", "passion", "adore"],
        colors: ["hsl(320, 100%, 15%)", "hsl(340, 80%, 25%)", "hsl(0, 70%, 35%)"],
        intensity: 0.6
      },
      sad: {
        keywords: ["sad", "cry", "tears", "lonely", "broken", "hurt", "pain", "empty", "lost"],
        colors: ["hsl(220, 80%, 8%)", "hsl(240, 100%, 15%)", "hsl(260, 70%, 20%)"],
        intensity: 0.4
      },
      angry: {
        keywords: ["angry", "mad", "rage", "hate", "fight", "war", "fire", "burn", "destroy"],
        colors: ["hsl(0, 100%, 15%)", "hsl(15, 90%, 25%)", "hsl(30, 80%, 35%)"],
        intensity: 0.8
      },
      happy: {
        keywords: ["happy", "joy", "smile", "laugh", "dance", "party", "celebrate", "bright", "shine"],
        colors: ["hsl(45, 100%, 25%)", "hsl(60, 90%, 35%)", "hsl(195, 80%, 45%)"],
        intensity: 0.7
      },
      energetic: {
        keywords: ["energy", "power", "strong", "fast", "run", "jump", "electric", "thunder", "lightning"],
        colors: ["hsl(280, 100%, 20%)", "hsl(320, 100%, 30%)", "hsl(195, 100%, 40%)"],
        intensity: 0.9
      },
      peaceful: {
        keywords: ["peace", "calm", "quiet", "soft", "gentle", "rest", "sleep", "dream", "serene"],
        colors: ["hsl(200, 80%, 15%)", "hsl(180, 70%, 25%)", "hsl(160, 60%, 35%)"],
        intensity: 0.3
      },
      dark: {
        keywords: ["dark", "shadow", "night", "black", "death", "evil", "demon", "hell", "devil"],
        colors: ["hsl(240, 100%, 5%)", "hsl(280, 90%, 10%)", "hsl(320, 80%, 15%)"],
        intensity: 0.5
      }
    };

    let strongestMood = "neutral";
    let maxScore = 0;
    let maxIntensity = 0.3;
    let maxColors = ["hsl(240, 100%, 2%)", "hsl(280, 100%, 8%)"];

    // Score each mood based on keyword matches
    Object.entries(moodPatterns).forEach(([mood, pattern]) => {
      const score = pattern.keywords.reduce((count, keyword) => {
        return count + words.filter(word => word.includes(keyword)).length;
      }, 0);

      if (score > maxScore) {
        maxScore = score;
        strongestMood = mood;
        maxIntensity = pattern.intensity;
        maxColors = pattern.colors;
      }
    });

    return {
      name: strongestMood,
      colors: maxColors,
      intensity: maxIntensity
    };
  };

  useEffect(() => {
    if (lyrics.trim()) {
      const mood = analyzeMood(lyrics);
      setCurrentMood(mood);
    }
  }, [lyrics]);

  const gradientStyle = {
    background: `radial-gradient(ellipse at center, ${currentMood.colors.join(", ")})`,
    opacity: currentMood.intensity,
    transition: "all 2s ease-in-out"
  };

  return (
    <div 
      className={`absolute inset-0 pointer-events-none ${className}`}
      style={gradientStyle}
      data-testid="mood-visualizer"
    >
      {/* Animated particles for extra effect */}
      <div className="absolute inset-0">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full animate-pulse"
            style={{
              width: Math.random() * 4 + 2 + "px",
              height: Math.random() * 4 + 2 + "px",
              top: Math.random() * 100 + "%",
              left: Math.random() * 100 + "%",
              backgroundColor: currentMood.colors[i % currentMood.colors.length],
              animationDelay: Math.random() * 3 + "s",
              animationDuration: (Math.random() * 2 + 2) + "s"
            }}
          />
        ))}
      </div>
    </div>
  );
}