
import { useEffect, useRef } from 'react';

interface ScrollTimelineProps {
  years: number[];
  currentIndex: number;
  onTimelineChange: (index: number) => void;
  disabled?: boolean;
}

export const ScrollTimeline = ({ 
  years, 
  currentIndex, 
  onTimelineChange, 
  disabled = false 
}: ScrollTimelineProps) => {
  const timelineRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (timelineRef.current && !disabled) {
      const activeElement = timelineRef.current.children[currentIndex] as HTMLElement;
      if (activeElement) {
        activeElement.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'nearest',
          inline: 'center' 
        });
      }
    }
  }, [currentIndex, disabled]);

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="mb-4 text-center">
        <h3 className="text-sm font-medium text-github-text-secondary">
          Timeline Navigation
        </h3>
      </div>
      
      <div 
        ref={timelineRef}
        className="flex gap-1 overflow-x-auto scrollbar-hide py-2 px-4 bg-github-card border border-github-border rounded-lg"
      >
        {years.map((year, index) => (
          <button
            key={year}
            onClick={() => !disabled && onTimelineChange(index)}
            disabled={disabled}
            className={`
              flex-shrink-0 px-3 py-2 text-xs font-mono rounded transition-all duration-200
              ${currentIndex === index 
                ? 'bg-github-accent text-white' 
                : 'text-github-text-secondary hover:text-github-text-primary hover:bg-github-hover'
              }
              ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
            `}
          >
            {year}
          </button>
        ))}
      </div>
      
      <div className="mt-2 text-center text-xs text-github-text-secondary">
        Year {years[currentIndex]} • {currentIndex + 1} of {years.length}
      </div>
    </div>
  );
};
