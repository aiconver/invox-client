
import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Mic, MicOff, Play, Square } from 'lucide-react';

interface VoiceRecorderProps {
  onRecordingComplete: (audioBlob: Blob, transcript: string) => void;
  fieldLabel: string;
  isRequired?: boolean;
}

const VoiceRecorder: React.FC<VoiceRecorderProps> = ({ 
  onRecordingComplete, 
  fieldLabel, 
  isRequired = false 
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [transcript, setTranscript] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      
      const chunks: Blob[] = [];
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunks.push(event.data);
        }
      };
      
      mediaRecorder.onstop = async () => {
        const blob = new Blob(chunks, { type: 'audio/wav' });
        setAudioBlob(blob);
        setAudioUrl(URL.createObjectURL(blob));
        
        // Simulate transcription
        setIsProcessing(true);
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        const mockTranscript = `Mock transcription for ${fieldLabel}: This is a sample response to the question about ${fieldLabel.toLowerCase()}.`;
        setTranscript(mockTranscript);
        setIsProcessing(false);
        
        onRecordingComplete(blob, mockTranscript);
        
        // Stop all tracks
        stream.getTracks().forEach(track => track.stop());
      };
      
      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error('Error starting recording:', error);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const playAudio = () => {
    if (audioUrl && audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        audioRef.current.play();
        setIsPlaying(true);
      }
    }
  };

  const clearRecording = () => {
    setAudioBlob(null);
    setAudioUrl(null);
    setTranscript('');
    setIsPlaying(false);
  };

  return (
    <Card className="w-full">
      <CardContent className="p-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium">{fieldLabel}</h3>
            {isRequired && <Badge variant="destructive">Required</Badge>}
          </div>
          
          <div className="flex flex-col items-center space-y-4">
            {/* Recording Controls */}
            <div className="flex items-center space-x-4">
              {!isRecording ? (
                <Button
                  onClick={startRecording}
                  size="lg"
                  className="h-16 w-16 rounded-full bg-blue-500 hover:bg-blue-600"
                  disabled={isProcessing}
                >
                  <Mic className="h-6 w-6" />
                </Button>
              ) : (
                <Button
                  onClick={stopRecording}
                  size="lg"
                  className="h-16 w-16 rounded-full bg-red-500 hover:bg-red-600 animate-pulse"
                >
                  <MicOff className="h-6 w-6" />
                </Button>
              )}
              
              {audioUrl && (
                <Button
                  onClick={playAudio}
                  variant="outline"
                  size="lg"
                  className="h-16 w-16 rounded-full"
                >
                  {isPlaying ? <Square className="h-6 w-6" /> : <Play className="h-6 w-6" />}
                </Button>
              )}
            </div>
            
            {/* Status Messages */}
            <div className="text-center">
              {isRecording && (
                <p className="text-sm text-red-500 animate-pulse">Recording... Click to stop</p>
              )}
              {isProcessing && (
                <p className="text-sm text-blue-500">Processing audio...</p>
              )}
              {audioBlob && !isProcessing && (
                <p className="text-sm text-green-500">Recording complete!</p>
              )}
            </div>
            
            {/* Transcript Display */}
            {transcript && (
              <div className="w-full p-4 bg-muted rounded-lg">
                <h4 className="text-sm font-medium mb-2">Transcript:</h4>
                <p className="text-sm text-muted-foreground">{transcript}</p>
              </div>
            )}
            
            {/* Action Buttons */}
            {audioBlob && (
              <div className="flex space-x-2">
                <Button variant="outline" onClick={clearRecording}>
                  Record Again
                </Button>
                <Button onClick={() => console.log('Confirmed:', transcript)}>
                  Confirm Response
                </Button>
              </div>
            )}
          </div>
        </div>
        
        {/* Hidden audio element for playback */}
        {audioUrl && (
          <audio
            ref={audioRef}
            src={audioUrl}
            onEnded={() => setIsPlaying(false)}
            style={{ display: 'none' }}
          />
        )}
      </CardContent>
    </Card>
  );
};

export default VoiceRecorder;
