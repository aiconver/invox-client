"use client";

import * as React from "react";
import { MdMic, MdMicOff, MdPause, MdPlayArrow } from "react-icons/md";
import { Button } from "@/components/ui/button";
import { RecorderState } from "./useRecorder";

type Props = {
  state: RecorderState;
  isAutoMode: boolean;
  audioLevel: number;
  silenceCountdown: number;
  error: string | null;
  onToggleAutoMode: () => void;
  onClearError: () => void;
};

// Waveform component
function Waveform({ audioLevel, isActive }: { audioLevel: number; isActive: boolean }) {
  const bars = 12;
  const baseHeight = 4;
  const maxHeight = 24;
  
  return (
    <div className="flex items-center justify-center gap-1 h-8">
      {Array.from({ length: bars }, (_, i) => {
        const normalizedIndex = Math.abs(i - bars / 2) / (bars / 2);
        const heightMultiplier = isActive 
          ? Math.max(0.2, audioLevel * (1 - normalizedIndex * 0.5))
          : 0.2;
        const height = baseHeight + (maxHeight - baseHeight) * heightMultiplier;
        
        return (
          <div
            key={i}
            className={`rounded-full transition-all duration-150 ${
              isActive 
                ? 'bg-emerald-500' 
                : 'bg-muted-foreground/30'
            }`}
            style={{
              width: '3px',
              height: `${height}px`,
              animation: isActive ? `pulse-${i} 1s ease-in-out infinite` : 'none',
              animationDelay: `${i * 0.1}s`
            }}
          />
        );
      })}
      <style jsx>{`
        ${Array.from({ length: bars }, (_, i) => `
          @keyframes pulse-${i} {
            0%, 100% { opacity: 0.6; transform: scaleY(1); }
            50% { opacity: 1; transform: scaleY(${1 + audioLevel * 0.5}); }
          }
        `).join('')}
      `}</style>
    </div>
  );
}

// Mic icon with status colors and countdown
function MicIcon({ 
  state, 
  silenceCountdown, 
  onClick, 
  disabled 
}: { 
  state: RecorderState; 
  silenceCountdown: number;
  onClick: () => void;
  disabled: boolean;
}) {
  const getIconColor = () => {
    switch (state) {
      case 'listening':
        return 'text-blue-500';
      case 'speaking':
        return 'text-emerald-500';
      case 'processing':
        return 'text-orange-500';
      case 'error':
        return 'text-red-500';
      default:
        return 'text-muted-foreground';
    }
  };

  const getBgColor = () => {
    switch (state) {
      case 'listening':
        return 'bg-blue-50 border-blue-200';
      case 'speaking':
        return 'bg-emerald-50 border-emerald-200';
      case 'processing':
        return 'bg-orange-50 border-orange-200';
      case 'error':
        return 'bg-red-50 border-red-200';
      default:
        return 'bg-muted/20 border-border';
    }
  };

  const isPulsing = state === 'listening' || state === 'speaking';

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="lg"
        onClick={onClick}
        disabled={disabled}
        className={`
          relative h-16 w-16 rounded-full border-2 transition-all duration-300
          ${getBgColor()}
          ${isPulsing ? 'animate-pulse' : ''}
          hover:scale-105 active:scale-95
        `}
      >
        {state === 'idle' ? (
          <MdMicOff className={`h-8 w-8 ${getIconColor()}`} />
        ) : (
          <MdMic className={`h-8 w-8 ${getIconColor()}`} />
        )}
      </Button>
      
      {/* Countdown indicator */}
      {silenceCountdown > 0 && (
        <div className="absolute -top-1 -right-1 h-6 w-6 rounded-full bg-orange-500 text-white text-xs font-bold flex items-center justify-center animate-bounce">
          {silenceCountdown}
        </div>
      )}
      
      {/* Processing spinner */}
      {state === 'processing' && (
        <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-orange-500 animate-spin" />
      )}
    </div>
  );
}

// Status text component
function StatusText({ state, silenceCountdown, error }: { 
  state: RecorderState; 
  silenceCountdown: number;
  error: string | null;
}) {
  if (error) {
    return <span className="text-red-600 text-sm font-medium">Error: {error}</span>;
  }

  switch (state) {
    case 'idle':
      return <span className="text-muted-foreground text-sm">Click to start listening</span>;
    case 'listening':
      return <span className="text-blue-600 text-sm">Listening... speak now</span>;
    case 'speaking':
      return <span className="text-emerald-600 text-sm">Speaking detected</span>;
    case 'processing':
      return <span className="text-orange-600 text-sm">Processing audio...</span>;
    default:
      return <span className="text-muted-foreground text-sm">Ready</span>;
  }
}

export function EnhancedRecorderControls({
  state,
  isAutoMode,
  audioLevel,
  silenceCountdown,
  error,
  onToggleAutoMode,
  onClearError,
}: Props) {
  return (
    <div className="flex flex-col items-center space-y-4 p-6 bg-background/95 backdrop-blur border rounded-lg">
      {/* Main Mic Control */}
      <div className="flex flex-col items-center space-y-3">
        <MicIcon
          state={state}
          silenceCountdown={silenceCountdown}
          onClick={error ? onClearError : onToggleAutoMode}
          disabled={state === 'processing'}
        />
        
        <StatusText 
          state={state}
          silenceCountdown={silenceCountdown}
          error={error}
        />
      </div>

      {/* Waveform Visualization */}
      {(state === 'listening' || state === 'speaking') && (
        <div className="w-full max-w-xs">
          <Waveform 
            audioLevel={audioLevel} 
            isActive={state === 'speaking'} 
          />
        </div>
      )}

      {/* Manual Controls (when in auto mode) */}
      {isAutoMode && state !== 'processing' && !error && (
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onToggleAutoMode}
            className="gap-2"
          >
            <MdPause className="h-4 w-4" />
            Pause Auto Mode
          </Button>
        </div>
      )}

      {/* Auto Mode Status */}
      {!isAutoMode && state === 'idle' && !error && (
        <div className="text-center">
          <p className="text-xs text-muted-foreground mb-2">
            Auto-recording will start listening and process speech automatically
          </p>
          <Button
            variant="default"
            size="sm"
            onClick={onToggleAutoMode}
            className="gap-2"
          >
            <MdPlayArrow className="h-4 w-4" />
            Start Auto Mode
          </Button>
        </div>
      )}

      {/* Silence countdown progress */}
      {silenceCountdown > 0 && (
        <div className="w-full max-w-xs">
          <div className="flex justify-between items-center text-xs text-muted-foreground mb-1">
            <span>Auto-processing in:</span>
            <span>{silenceCountdown}s</span>
          </div>
          <div className="w-full bg-muted rounded-full h-1">
            <div 
              className="bg-orange-500 h-1 rounded-full transition-all duration-1000 ease-linear"
              style={{ width: `${((5 - silenceCountdown) / 5) * 100}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
}