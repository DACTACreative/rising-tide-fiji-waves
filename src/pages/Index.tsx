
import { useEffect, useState } from 'react';
import { WaveVisualizer } from '@/components/WaveVisualizer';
import { ScenarioSelector } from '@/components/ScenarioSelector';
import { AudioPlayer } from '@/components/AudioPlayer';
import { DataLoader, SeaLevelData } from '@/utils/DataLoader';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

const Index = () => {
  const [data, setData] = useState<SeaLevelData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedScenario, setSelectedScenario] = useState('1.5');
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTimeIndex, setCurrentTimeIndex] = useState(0);
  const [animationSpeed, setAnimationSpeed] = useState(1000);

  // Load data on mount
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const dataLoader = DataLoader.getInstance();
        const loadedData = await dataLoader.loadData('/data/fiji-sealevel-data.json');
        setData(loadedData);
        toast.success(`Data loaded for ${loadedData.country}`);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to load data';
        setError(errorMessage);
        toast.error(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Animation control
  useEffect(() => {
    if (!isPlaying || !data) return;

    const interval = setInterval(() => {
      setCurrentTimeIndex(prev => {
        if (prev >= data.years.length - 1) {
          setIsPlaying(false);
          return prev;
        }
        return prev + 1;
      });
    }, animationSpeed);

    return () => clearInterval(interval);
  }, [isPlaying, data, animationSpeed]);

  const handleScenarioChange = (scenario: string) => {
    setSelectedScenario(scenario);
    setCurrentTimeIndex(0);
    setIsPlaying(false);
  };

  const handlePlayStateChange = (playing: boolean) => {
    setIsPlaying(playing);
    if (playing && currentTimeIndex >= (data?.years.length || 0) - 1) {
      setCurrentTimeIndex(0);
    }
  };

  const handleSeek = (timePercent: number) => {
    if (!data) return;
    const newIndex = Math.floor((timePercent / 100) * (data.years.length - 1));
    setCurrentTimeIndex(Math.max(0, Math.min(newIndex, data.years.length - 1)));
  };

  const resetAnimation = () => {
    setCurrentTimeIndex(0);
    setIsPlaying(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="text-center space-y-4">
          <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-slate-600 font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-red-50">
        <Card className="max-w-md">
          <CardContent className="p-8 text-center space-y-4">
            <div className="text-red-500 text-2xl">⚠️</div>
            <h2 className="text-lg font-semibold text-red-700">Error</h2>
            <p className="text-red-600 text-sm">{error || 'Unknown error'}</p>
            <Button onClick={() => window.location.reload()} variant="outline" size="sm">
              Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const currentScenarioData = data.scenarios[selectedScenario] || [];
  const scenarios = DataLoader.getInstance().getScenarios(data);
  const duration = data.years.length;
  const currentTime = currentTimeIndex + 1;
  const audioUrl = data.audio[selectedScenario];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50">
      <div className="container mx-auto px-6 py-12 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-16 space-y-4">
          <h1 className="text-3xl md:text-4xl font-light text-slate-800 tracking-tight">
            Fiji Sea Level Rise
          </h1>
          <p className="text-slate-600 max-w-lg mx-auto leading-relaxed">
            Visualizing climate impact through three warming scenarios
          </p>
        </div>

        {/* Main Content */}
        <div className="space-y-12">
          {/* Scenario Selection */}
          <div className="flex justify-center">
            <ScenarioSelector
              scenarios={scenarios}
              selectedScenario={selectedScenario}
              onScenarioChange={handleScenarioChange}
              disabled={isPlaying}
            />
          </div>

          {/* Wave Visualization */}
          <WaveVisualizer
            data={currentScenarioData}
            years={data.years}
            currentIndex={currentTimeIndex}
            thresholds={data.thresholds}
            scenario={selectedScenario}
            isPlaying={isPlaying}
            onProgress={(progress) => console.log('Wave progress:', progress)}
          />

          {/* Audio Player */}
          <AudioPlayer
            audioUrl={audioUrl}
            isPlaying={isPlaying}
            onPlayStateChange={handlePlayStateChange}
            duration={duration}
            currentTime={currentTime}
            onSeek={(time) => handleSeek((time / duration) * 100)}
            scenario={selectedScenario}
          />

          {/* Simple Controls */}
          <div className="flex justify-center gap-4">
            <Button
              onClick={() => handlePlayStateChange(!isPlaying)}
              size="lg"
              className="bg-slate-800 hover:bg-slate-700 text-white px-8 py-3 rounded-full font-medium"
            >
              {isPlaying ? 'Pause' : 'Play'}
            </Button>
            <Button
              onClick={resetAnimation}
              variant="outline"
              size="lg"
              className="border-slate-300 text-slate-700 hover:bg-slate-50 px-8 py-3 rounded-full font-medium"
            >
              Reset
            </Button>
          </div>

          {/* Status */}
          <div className="text-center text-sm text-slate-500 space-y-1">
            <p>
              <span className="font-medium">{data.years[currentTimeIndex]}</span> — 
              <span className="font-medium"> {currentScenarioData[currentTimeIndex]?.toFixed(2)}m</span> rise
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
