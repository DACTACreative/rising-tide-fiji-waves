
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';

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
  const getScenarioColor = (scenario: string) => {
    switch (scenario) {
      case '1.5': return 'from-green-400 to-blue-500';
      case '2.5': return 'from-yellow-400 to-orange-500';
      case '5': return 'from-red-400 to-purple-600';
      default: return 'from-blue-400 to-blue-600';
    }
  };

  const getScenarioDescription = (scenario: string) => {
    switch (scenario) {
      case '1.5': return 'Paris Agreement target - Limited warming';
      case '2.5': return 'Current trajectory - Moderate warming';
      case '5': return 'High emissions - Severe warming';
      default: return '';
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardContent className="p-6">
        <h3 className="text-lg font-semibold mb-4 text-center text-slate-700">
          Climate Scenarios for Fiji
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {scenarios.map((scenario) => (
            <div key={scenario} className="relative">
              <input
                type="radio"
                id={`scenario-${scenario}`}
                name="scenario"
                value={scenario}
                checked={selectedScenario === scenario}
                onChange={(e) => onScenarioChange(e.target.value)}
                disabled={disabled}
                className="sr-only peer"
              />
              <Label
                htmlFor={`scenario-${scenario}`}
                className={`
                  flex flex-col items-center p-4 rounded-lg border-2 cursor-pointer
                  transition-all duration-200 hover:scale-105
                  ${selectedScenario === scenario 
                    ? 'border-blue-500 bg-blue-50 shadow-md' 
                    : 'border-gray-200 bg-white hover:border-blue-300'
                  }
                  ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
                  peer-focus:ring-2 peer-focus:ring-blue-500
                `}
              >
                <div className={`
                  w-16 h-16 rounded-full bg-gradient-to-br ${getScenarioColor(scenario)}
                  flex items-center justify-center text-white font-bold text-xl mb-2
                  shadow-lg
                `}>
                  {scenario}°
                </div>
                <span className="font-semibold text-slate-700">
                  {scenario}°C Warmer
                </span>
                <span className="text-xs text-slate-500 text-center mt-1">
                  {getScenarioDescription(scenario)}
                </span>
              </Label>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
