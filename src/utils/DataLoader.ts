
export interface SeaLevelData {
  country: string;
  years: number[];
  scenarios: {
    [key: string]: number[];
  };
  audio: {
    [key: string]: string;
  };
  thresholds: Array<{
    value: number;
    label: string;
  }>;
}

export class DataLoader {
  private static instance: DataLoader;
  private cache: Map<string, SeaLevelData> = new Map();

  private constructor() {}

  static getInstance(): DataLoader {
    if (!DataLoader.instance) {
      DataLoader.instance = new DataLoader();
    }
    return DataLoader.instance;
  }

  async loadData(dataPath: string): Promise<SeaLevelData> {
    // Check cache first
    if (this.cache.has(dataPath)) {
      return this.cache.get(dataPath)!;
    }

    try {
      const response = await fetch(dataPath);
      if (!response.ok) {
        throw new Error(`Failed to fetch data: ${response.statusText}`);
      }

      const data: SeaLevelData = await response.json();
      
      // Validate data structure
      this.validateData(data);
      
      // Cache the data
      this.cache.set(dataPath, data);
      
      return data;
    } catch (error) {
      console.error('Error loading data:', error);
      throw new Error(`Failed to load sea level data: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private validateData(data: any): asserts data is SeaLevelData {
    if (!data || typeof data !== 'object') {
      throw new Error('Invalid data format');
    }

    if (!data.country || typeof data.country !== 'string') {
      throw new Error('Missing or invalid country field');
    }

    if (!Array.isArray(data.years) || data.years.length === 0) {
      throw new Error('Missing or invalid years array');
    }

    if (!data.scenarios || typeof data.scenarios !== 'object') {
      throw new Error('Missing or invalid scenarios object');
    }

    // Check that all scenarios have the same length as years
    Object.entries(data.scenarios).forEach(([scenario, values]) => {
      if (!Array.isArray(values) || values.length !== data.years.length) {
        throw new Error(`Scenario ${scenario} data length doesn't match years array`);
      }
    });

    if (!data.audio || typeof data.audio !== 'object') {
      throw new Error('Missing or invalid audio object');
    }

    if (!Array.isArray(data.thresholds)) {
      throw new Error('Missing or invalid thresholds array');
    }
  }

  // Helper method to get available scenarios
  getScenarios(data: SeaLevelData): string[] {
    return Object.keys(data.scenarios).sort((a, b) => parseFloat(a) - parseFloat(b));
  }

  // Helper method to interpolate data for smoother animations
  interpolateData(data: number[], steps: number = 2): number[] {
    if (data.length < 2) return data;

    const interpolated: number[] = [];
    
    for (let i = 0; i < data.length - 1; i++) {
      interpolated.push(data[i]);
      
      const start = data[i];
      const end = data[i + 1];
      const diff = end - start;
      
      for (let step = 1; step < steps; step++) {
        const t = step / steps;
        interpolated.push(start + diff * t);
      }
    }
    
    interpolated.push(data[data.length - 1]);
    return interpolated;
  }

  // Clear cache if needed
  clearCache(): void {
    this.cache.clear();
  }
}

export default DataLoader;
