
import { useEffect, useState } from 'react';

interface TemperatureCountdownProps {
  temperature: number;
  seaLevel: number;
  year: number;
  isVisible: boolean;
}

export const TemperatureCountdown = ({ 
  temperature, 
  seaLevel, 
  year, 
  isVisible 
}: TemperatureCountdownProps) => {
  const [displayTemp, setDisplayTemp] = useState(temperature);

  useEffect(() => {
    setDisplayTemp(temperature);
  }, [temperature]);

  if (!isVisible) return null;

  return (
    <div className="fixed top-8 right-8 z-50 bg-github-card border border-github-border rounded-lg p-6 backdrop-blur-sm">
      <div className="text-center space-y-2">
        <div className="text-4xl font-mono font-bold text-github-accent">
          +{displayTemp.toFixed(1)}°C
        </div>
        <div className="text-sm text-github-text-secondary">
          Global Warming
        </div>
        <div className="border-t border-github-border pt-2 mt-2">
          <div className="text-lg font-semibold text-github-text-primary">
            {seaLevel.toFixed(2)}m
          </div>
          <div className="text-xs text-github-text-secondary">
            Sea Level Rise • {year}
          </div>
        </div>
      </div>
    </div>
  );
};
