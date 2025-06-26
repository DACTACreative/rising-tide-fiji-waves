
import { useEffect, useRef, useState, useCallback } from 'react';
import * as d3 from 'd3';

interface WaveVisualizerProps {
  data: number[];
  years: number[];
  currentIndex: number;
  thresholds: Array<{ value: number; label: string }>;
  scenario: string;
  isPlaying: boolean;
  onProgress?: (progress: number) => void;
}

export const WaveVisualizer = ({ 
  data, 
  years, 
  currentIndex, 
  thresholds, 
  scenario,
  isPlaying,
  onProgress 
}: WaveVisualizerProps) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [dimensions, setDimensions] = useState({ width: 600, height: 400 });

  // Responsive resize handler
  useEffect(() => {
    const handleResize = () => {
      if (svgRef.current) {
        const container = svgRef.current.parentElement;
        if (container) {
          const width = Math.min(container.clientWidth - 32, 600);
          const height = width * 0.6;
          setDimensions({ width, height });
        }
      }
    };

    window.addEventListener('resize', handleResize);
    handleResize();
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const createWavePath = useCallback((width: number, waveHeight: number, time: number = 0) => {
    const points: [number, number][] = [];
    const numPoints = 40;
    const amplitude = 4;
    const frequency = 0.015;
    
    for (let i = 0; i <= numPoints; i++) {
      const x = (i / numPoints) * width;
      const baseY = waveHeight;
      const wave1 = Math.sin((x * frequency) + (time * 0.002)) * amplitude;
      const wave2 = Math.sin((x * frequency * 1.8) + (time * 0.0015)) * amplitude * 0.3;
      const y = baseY + wave1 + wave2;
      points.push([x, y]);
    }
    
    return d3.line().curve(d3.curveBasis)(points) || '';
  }, []);

  useEffect(() => {
    if (!svgRef.current || data.length === 0) return;

    const svg = d3.select(svgRef.current);
    const { width, height } = dimensions;
    const margin = { top: 24, right: 24, bottom: 24, left: 24 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    // Clear previous content
    svg.selectAll('*').remove();

    // Set up scales
    const maxSeaLevel = Math.max(...data, ...thresholds.map(t => t.value));
    const yScale = d3.scaleLinear()
      .domain([0, maxSeaLevel * 1.1])
      .range([innerHeight, 0]);

    // Create main group
    const g = svg.append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Add gradient definitions
    const defs = svg.append('defs');
    
    const oceanGradient = defs.append('linearGradient')
      .attr('id', `ocean-gradient-${scenario}`)
      .attr('x1', '0%').attr('y1', '100%')
      .attr('x2', '0%').attr('y2', '0%');

    const currentLevel = data[currentIndex] || 0;
    const progress = Math.min(currentLevel / maxSeaLevel, 1);
    
    oceanGradient.append('stop')
      .attr('offset', '0%')
      .attr('stop-color', '#1e40af');
    
    oceanGradient.append('stop')
      .attr('offset', '100%')
      .attr('stop-color', '#3b82f6');

    // Add ocean container background
    g.append('rect')
      .attr('x', 0)
      .attr('y', 0)
      .attr('width', innerWidth)
      .attr('height', innerHeight)
      .attr('fill', '#f8fafc')
      .attr('stroke', '#e2e8f0')
      .attr('stroke-width', 1)
      .attr('rx', 12);

    // Add threshold lines (subtle)
    thresholds.forEach(threshold => {
      const y = yScale(threshold.value);
      if (y >= 0 && y <= innerHeight) {
        g.append('line')
          .attr('x1', 0)
          .attr('x2', innerWidth)
          .attr('y1', y)
          .attr('y2', y)
          .attr('stroke', '#94a3b8')
          .attr('stroke-width', 0.5)
          .attr('stroke-dasharray', '2,4')
          .attr('opacity', 0.4);

        g.append('text')
          .attr('x', innerWidth - 8)
          .attr('y', y - 4)
          .attr('text-anchor', 'end')
          .attr('font-size', '10px')
          .attr('font-weight', '400')
          .attr('fill', '#64748b')
          .text(`${threshold.value}m`);
      }
    });

    // Add ocean water
    const waveHeight = yScale(currentLevel);
    const oceanHeight = innerHeight - waveHeight;

    if (oceanHeight > 0) {
      // Ocean body
      g.append('rect')
        .attr('x', 0)
        .attr('y', waveHeight)
        .attr('width', innerWidth)
        .attr('height', oceanHeight)
        .attr('fill', `url(#ocean-gradient-${scenario})`)
        .attr('opacity', 0.9);

      // Animated wave surface
      const wavePath = g.append('path')
        .attr('fill', 'none')
        .attr('stroke', '#60a5fa')
        .attr('stroke-width', 2)
        .attr('opacity', 0.8);

      // Wave animation
      let animationId: number;
      const animateWave = (time: number) => {
        const path = createWavePath(innerWidth, waveHeight, time);
        wavePath.attr('d', path);
        
        if (isPlaying) {
          animationId = requestAnimationFrame(animateWave);
        }
      };

      if (isPlaying) {
        animateWave(Date.now());
      } else {
        wavePath.attr('d', createWavePath(innerWidth, waveHeight));
      }

      // Cleanup animation on unmount
      return () => {
        if (animationId) {
          cancelAnimationFrame(animationId);
        }
      };
    }

    // Add current sea level label (minimal)
    g.append('text')
      .attr('x', 12)
      .attr('y', 20)
      .attr('font-size', '14px')
      .attr('font-weight', '500')
      .attr('fill', '#334155')
      .text(`${currentLevel.toFixed(2)}m`);

    // Add year label
    g.append('text')
      .attr('x', 12)
      .attr('y', 36)
      .attr('font-size', '12px')
      .attr('fill', '#64748b')
      .text(`${years[currentIndex]}`);

  }, [data, years, currentIndex, thresholds, scenario, dimensions, createWavePath, isPlaying]);

  return (
    <div className="w-full max-w-2xl mx-auto">
      <svg
        ref={svgRef}
        width={dimensions.width}
        height={dimensions.height}
        className="w-full h-auto rounded-2xl shadow-sm border border-slate-200/50"
        style={{ backgroundColor: '#fdfdfd' }}
      />
    </div>
  );
};
