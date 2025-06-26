
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
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });

  // Responsive resize handler
  useEffect(() => {
    const handleResize = () => {
      if (svgRef.current) {
        const container = svgRef.current.parentElement;
        if (container) {
          const width = Math.min(container.clientWidth, 800);
          const height = Math.min(width * 0.75, 600);
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
    const numPoints = 50;
    const amplitude = 8;
    const frequency = 0.02;
    
    for (let i = 0; i <= numPoints; i++) {
      const x = (i / numPoints) * width;
      const baseY = waveHeight;
      const wave1 = Math.sin((x * frequency) + (time * 0.003)) * amplitude;
      const wave2 = Math.sin((x * frequency * 1.5) + (time * 0.002)) * amplitude * 0.5;
      const y = baseY + wave1 + wave2;
      points.push([x, y]);
    }
    
    return d3.line().curve(d3.curveBasis)(points) || '';
  }, []);

  useEffect(() => {
    if (!svgRef.current || data.length === 0) return;

    const svg = d3.select(svgRef.current);
    const { width, height } = dimensions;
    const margin = { top: 40, right: 60, bottom: 60, left: 60 };
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
    const progress = currentLevel / maxSeaLevel;
    
    oceanGradient.append('stop')
      .attr('offset', '0%')
      .attr('stop-color', d3.interpolateBlues(0.3 + progress * 0.4));
    
    oceanGradient.append('stop')
      .attr('offset', '100%')
      .attr('stop-color', d3.interpolateBlues(0.8 + progress * 0.2));

    // Add background ocean container
    g.append('rect')
      .attr('x', 0)
      .attr('y', 0)
      .attr('width', innerWidth)
      .attr('height', innerHeight)
      .attr('fill', '#f0f8ff')
      .attr('stroke', '#4682b4')
      .attr('stroke-width', 2)
      .attr('rx', 8);

    // Add threshold lines
    thresholds.forEach(threshold => {
      const y = yScale(threshold.value);
      if (y >= 0 && y <= innerHeight) {
        g.append('line')
          .attr('x1', 0)
          .attr('x2', innerWidth)
          .attr('y1', y)
          .attr('y2', y)
          .attr('stroke', '#ff6b6b')
          .attr('stroke-width', 1)
          .attr('stroke-dasharray', '5,5')
          .attr('opacity', 0.6);

        g.append('text')
          .attr('x', innerWidth - 5)
          .attr('y', y - 5)
          .attr('text-anchor', 'end')
          .attr('font-size', '10px')
          .attr('fill', '#ff6b6b')
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
        .attr('opacity', 0.8);

      // Animated wave surface
      const wavePath = g.append('path')
        .attr('fill', 'none')
        .attr('stroke', '#1e90ff')
        .attr('stroke-width', 3)
        .attr('opacity', 0.9);

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

    // Add current sea level label
    g.append('text')
      .attr('x', 10)
      .attr('y', 20)
      .attr('font-size', '16px')
      .attr('font-weight', 'bold')
      .attr('fill', '#2c3e50')
      .text(`Sea Level: ${currentLevel.toFixed(3)}m`);

    // Add year label
    g.append('text')
      .attr('x', 10)
      .attr('y', 40)
      .attr('font-size', '14px')
      .attr('fill', '#34495e')
      .text(`Year: ${years[currentIndex]}`);

    // Add scenario label
    g.append('text')
      .attr('x', innerWidth - 10)
      .attr('y', 20)
      .attr('text-anchor', 'end')
      .attr('font-size', '14px')
      .attr('font-weight', 'bold')
      .attr('fill', '#e74c3c')
      .text(`${scenario}°C Scenario`);

  }, [data, years, currentIndex, thresholds, scenario, dimensions, createWavePath, isPlaying]);

  return (
    <div className="w-full max-w-4xl mx-auto">
      <svg
        ref={svgRef}
        width={dimensions.width}
        height={dimensions.height}
        className="w-full h-auto border border-blue-200 rounded-lg shadow-lg bg-gradient-to-b from-sky-50 to-blue-50"
      />
    </div>
  );
};
