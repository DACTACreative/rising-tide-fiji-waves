
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
  const [animationSpeed, setAnimationSpeed] = useState(1000); // ms per step

  // Load data on mount
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const dataLoader = DataLoader.getInstance();
        const loadedData = await dataLoader.loadData('/data/fiji-sealevel-data.json');
        setData(loadedData);
        toast.success(`Loaded sea level data for ${loadedData.country}`);
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
    toast.info(`Switched to ${scenario}°C warming scenario`);
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
    toast.info('Animation reset to 2020');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-cyan-100">
        <Card className="w-96">
          <CardContent className="p-8 text-center">
            <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
            <h2 className="text-lg font-semibold text-slate-700">Loading Sea Level Data</h2>
            <p className="text-slate-500 mt-2">Preparing climate visualization...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-orange-100">
        <Card className="w-96">
          <CardContent className="p-8 text-center">
            <div className="text-red-500 text-4xl mb-4">⚠️</div>
            <h2 className="text-lg font-semibold text-red-700">Data Loading Error</h2>
            <p className="text-red-600 mt-2">{error || 'Unknown error occurred'}</p>
            <Button 
              onClick={() => window.location.reload()} 
              className="mt-4"
              variant="outline"
            >
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-cyan-50 to-teal-50">
      {/* Header */}
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-slate-800 mb-4">
            🌊 {data.country} Sea Level Rise
          </h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Interactive visualization of sea level rise scenarios from 2020 to 2150.
            Experience the impact of different warming pathways on Pacific island nations.
          </p>
        </div>

        {/* Main Content */}
        <div className="space-y-8">
          {/* Scenario Selection */}
          <ScenarioSelector
            scenarios={scenarios}
            selectedScenario={selectedScenario}
            onScenarioChange={handleScenarioChange}
            disabled={isPlaying}
          />

          {/* Wave Visualization */}
          <div className="flex justify-center">
            <WaveVisualizer
              data={currentScenarioData}
              years={data.years}
              currentIndex={currentTimeIndex}
              thresholds={data.thresholds}
              scenario={selectedScenario}
              isPlaying={isPlaying}
              onProgress={(progress) => console.log('Wave progress:', progress)}
            />
          </div>

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

          {/* Control Panel */}
          <Card className="max-w-2xl mx-auto">
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="flex flex-wrap gap-4 justify-center">
                  <Button
                    onClick={() => handlePlayStateChange(!isPlaying)}
                    size="lg"
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    {isPlaying ? 'Pause' : 'Play'} Animation
                  </Button>
                  <Button
                    onClick={resetAnimation}
                    variant="outline"
                    size="lg"
                  >
                    Reset to 2020
                  </Button>
                </div>
                
                <div className="text-center text-sm text-slate-600">
                  <p>
                    <strong>Current:</strong> {data.years[currentTimeIndex]} | 
                    <strong> Sea Level:</strong> {currentScenarioData[currentTimeIndex]?.toFixed(3)}m | 
                    <strong> Scenario:</strong> {selectedScenario}°C warming
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Information Panel */}
          <Card className="max-w-4xl mx-auto">
            <CardContent className="p-6">
              <h3 className="text-xl font-semibold mb-4 text-slate-700">
                Understanding the Scenarios
              </h3>
              <div className="grid md:grid-cols-3 gap-6 text-sm">
                <div className="space-y-2">
                  <h4 className="font-semibold text-green-700">1.5°C Scenario</h4>
                  <p className="text-slate-600">
                    Paris Agreement target. Requires immediate and drastic emission reductions.
                    Represents the best-case scenario with minimal sea level rise.
                  </p>
                </div>
                <div className="space-y-2">
                  <h4 className="font-semibold text-orange-700">2.5°C Scenario</h4>
                  <p className="text-slate-600">
                    Current trajectory based on national commitments.
                    Moderate warming with significant coastal impacts.
                  </p>
                </div>
                <div className="space-y-2">
                  <h4 className="font-semibold text-red-700">5°C Scenario</h4>
                  <p className="text-slate-600">
                    High emissions pathway. Represents worst-case scenario with
                    catastrophic sea level rise and widespread displacement.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Footer Info */}
          <div className="text-center text-sm text-slate-500 py-8">
            <p>
              📊 <strong>Data Extensibility:</strong> Replace /public/data/fiji-sealevel-data.json 
              and /public/sounds/ files to visualize other Pacific nations.
            </p>
            <p className="mt-2">
              🎵 <strong>Audio:</strong> Place corresponding .mp3 files in /public/sounds/ directory 
              for full audio experience.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
