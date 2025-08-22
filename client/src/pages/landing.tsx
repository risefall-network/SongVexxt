import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Music, Zap, Brain, BookOpen, Mic, Stars } from "lucide-react";

export default function Landing() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Hero Section */}
      <div className="relative flex-1 flex items-center justify-center">
        <div className="absolute inset-0 bg-gradient-to-br from-cyber-purple via-cyber-dark to-cyber-blue opacity-80" />
        
        <div className="relative z-10 text-center max-w-4xl px-6">
          <div className="flex items-center justify-center mb-6">
            <div className="p-4 glass-effect rounded-full animate-pulse-neon">
              <Music className="w-16 h-16 text-neon-blue" />
            </div>
          </div>
          
          <h1 className="font-cyber text-6xl md:text-8xl font-bold mb-6 text-glow">
            Song<span className="text-neon-cyan">Vexxt</span>
          </h1>
          
          <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-2xl mx-auto">
            The ultimate AI-powered songwriting assistant that helps you create better lyrics faster
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Button 
              onClick={() => window.location.href = "/api/login"}
              className="cyber-button px-8 py-4 text-lg font-cyber hover:scale-105 transition-transform"
              data-testid="button-login"
            >
              <Zap className="w-5 h-5 mr-2" />
              Start Writing Now
            </Button>
            
            <Button 
              variant="outline" 
              className="border-neon-blue text-neon-blue hover:bg-neon-blue hover:text-cyber-dark px-8 py-4 text-lg"
              data-testid="button-learn-more"
            >
              Learn More
            </Button>
          </div>
          
          {/* Features Grid */}
          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <Card className="glass-effect border-neon-blue/30 hover:border-neon-blue/60 transition-colors" data-testid="card-feature-overlay">
              <CardHeader>
                <div className="w-12 h-12 bg-gradient-to-r from-neon-blue to-neon-cyan rounded-lg flex items-center justify-center mb-4">
                  <Brain className="w-6 h-6 text-cyber-dark" />
                </div>
                <CardTitle className="font-cyber text-neon-blue">Smart Overlay</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-gray-300">
                  Non-intrusive rhyme suggestions that appear transparently over any text field you're working in
                </CardDescription>
              </CardContent>
            </Card>
            
            <Card className="glass-effect border-neon-purple/30 hover:border-neon-purple/60 transition-colors" data-testid="card-feature-ai">
              <CardHeader>
                <div className="w-12 h-12 bg-gradient-to-r from-neon-purple to-neon-pink rounded-lg flex items-center justify-center mb-4">
                  <Stars className="w-6 h-6 text-cyber-dark" />
                </div>
                <CardTitle className="font-cyber text-neon-purple">AI Assistant</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-gray-300">
                  Advanced AI helps you complete lines, suggests alternatives, and guides your creative process
                </CardDescription>
              </CardContent>
            </Card>
            
            <Card className="glass-effect border-neon-cyan/30 hover:border-neon-cyan/60 transition-colors" data-testid="card-feature-tools">
              <CardHeader>
                <div className="w-12 h-12 bg-gradient-to-r from-neon-cyan to-neon-blue rounded-lg flex items-center justify-center mb-4">
                  <BookOpen className="w-6 h-6 text-cyber-dark" />
                </div>
                <CardTitle className="font-cyber text-neon-cyan">Pro Tools</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-gray-300">
                  Complete songwriting toolkit with dictionary, thesaurus, structure templates, and learning resources
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      
      {/* Footer */}
      <footer className="relative z-10 p-6 text-center text-gray-400 border-t border-neon-blue/20">
        <div className="glass-effect rounded-lg p-4 inline-block">
          <p className="font-cyber text-sm">
            Powered by AI • Built for Artists • Made with <span className="text-neon-pink">♥</span>
          </p>
        </div>
      </footer>
    </div>
  );
}
