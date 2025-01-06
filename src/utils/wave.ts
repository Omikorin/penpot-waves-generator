import { scaleLinear } from 'd3-scale';
import { area } from 'd3-shape';
import type { WaveStore } from '../common/store';
import type { Wave } from '../common/types';

export const generateRandomData = (complexity: number): number[] => {
  // complexity affects both number of points and their randomness
  const points = Math.max(2, Math.floor(complexity / 2));
  const randomnessFactor = complexity / 50; // 0 to 1 range

  return Array.from({ length: points }, () => {
    const baseValue = Math.random() * 10;
    const noise = (Math.random() - 0.5) * randomnessFactor * 5;
    return Math.max(0, Math.min(10, baseValue + noise));
  });
};

export const generateWavePath = (
  wave: Wave,
  width: number,
  height: number,
  curves: WaveStore['curves'],
): string | null => {
  const scaleX = scaleLinear()
    .domain([0, wave.data.length - 1])
    .range([0, width]);

  const scaleY = scaleLinear().domain([0, 10]).range([0, height]);

  const areaGenerator = area<number>()
    .x((_d, i) => scaleX(i))
    .y1((d) => scaleY(d))
    .y0(wave.direction === 'up' ? height : 0)
    .curve(curves[wave.curve]);

  const d = areaGenerator(wave.data);
  if (!d) return null;

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

  return `M${roundedD}Z`;
};
