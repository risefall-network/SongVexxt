import { useEffect, useRef } from "react";

interface KeyboardSoundsProps {
  enabled?: boolean;
}

export default function KeyboardSounds({ enabled = true }: KeyboardSoundsProps) {
  const audioContextRef = useRef<AudioContext | null>(null);

  // Create audio context
  const getAudioContext = () => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    return audioContextRef.current;
  };

  // Generate cyberpunk typing sound
  const playTypingSound = () => {
    if (!enabled) return;

    try {
      const audioContext = getAudioContext();
      
      // Create oscillator for the main tone
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      // Create filter for cyberpunk effect
      const filter = audioContext.createBiquadFilter();
      filter.type = "bandpass";
      filter.frequency.setValueAtTime(800 + Math.random() * 400, audioContext.currentTime);
      filter.Q.setValueAtTime(5, audioContext.currentTime);
      
      // Connect nodes
      oscillator.connect(filter);
      filter.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      // Set frequency for cyberpunk feel
      const baseFreq = 600 + Math.random() * 200;
      oscillator.frequency.setValueAtTime(baseFreq, audioContext.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(baseFreq * 0.8, audioContext.currentTime + 0.1);
      
      // Set wave type for digital sound
      oscillator.type = "square";
      
      // Volume envelope
      gainNode.gain.setValueAtTime(0, audioContext.currentTime);
      gainNode.gain.linearRampToValueAtTime(0.02, audioContext.currentTime + 0.01);
      gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.1);
      
      // Play sound
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.1);
      
    } catch (error) {
      console.warn("Could not play typing sound:", error);
    }
  };

  // Special sound for enter/return key
  const playEnterSound = () => {
    if (!enabled) return;

    try {
      const audioContext = getAudioContext();
      
      // Create more complex sound for enter key
      const oscillator1 = audioContext.createOscillator();
      const oscillator2 = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      // Create filter
      const filter = audioContext.createBiquadFilter();
      filter.type = "lowpass";
      filter.frequency.setValueAtTime(1200, audioContext.currentTime);
      
      // Connect nodes
      oscillator1.connect(gainNode);
      oscillator2.connect(gainNode);
      gainNode.connect(filter);
      filter.connect(audioContext.destination);
      
      // Set frequencies for harmony
      oscillator1.frequency.setValueAtTime(440, audioContext.currentTime);
      oscillator2.frequency.setValueAtTime(660, audioContext.currentTime);
      
      oscillator1.type = "sine";
      oscillator2.type = "triangle";
      
      // Volume envelope
      gainNode.gain.setValueAtTime(0, audioContext.currentTime);
      gainNode.gain.linearRampToValueAtTime(0.03, audioContext.currentTime + 0.02);
      gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.2);
      
      // Play sound
      oscillator1.start(audioContext.currentTime);
      oscillator2.start(audioContext.currentTime);
      oscillator1.stop(audioContext.currentTime + 0.2);
      oscillator2.stop(audioContext.currentTime + 0.2);
      
    } catch (error) {
      console.warn("Could not play enter sound:", error);
    }
  };

  useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      // Only play sounds for actual text input areas
      const target = event.target as HTMLElement;
      if (target.tagName === "TEXTAREA" || target.tagName === "INPUT") {
        if (event.key === "Enter") {
          playEnterSound();
        } else if (event.key.length === 1) { // Regular character keys
          playTypingSound();
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      // Clean up audio context
      if (audioContextRef.current && audioContextRef.current.state !== "closed") {
        audioContextRef.current.close();
      }
    };
  }, [enabled]);

  return null; // This component doesn't render anything
}