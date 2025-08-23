import { useState, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Mic, Play, Pause, Trash2, Plus, Download, Upload } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface AudioFile {
  id: string;
  name: string;
  duration: number;
  createdAt: Date;
  url: string;
  section: string;
}

interface SavedAudioFilesProps {
  currentSection: string;
  className?: string;
}

export default function SavedAudioFiles({ currentSection, className = "" }: SavedAudioFilesProps) {
  const { toast } = useToast();
  const [audioFiles, setAudioFiles] = useState<AudioFile[]>([
    {
      id: "1",
      name: "Chorus Melody v1",
      duration: 45,
      createdAt: new Date(),
      url: "#",
      section: "Chorus"
    },
    {
      id: "2", 
      name: "Verse Hook",
      duration: 30,
      createdAt: new Date(),
      url: "#",
      section: "Verse 1"
    }
  ]);
  const [isRecording, setIsRecording] = useState(false);
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [recordingName, setRecordingName] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      
      const chunks: BlobPart[] = [];
      
      mediaRecorder.ondataavailable = (event) => {
        chunks.push(event.data);
      };
      
      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'audio/wav' });
        const url = URL.createObjectURL(blob);
        
        const newAudio: AudioFile = {
          id: Date.now().toString(),
          name: recordingName || `${currentSection} Recording`,
          duration: 0, // Would calculate from actual recording
          createdAt: new Date(),
          url,
          section: currentSection
        };
        
        setAudioFiles(prev => [...prev, newAudio]);
        setRecordingName("");
        
        toast({
          title: "Recording Saved",
          description: `"${newAudio.name}" has been saved to your audio library`,
        });
      };
      
      mediaRecorder.start();
      setIsRecording(true);
      
      toast({
        title: "Recording Started",
        description: "Speak or hum your melody ideas...",
      });
    } catch (error) {
      toast({
        title: "Recording Error",
        description: "Could not access microphone. Please check permissions.",
        variant: "destructive",
      });
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      
      // Stop all tracks
      if (mediaRecorderRef.current.stream) {
        mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      }
    }
  };

  const playAudio = (id: string) => {
    if (playingId === id) {
      setPlayingId(null);
      // Would pause actual audio here
    } else {
      setPlayingId(id);
      // Would play actual audio here
      toast({
        title: "Audio Playback",
        description: "Audio playback would start here with actual implementation",
      });
    }
  };

  const deleteAudio = (id: string) => {
    setAudioFiles(prev => prev.filter(file => file.id !== id));
    toast({
      title: "Audio Deleted",
      description: "Recording has been removed from your library",
    });
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      const newAudio: AudioFile = {
        id: Date.now().toString(),
        name: file.name.replace(/\.[^/.]+$/, ""),
        duration: 0, // Would get from file metadata
        createdAt: new Date(),
        url,
        section: currentSection
      };
      
      setAudioFiles(prev => [...prev, newAudio]);
      
      toast({
        title: "File Uploaded",
        description: `"${newAudio.name}" has been added to your audio library`,
      });
    }
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const currentSectionFiles = audioFiles.filter(file => file.section === currentSection);
  const otherFiles = audioFiles.filter(file => file.section !== currentSection);

  return (
    <Card className={`glass-effect border-neon-glow p-4 ${className}`} data-testid="saved-audio-files">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Mic className="h-4 w-4 text-neon-purple" />
          <h3 className="font-cyber text-sm text-neon-gold">Saved Audio Files</h3>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            className="h-6 w-6 p-0 hover:bg-neon-blue/20"
            data-testid="upload-audio"
          >
            <Upload className="h-3 w-3 text-neon-blue" />
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept="audio/*"
            onChange={handleFileUpload}
            className="hidden"
          />
        </div>
      </div>

      {/* Recording Controls */}
      <div className="mb-4 p-3 rounded-lg bg-cyber-purple/20 border border-neon-blue/20">
        <div className="flex items-center gap-2 mb-2">
          <Input
            value={recordingName}
            onChange={(e) => setRecordingName(e.target.value)}
            placeholder={`${currentSection} Recording`}
            className="text-xs bg-cyber-purple/30 border-neon-blue/30 text-neon-gold"
            data-testid="input-recording-name"
          />
        </div>
        <Button
          onClick={isRecording ? stopRecording : startRecording}
          className={`w-full ${isRecording ? 'bg-red-600 hover:bg-red-700' : 'cyber-button'}`}
          data-testid="button-record"
        >
          <Mic className={`h-4 w-4 mr-2 ${isRecording ? 'animate-pulse' : ''}`} />
          {isRecording ? 'Stop Recording' : 'Start Recording'}
        </Button>
      </div>

      {/* Current Section Files */}
      {currentSectionFiles.length > 0 && (
        <div className="mb-4">
          <h4 className="text-xs font-medium text-neon-cyan mb-2">
            {currentSection} ({currentSectionFiles.length})
          </h4>
          <div className="space-y-2">
            {currentSectionFiles.map((file) => (
              <div
                key={file.id}
                className="flex items-center justify-between p-2 rounded bg-cyber-blue/10 border border-neon-blue/20"
                data-testid={`audio-file-${file.id}`}
              >
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-neon-gold truncate">
                    {file.name}
                  </p>
                  <p className="text-xs text-neon-gold/60">
                    {formatDuration(file.duration)}
                  </p>
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => playAudio(file.id)}
                    className="h-6 w-6 p-0 hover:bg-neon-blue/20"
                    data-testid={`play-${file.id}`}
                  >
                    {playingId === file.id ? (
                      <Pause className="h-3 w-3 text-neon-blue" />
                    ) : (
                      <Play className="h-3 w-3 text-neon-blue" />
                    )}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => deleteAudio(file.id)}
                    className="h-6 w-6 p-0 hover:bg-red-500/20"
                    data-testid={`delete-${file.id}`}
                  >
                    <Trash2 className="h-3 w-3 text-red-400" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Other Section Files */}
      {otherFiles.length > 0 && (
        <div>
          <h4 className="text-xs font-medium text-neon-gold/70 mb-2">
            Other Sections ({otherFiles.length})
          </h4>
          <div className="space-y-2">
            {otherFiles.map((file) => (
              <div
                key={file.id}
                className="flex items-center justify-between p-2 rounded bg-cyber-purple/10 border border-neon-purple/20"
                data-testid={`audio-file-other-${file.id}`}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <Badge
                      variant="outline"
                      className="border-neon-pink text-neon-pink bg-cyber-purple/20 text-xs"
                    >
                      {file.section}
                    </Badge>
                  </div>
                  <p className="text-xs font-medium text-neon-gold/70 truncate">
                    {file.name}
                  </p>
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => playAudio(file.id)}
                    className="h-6 w-6 p-0 hover:bg-neon-purple/20"
                    data-testid={`play-other-${file.id}`}
                  >
                    {playingId === file.id ? (
                      <Pause className="h-3 w-3 text-neon-purple" />
                    ) : (
                      <Play className="h-3 w-3 text-neon-purple" />
                    )}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => deleteAudio(file.id)}
                    className="h-6 w-6 p-0 hover:bg-red-500/20"
                    data-testid={`delete-other-${file.id}`}
                  >
                    <Trash2 className="h-3 w-3 text-red-400" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {audioFiles.length === 0 && (
        <div className="text-center py-6">
          <Mic className="h-8 w-8 text-neon-purple/50 mx-auto mb-2" />
          <p className="text-xs text-neon-gold/70">
            No audio files yet. Record or upload your melody ideas!
          </p>
        </div>
      )}
    </Card>
  );
}