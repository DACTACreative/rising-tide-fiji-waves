
import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface CountryData {
  country: string;
  city: string;
  years: number[];
  scenarios: {
    [key: string]: number[];
  };
  audio: {
    [key: string]: string;
  };
}

const SolomonIslands = () => {
  const [data, setData] = useState<CountryData | null>(null);
  const [selectedScenario, setSelectedScenario] = useState('1.5');
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentAudio, setCurrentAudio] = useState<HTMLAudioElement | null>(null);

  useEffect(() => {
    // Load Solomon Islands data
    fetch('/data/solomon-islands-data.json')
      .then(response => response.json())
      .then(data => setData(data))
      .catch(error => console.error('Error loading data:', error));
  }, []);

  const playAudio = (scenario: string) => {
    if (!data) return;
    
    // Stop current audio if playing
    if (currentAudio) {
      currentAudio.pause();
      currentAudio.currentTime = 0;
    }

    const audio = new Audio(data.audio[scenario]);
    setCurrentAudio(audio);
    setIsPlaying(true);
    
    audio.play().catch(error => {
      console.error('Error playing audio:', error);
      setIsPlaying(false);
    });

    audio.onended = () => {
      setIsPlaying(false);
    };
  };

  const stopAudio = () => {
    if (currentAudio) {
      currentAudio.pause();
      currentAudio.currentTime = 0;
      setIsPlaying(false);
    }
  };

  if (!data) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-white">Loading Solomon Islands data...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-2">{data.country}</h1>
          <p className="text-xl text-slate-300">{data.city}</p>
          <p className="text-slate-400 mt-2">Sea Level Rise Visualization</p>
        </div>

        {/* Scenario Selection */}
        <div className="flex justify-center gap-4 mb-8">
          {Object.keys(data.scenarios).map((scenario) => (
            <Button
              key={scenario}
              onClick={() => setSelectedScenario(scenario)}
              variant={selectedScenario === scenario ? "default" : "outline"}
              className={`px-6 py-3 ${
                selectedScenario === scenario 
                  ? 'bg-blue-600 hover:bg-blue-700' 
                  : 'border-slate-600 text-slate-300 hover:bg-slate-800'
              }`}
            >
              +{scenario}°C
            </Button>
          ))}
        </div>

        {/* Audio Controls */}
        <Card className="bg-slate-800 border-slate-700 mb-8">
          <CardContent className="p-6">
            <div className="text-center">
              <h3 className="text-lg font-semibold mb-4">
                Audio Narrative - {selectedScenario}°C Scenario
              </h3>
              <div className="flex justify-center gap-4">
                <Button
                  onClick={() => playAudio(selectedScenario)}
                  disabled={isPlaying}
                  className="bg-green-600 hover:bg-green-700"
                >
                  {isPlaying ? 'Playing...' : 'Play Audio'}
                </Button>
                <Button
                  onClick={stopAudio}
                  disabled={!isPlaying}
                  variant="outline"
                  className="border-slate-600 text-slate-300 hover:bg-slate-800"
                >
                  Stop
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Simple Data Display */}
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold mb-4">
              Sea Level Data - {selectedScenario}°C Scenario
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {data.years.map((year, index) => (
                <div key={year} className="text-center p-3 bg-slate-700 rounded">
                  <div className="text-sm text-slate-400">{year}</div>
                  <div className="text-lg font-bold text-blue-400">
                    {data.scenarios[selectedScenario][index]}m
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SolomonIslands;
