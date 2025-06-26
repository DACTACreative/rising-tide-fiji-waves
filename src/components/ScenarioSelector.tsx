
import { Card, CardContent } from '@/components/ui/card';

interface ScenarioSelectorProps {
  scenarios: string[];
  selectedScenario: string;
  onScenarioChange: (scenario: string) => void;
  disabled?: boolean;
}

export const ScenarioSelector = ({ 
  scenarios, 
  selectedScenario, 
  onScenarioChange,
  disabled = false 
}: ScenarioSelectorProps) => {
  const getScenarioStyle = (scenario: string, isSelected: boolean) => {
    if (isSelected) {
      switch (scenario) {
        case '1.5': return 'bg-green-400 text-black border-green-500 shadow-lg shadow-green-400/30';
        case '2.5': return 'bg-yellow-300 text-black border-yellow-400 shadow-lg shadow-yellow-300/30';
        case '5': return 'bg-red-300 text-black border-red-400 shadow-lg shadow-red-300/30';
        default: return 'bg-gray-300 text-black border-gray-400';
      }
    } else {
      switch (scenario) {
        case '1.5': return 'bg-green-100/20 text-green-400 border-green-400/30 hover:bg-green-100/30';
        case '2.5': return 'bg-yellow-100/20 text-yellow-400 border-yellow-400/30 hover:bg-yellow-100/30';
        case '5': return 'bg-red-100/20 text-red-400 border-red-400/30 hover:bg-red-100/30';
        default: return 'bg-gray-100/20 text-gray-400 border-gray-400/30';
      }
    }
  };

  return (
    <div className="flex gap-3 p-1 bg-github-card/50 rounded-full border border-github-border/50 backdrop-blur-sm">
      {scenarios.map((scenario) => (
        <button
          key={scenario}
          onClick={() => onScenarioChange(scenario)}
          disabled={disabled}
          className={`
            px-6 py-3 rounded-full border transition-all duration-300
            font-semibold text-sm tracking-wide min-w-[80px]
            ${getScenarioStyle(scenario, selectedScenario === scenario)}
            ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:scale-105'}
            focus:outline-none focus:ring-2 focus:ring-white/20
            transform active:scale-95
          `}
        >
          +{scenario}°C
        </button>
      ))}
    </div>
  );
};
