
import { useEffect, useRef, useState } from 'react';
import * as Tone from 'tone';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Play, Pause, Square } from 'lucide-react';

interface AudioPlayerProps {
  audioUrl?: string;
  isPlaying: boolean;
  onPlayStateChange: (playing: boolean) => void;
  duration: number;
  currentTime: number;
  onSeek: (time: number) => void;
  scenario: string;
}

export const AudioPlayer = ({
  audioUrl,
  isPlaying,
  onPlayStateChange,
  duration,
  currentTime,
  onSeek,
  scenario
}: AudioPlayerProps) => {
  const playerRef = useRef<Tone.Player | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [volume, setVolume] = useState([70]);
  const [actualDuration, setActualDuration] = useState(0);
  const [actualCurrentTime, setActualCurrentTime] = useState(0);

  // Initialize Tone.js audio context
  useEffect(() => {
    const initAudio = async () => {
      if (Tone.context.state !== 'running') {
        await Tone.start();
      }
    };
    initAudio();
  }, []);

  // Load actual audio file
  useEffect(() => {
    if (!audioUrl) return;

    const loadAudio = async () => {
      setIsLoading(true);
      setError(null);

      try {
        // Dispose of previous player
        if (playerRef.current) {
          playerRef.current.dispose();
        }

        // Create new player with actual audio file
        const player = new Tone.Player({
          url: audioUrl,
          onload: () => {
            setActualDuration(player.buffer.duration);
            setIsLoading(false);
          },
          onerror: (error) => {
            setError('Failed to load audio file');
            setIsLoading(false);
            console.error('Audio loading error:', error);
          }
        }).toDestination();

        playerRef.current = player;

      } catch (err) {
        setError('Failed to load audio');
        setIsLoading(false);
        console.error('Audio loading error:', err);
      }
    };

    loadAudio();

    return () => {
      if (playerRef.current) {
        playerRef.current.dispose();
        playerRef.current = null;
      }
    };
  }, [audioUrl]);

  // Handle play/pause
  useEffect(() => {
    if (!playerRef.current) return;

    if (isPlaying) {
      playerRef.current.start();
    } else {
      playerRef.current.stop();
    }
  }, [isPlaying]);

  // Handle volume changes
  useEffect(() => {
    const volumeDb = (volume[0] / 100) * 40 - 40;
    Tone.Destination.volume.value = volumeDb;
  }, [volume]);

  // Track playback progress
  useEffect(() => {
    if (!isPlaying || !playerRef.current) return;

    const interval = setInterval(() => {
      // This is a simplified progress tracking - Tone.js doesn't have built-in progress
      // In a real implementation, you'd need more sophisticated timing
      setActualCurrentTime(prev => {
        const newTime = prev + 0.1;
        if (newTime >= actualDuration) {
          onPlayStateChange(false);
          return 0;
        }
        return newTime;
      });
    }, 100);

    return () => clearInterval(interval);
  }, [isPlaying, actualDuration, onPlayStateChange]);

  const handlePlay = async () => {
    try {
      if (Tone.context.state !== 'running') {
        await Tone.start();
      }
      onPlayStateChange(true);
    } catch (err) {
      setError('Failed to start playback');
      console.error('Playback error:', err);
    }
  };

  const handlePause = () => {
    onPlayStateChange(false);
  };

  const handleStop = () => {
    onPlayStateChange(false);
    setActualCurrentTime(0);
    onSeek(0);
  };

  const handleSeek = (value: number[]) => {
    const newTime = (value[0] / 100) * actualDuration;
    setActualCurrentTime(newTime);
    onSeek((newTime / actualDuration) * duration);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = actualDuration > 0 ? (actualCurrentTime / actualDuration) * 100 : 0;

  return (
    <Card className="w-full max-w-2xl mx-auto bg-dark-card border-dark-border">
      <CardContent className="p-6">
        <div className="space-y-4">
          {/* Audio Title */}
          <div className="text-center">
            <h3 className="text-lg font-semibold text-dark-text-primary">
              Climate Audio Narrative
            </h3>
            <p className="text-sm text-dark-text-secondary">
              {scenario}°C warming scenario for Fiji
            </p>
          </div>

          {/* Error Display */}
          {error && (
            <div className="text-red-400 text-sm text-center bg-red-950/20 p-2 rounded border border-red-800/30">
              {error}
            </div>
          )}

          {/* Progress Bar */}
          <div className="space-y-2">
            <Slider
              value={[progress]}
              onValueChange={handleSeek}
              max={100}
              step={1}
              className="w-full"
              disabled={isLoading || actualDuration === 0}
            />
            <div className="flex justify-between text-xs text-dark-text-secondary">
              <span>{formatTime(actualCurrentTime)}</span>
              <span>{formatTime(actualDuration)}</span>
            </div>
          </div>

          {/* Control Buttons */}
          <div className="flex items-center justify-center space-x-2">
            <Button
              onClick={isPlaying ? handlePause : handlePlay}
              disabled={isLoading}
              size="lg"
              className="bg-dark-accent hover:bg-dark-accent/80 text-white"
            >
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : isPlaying ? (
                <Pause className="w-5 h-5" />
              ) : (
                <Play className="w-5 h-5" />
              )}
            </Button>
            
            <Button
              onClick={handleStop}
              disabled={isLoading || (!isPlaying && actualCurrentTime === 0)}
              variant="outline"
              size="lg"
              className="border-dark-border text-dark-text-primary hover:bg-dark-hover"
            >
              <Square className="w-4 h-4" />
            </Button>
          </div>

          {/* Volume Control */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-dark-text-primary">Volume</label>
            <Slider
              value={volume}
              onValueChange={setVolume}
              max={100}
              step={1}
              className="w-full"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
