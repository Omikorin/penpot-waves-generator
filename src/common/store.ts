import Alpine from 'alpinejs';
import { area, curveBasis, curveLinear, curveStepBefore } from 'd3-shape';
import { scaleLinear } from 'd3-scale';
import type { CurveType, DirectionType, Gradient, Wave } from './types';

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
  generateRandomData(): number[];
  createGradient(id: string, colors: Gradient): SVGGradientElement;
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
        data: this.generateRandomData(),
        curve: 'wave',
        color: '#07bef8',
        direction: 'up',
        opacity: 1,
      });
    },

    generateRandomData(): number[] {
      // complexity affects both number of points and their randomness
      const points = Math.max(2, Math.floor(this.complexity / 2));
      const randomnessFactor = this.complexity / 50; // 0 to 1 range

      return Array.from({ length: points }, () => {
        const baseValue = Math.random() * 10;
        const noise = (Math.random() - 0.5) * randomnessFactor * 5;
        return Math.max(0, Math.min(10, baseValue + noise));
      });
    },

    createGradient(id: string, colors: Gradient): SVGGradientElement {
      if (!this.svg) throw new Error('SVG not initialized');

      const [color1, color2] = colors;
      const defs =
        this.svg.querySelector('defs') ||
        this.svg.insertBefore(
          document.createElementNS('http://www.w3.org/2000/svg', 'defs'),
          this.svg.firstChild,
        );

      const gradient = document.createElementNS(
        'http://www.w3.org/2000/svg',
        'linearGradient',
      );
      gradient.setAttribute('id', id);
      gradient.setAttribute('x1', '0');
      gradient.setAttribute('x2', '0');
      gradient.setAttribute('y1', '1');
      gradient.setAttribute('y2', '0');

      const stop1 = document.createElementNS(
        'http://www.w3.org/2000/svg',
        'stop',
      );
      stop1.setAttribute('offset', '0%');
      stop1.setAttribute('stop-color', color1);

      const stop2 = document.createElementNS(
        'http://www.w3.org/2000/svg',
        'stop',
      );
      stop2.setAttribute('offset', '100%');
      stop2.setAttribute('stop-color', color2);

      gradient.appendChild(stop1);
      gradient.appendChild(stop2);
      defs.appendChild(gradient);

      return gradient;
    },

    addWave(wave: Wave) {
      if (!this.svg) throw new Error('SVG not initialized');

      const path = document.createElementNS(
        'http://www.w3.org/2000/svg',
        'path',
      );

      if (typeof wave.color === 'object') {
        const gradientId = `gradient-${wave.id}`;
        this.createGradient(gradientId, wave.color);
        path.setAttribute('fill', `url(#${gradientId})`);
      } else {
        path.setAttribute('fill', wave.color);
      }

      path.setAttribute('opacity', wave.opacity.toString());
      if (wave.translateY) {
        path.setAttribute('transform', `translate(0,${wave.translateY})`);
      }

      this.svg.appendChild(path);
      this.waves.set(wave.id, { path, wave });
      this.generateWave(wave.id);
    },

    generateWave(id: string) {
      const foundWave = this.waves.get(id);
      if (!foundWave) return;

      const { path, wave } = foundWave;

      const scaleX = scaleLinear()
        .domain([0, wave.data.length - 1])
        .range([0, this.width]);

      const scaleY = scaleLinear().domain([0, 10]).range([0, this.height]);

      const areaGenerator = area<number>()
        .x((_d, i) => scaleX(i))
        .y1((d) => scaleY(d))
        .y0(wave.direction === 'up' ? this.height : 0)
        .curve(this.curves[wave.curve]);

      const d = areaGenerator(wave.data);
      if (!d) return;

      // round values for better performance
      const roundedD = d
        .split(/M|Z/)
        .filter((d) => d)[0]
        .split(',')
        .map((d) => {
          if (d.indexOf('C') !== -1) {
            return d
              .split('C')
              .map((n) => Math.round(Number.parseFloat(n) * 10) / 10)
              .join('C');
          }

          if (d.indexOf('L') !== -1) {
            return d
              .split('L')
              .map((n) => Math.round(Number.parseFloat(n) * 10) / 10)
              .join('L');
          }
          return Math.round(Number.parseFloat(d));
        })
        .join(',');

      path.setAttribute('d', `M${roundedD}Z`);
    },

    updateWave(id: string, updates: Partial<Wave>) {
      const wave = this.waves.get(id);
      if (wave) {
        this.waves.set(id, {
          path: wave.path,
          wave: { ...wave.wave, ...updates },
        });
        this.generateWave(id);
      }
    },

    updateComplexity(value: number) {
      this.complexity = value;
      this.waves.forEach((_wave, id) => {
        this.updateWave(id, { data: this.generateRandomData() });
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
        this.updateWave(id, { data: this.generateRandomData() });
      });
    },
  } as WaveStore);
};
