
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

  // Initialize Tone.js audio context
  useEffect(() => {
    const initAudio = async () => {
      if (Tone.context.state !== 'running') {
        await Tone.start();
      }
    };
    initAudio();
  }, []);

  // Load audio file when URL changes
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

        // Create new player - for demo purposes, we'll create a synthetic tone
        // In production, replace this with actual audio file loading
        const synth = new Tone.Synth().toDestination();
        
        // Create a simple melody based on scenario
        const getScenarioFrequencies = (scenario: string) => {
          switch (scenario) {
            case '1.5': return ['C4', 'D4', 'E4', 'F4'];
            case '2.5': return ['A3', 'B3', 'C4', 'D4', 'E4'];
            case '5': return ['F3', 'G3', 'A3', 'B3', 'C4', 'D4'];
            default: return ['C4'];
          }
        };

        const frequencies = getScenarioFrequencies(scenario);
        let noteIndex = 0;

        // Store synth reference for cleanup
        playerRef.current = synth as any;

        setIsLoading(false);
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
  }, [audioUrl, scenario]);

  // Handle volume changes
  useEffect(() => {
    const volumeDb = (volume[0] / 100) * 40 - 40; // Convert 0-100 to -40db to 0db
    Tone.Destination.volume.value = volumeDb;
  }, [volume]);

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
    onSeek(0);
  };

  const handleSeek = (value: number[]) => {
    onSeek((value[0] / 100) * duration);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardContent className="p-6">
        <div className="space-y-4">
          {/* Audio Title */}
          <div className="text-center">
            <h3 className="text-lg font-semibold text-slate-700">
              Climate Audio Narrative
            </h3>
            <p className="text-sm text-slate-500">
              {scenario}°C warming scenario for Fiji
            </p>
          </div>

          {/* Error Display */}
          {error && (
            <div className="text-red-500 text-sm text-center bg-red-50 p-2 rounded">
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
              disabled={isLoading || duration === 0}
            />
            <div className="flex justify-between text-xs text-slate-500">
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(duration)}</span>
            </div>
          </div>

          {/* Control Buttons */}
          <div className="flex items-center justify-center space-x-2">
            <Button
              onClick={isPlaying ? handlePause : handlePlay}
              disabled={isLoading}
              size="lg"
              className="bg-blue-600 hover:bg-blue-700"
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
              disabled={isLoading || (!isPlaying && currentTime === 0)}
              variant="outline"
              size="lg"
            >
              <Square className="w-4 h-4" />
            </Button>
          </div>

          {/* Volume Control */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-600">Volume</label>
            <Slider
              value={volume}
              onValueChange={setVolume}
              max={100}
              step={1}
              className="w-full"
            />
          </div>

          {/* Audio Info */}
          <div className="text-xs text-slate-400 text-center">
            * Audio files should be placed in the public/sounds/ directory
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
