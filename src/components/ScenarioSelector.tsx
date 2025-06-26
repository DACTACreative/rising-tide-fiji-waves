
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
  const getScenarioColor = (scenario: string) => {
    switch (scenario) {
      case '1.5': return 'bg-emerald-50 border-emerald-200 text-emerald-800';
      case '2.5': return 'bg-amber-50 border-amber-200 text-amber-800';
      case '5': return 'bg-red-50 border-red-200 text-red-800';
      default: return 'bg-slate-50 border-slate-200 text-slate-800';
    }
  };

  const getSelectedColor = (scenario: string) => {
    switch (scenario) {
      case '1.5': return 'bg-emerald-100 border-emerald-400 shadow-emerald-200/50';
      case '2.5': return 'bg-amber-100 border-amber-400 shadow-amber-200/50';
      case '5': return 'bg-red-100 border-red-400 shadow-red-200/50';
      default: return 'bg-slate-100 border-slate-400 shadow-slate-200/50';
    }
  };

  return (
    <Card className="border-0 shadow-none bg-transparent max-w-md mx-auto">
      <CardContent className="p-0">
        <div className="flex gap-2">
          {scenarios.map((scenario) => (
            <button
              key={scenario}
              onClick={() => onScenarioChange(scenario)}
              disabled={disabled}
              className={`
                flex-1 px-4 py-3 rounded-full border-2 transition-all duration-300
                font-medium text-sm tracking-wide
                ${selectedScenario === scenario 
                  ? getSelectedColor(scenario) + ' shadow-lg' 
                  : getScenarioColor(scenario) + ' hover:shadow-md'
                }
                ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                focus:outline-none focus:ring-2 focus:ring-blue-500/20
              `}
            >
              +{scenario}°C
            </button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
