import Alpine from 'alpinejs';
import { curveBasis, curveLinear, curveStepBefore } from 'd3-shape';
import { createWavePath } from '../utils/svg';
import { generateRandomData, generateWavePath } from '../utils/wave';
import type { CurveType, DirectionType, Wave } from './types';

export interface WaveStore {
  waves: Map<string, { path: SVGPathElement; wave: Wave }>;
  complexity: number;
  currentCurve: CurveType;
  currentDirection: DirectionType;
  width: number;
  height: number;
  svg: SVGElement | null;
  curves: {
    wave: typeof curveBasis;
    step: typeof curveStepBefore;
    peak: typeof curveLinear;
  };
  setup(svg: SVGElement): void;
  addWave(wave: Wave): void;
  generateWave(id: string): void;
  updateWave(id: string, updates: Partial<Wave>): void;
  updateComplexity(value: number): void;
  updateCurve(curve: CurveType): void;
  updateDirection(direction: DirectionType): void;
  randomize(): void;
}

export const initializeStore = () => {
  Alpine.store('wave', {
    waves: new Map(),
    complexity: 10,
    currentCurve: 'wave',
    currentDirection: 'up',
    width: 500,
    height: 200,
    svg: null,

    curves: {
      wave: curveBasis,
      step: curveStepBefore,
      peak: curveLinear,
    } as const,

    setup(svg: SVGElement) {
      this.svg = svg;
      this.addWave({
        id: 'wave-1',
        data: generateRandomData(this.complexity),
        curve: 'wave',
        color: '#07bef8',
        direction: 'up',
        opacity: 1,
      });
    },

    addWave(wave: Wave) {
      if (!this.svg) throw new Error('SVG not initialized');

      const path = createWavePath(this.svg, wave);
      this.svg.appendChild(path);
      this.waves.set(wave.id, { path, wave });
      this.generateWave(wave.id);
    },

    generateWave(id: string) {
      const foundWave = this.waves.get(id);
      if (!foundWave || !this.svg) return;

      const { path, wave } = foundWave;
      const wavePath = generateWavePath(
        wave,
        this.width,
        this.height,
        this.curves,
      );

      if (wavePath) path.setAttribute('d', wavePath);
    },

    updateWave(id: string, updates: Partial<Wave>) {
      const wave = this.waves.get(id);
      if (!wave) return;
      this.waves.set(id, {
        path: wave.path,
        wave: { ...wave.wave, ...updates },
      });
      this.generateWave(id);
    },

    updateComplexity(value: number) {
      this.complexity = value;
      this.waves.forEach((_wave, id) => {
        this.updateWave(id, { data: generateRandomData(this.complexity) });
      });
    },

    updateCurve(curve: CurveType) {
      this.currentCurve = curve;
      this.waves.forEach((_wave, id) => {
        this.updateWave(id, { curve });
      });
    },

    updateDirection(direction: DirectionType) {
      this.currentDirection = direction;
      this.waves.forEach((_wave, id) => {
        this.updateWave(id, { direction });
      });
    },

    randomize() {
      this.waves.forEach((_wave, id) => {
        this.updateWave(id, { data: generateRandomData(this.complexity) });
      });
    },
  } as WaveStore);
};
