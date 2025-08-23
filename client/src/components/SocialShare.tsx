import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Share2, Download, Copy, Twitter, Instagram, Facebook, Loader } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface SocialShareProps {
  lyrics: string;
  songTitle?: string;
  currentSection?: string;
  children?: React.ReactNode;
}

export default function SocialShare({ lyrics, songTitle = "Untitled Song", currentSection = "Verse", children }: SocialShareProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<'minimal' | 'cyberpunk' | 'modern'>('cyberpunk');
  const { toast } = useToast();

  const generateLyricCard = async () => {
    if (!lyrics.trim()) {
      toast({
        title: "No lyrics to share",
        description: "Please write some lyrics first before sharing.",
        variant: "destructive"
      });
      return;
    }

    setIsGenerating(true);
    
    try {
      // Create prompt based on selected template
      const templatePrompts = {
        minimal: `Clean minimalist lyric card design with white background, elegant black typography, featuring the song lyrics: "${lyrics.slice(0, 200)}${lyrics.length > 200 ? '...' : ''}" and song title "${songTitle}" (${currentSection}). Modern, simple, Instagram-ready format with plenty of white space.`,
        cyberpunk: `Futuristic cyberpunk-style lyric card with neon colors, dark background with purple and blue gradients, glowing text effects, featuring the song lyrics: "${lyrics.slice(0, 200)}${lyrics.length > 200 ? '...' : ''}" and song title "${songTitle}" (${currentSection}). Neon cyan and purple accents, tech-inspired design, perfect for social media sharing.`,
        modern: `Modern artistic lyric card with vibrant gradient background, contemporary typography, featuring the song lyrics: "${lyrics.slice(0, 200)}${lyrics.length > 200 ? '...' : ''}" and song title "${songTitle}" (${currentSection}). Trendy design with good contrast, social media optimized format.`
      };

      const response = await fetch('/api/generate-lyric-card', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: templatePrompts[selectedTemplate],
          lyrics: lyrics.slice(0, 300), // Limit for image generation
          songTitle,
          currentSection,
          template: selectedTemplate
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate lyric card');
      }

      const { imageUrl } = await response.json();
      setGeneratedImageUrl(imageUrl);
      
      toast({
        title: "Lyric card generated!",
        description: "Your custom lyric card is ready to share.",
      });
    } catch (error) {
      console.error('Error generating lyric card:', error);
      toast({
        title: "Generation failed",
        description: "Failed to generate lyric card. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleShare = (platform: string) => {
    if (!generatedImageUrl) {
      toast({
        title: "No image to share",
        description: "Please generate a lyric card first.",
        variant: "destructive"
      });
      return;
    }

    const shareText = `Check out these lyrics from "${songTitle}" 🎵\n\n"${lyrics.slice(0, 100)}${lyrics.length > 100 ? '...' : ''}"\n\n#SongVexxt #Lyrics #Music`;
    const shareUrl = window.location.origin;

    const urls = {
      twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}&quote=${encodeURIComponent(shareText)}`,
      instagram: generatedImageUrl // For Instagram, we'll show download instructions
    };

    if (platform === 'instagram') {
      handleDownload();
      toast({
        title: "Image ready for Instagram",
        description: "Your lyric card has been downloaded. Upload it to Instagram and add your caption!",
      });
    } else {
      window.open(urls[platform as keyof typeof urls], '_blank');
    }
  };

  const handleDownload = async () => {
    if (!generatedImageUrl) return;

    try {
      const response = await fetch(generatedImageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${songTitle.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_lyric_card.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      toast({
        title: "Downloaded!",
        description: "Lyric card saved to your device.",
      });
    } catch (error) {
      console.error('Download failed:', error);
      toast({
        title: "Download failed",
        description: "Could not download the image. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleCopyText = () => {
    const shareText = `"${lyrics}"\n\n- ${songTitle} (${currentSection})\n\nCreated with SongVexxt`;
    navigator.clipboard.writeText(shareText);
    toast({
      title: "Copied to clipboard",
      description: "Lyrics copied to clipboard for sharing.",
    });
  };

  const templateCards = [
    { id: 'cyberpunk', name: 'Cyberpunk', description: 'Neon and futuristic' },
    { id: 'minimal', name: 'Minimal', description: 'Clean and simple' },
    { id: 'modern', name: 'Modern', description: 'Trendy gradients' }
  ];

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button className="cyber-button px-4 py-2 rounded-lg" data-testid="button-share">
            <Share2 className="w-4 h-4 mr-2" />
            Share
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-2xl glass-effect border-neon-blue/30">
        <DialogHeader>
          <DialogTitle className="font-cyber text-xl text-neon-blue">Share Your Lyrics</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Template Selection */}
          <div>
            <h3 className="text-sm font-medium text-neon-blue mb-3">Choose a style:</h3>
            <div className="grid grid-cols-3 gap-3">
              {templateCards.map((template) => (
                <Card 
                  key={template.id}
                  className={`cursor-pointer border transition-colors ${
                    selectedTemplate === template.id 
                      ? 'border-neon-blue bg-neon-blue/10' 
                      : 'border-gray-600 hover:border-neon-blue/50'
                  }`}
                  onClick={() => setSelectedTemplate(template.id as any)}
                  data-testid={`card-template-${template.id}`}
                >
                  <CardContent className="p-3 text-center">
                    <div className="text-sm font-medium text-white">{template.name}</div>
                    <div className="text-xs text-gray-400 mt-1">{template.description}</div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Generate Button */}
          <div className="flex justify-center">
            <Button 
              onClick={generateLyricCard}
              disabled={isGenerating}
              className="cyber-button px-6 py-3 rounded-lg"
              data-testid="button-generate-card"
            >
              {isGenerating ? (
                <><Loader className="w-4 h-4 mr-2 animate-spin" />Generating...</>
              ) : (
                <>Generate Lyric Card</>
              )}
            </Button>
          </div>

          {/* Generated Image Preview */}
          {generatedImageUrl && (
            <div className="space-y-4">
              <div className="border border-neon-blue/30 rounded-lg p-2">
                <img 
                  src={generatedImageUrl} 
                  alt="Generated lyric card" 
                  className="w-full h-auto rounded-lg"
                  data-testid="img-generated-lyric-card"
                />
              </div>
              
              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-3">
                <Button 
                  onClick={handleDownload}
                  className="cyber-button w-full py-2 rounded-lg"
                  data-testid="button-download"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download
                </Button>
                <Button 
                  onClick={handleCopyText}
                  className="cyber-button w-full py-2 rounded-lg"
                  data-testid="button-copy-text"
                >
                  <Copy className="w-4 h-4 mr-2" />
                  Copy Text
                </Button>
              </div>

              {/* Social Media Buttons */}
              <div className="grid grid-cols-3 gap-3">
                <Button 
                  onClick={() => handleShare('twitter')}
                  className="cyber-button w-full py-2 rounded-lg bg-blue-600/20 hover:bg-blue-600/30 border-blue-500"
                  data-testid="button-share-twitter"
                >
                  <Twitter className="w-4 h-4 mr-2" />
                  Twitter
                </Button>
                <Button 
                  onClick={() => handleShare('facebook')}
                  className="cyber-button w-full py-2 rounded-lg bg-blue-800/20 hover:bg-blue-800/30 border-blue-700"
                  data-testid="button-share-facebook"
                >
                  <Facebook className="w-4 h-4 mr-2" />
                  Facebook
                </Button>
                <Button 
                  onClick={() => handleShare('instagram')}
                  className="cyber-button w-full py-2 rounded-lg bg-pink-600/20 hover:bg-pink-600/30 border-pink-500"
                  data-testid="button-share-instagram"
                >
                  <Instagram className="w-4 h-4 mr-2" />
                  Instagram
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}