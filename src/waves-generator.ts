import { scaleLinear } from 'd3-scale';
import { area, curveBasis, curveLinear, curveStepBefore } from 'd3-shape';
import type { CurveType, DirectionType, Gradient, Wave } from './common/types';

export class WavesGenerator {
  private svg: SVGElement;
  private width = 500;
  private height = 200;
  private waves: Map<string, { path: SVGPathElement; wave: Wave }> = new Map();
  private complexity = 10;

  private readonly curves = {
    wave: curveBasis,
    step: curveStepBefore,
    peak: curveLinear,
  };

  constructor(container: SVGElement) {
    this.svg = container;
    this.setupEventListeners();

    this.addWave({
      id: 'wave-1',
      data: this.generateRandomData(),
      curve: 'wave',
      color: '#07bef8',
      direction: 'up',
      opacity: 1,
    });
  }

  private addWave(wave: Wave) {
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');

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
  }

  // @ts-ignore
  private removeWave(id: string) {
    const wave = this.waves.get(id);
    if (wave) {
      this.svg.removeChild(wave.path);
      this.waves.delete(id);
    }
  }

  private updateWave(id: string, updates: Partial<Wave>) {
    const wave = this.waves.get(id);
    if (wave) {
      this.waves.set(id, {
        path: wave.path,
        wave: { ...wave.wave, ...updates },
      });
      this.generateWave(id);
    }
  }

  private createGradient(id: string, colors: Gradient): SVGGradientElement {
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
  }

  private generateRandomData(): number[] {
    // complexity affects both number of points and their randomness
    const points = Math.max(2, Math.floor(this.complexity / 2));
    const randomnessFactor = this.complexity / 50; // 0 to 1 range

    return Array.from({ length: points }, () => {
      const baseValue = Math.random() * 10;
      const noise = (Math.random() - 0.5) * randomnessFactor * 5;
      return Math.max(0, Math.min(10, baseValue + noise));
    });
  }

  private generateWave(id: string) {
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

    // generate path
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
            .map((n) => Math.round(parseFloat(n) * 10) / 10)
            .join('C');
        } else if (d.indexOf('L') !== -1) {
          return d
            .split('L')
            .map((n) => Math.round(parseFloat(n) * 10) / 10)
            .join('L');
        }
        return Math.round(parseFloat(d));
      })
      .join(',');

    path.setAttribute('d', 'M' + roundedD + 'Z');
  }

  private setupEventListeners() {
    document.querySelectorAll('.wave-type').forEach((button) => {
      button.addEventListener('click', (e) => {
        const target = e.currentTarget as HTMLButtonElement;
        document
          .querySelectorAll('.wave-type')
          .forEach((b) => b.classList.remove('active'));
        target.classList.add('active');
        const curve = target.dataset.type as CurveType;
        this.waves.forEach((_wave, id) => {
          this.updateWave(id, { curve });
        });
      });
    });

    document.querySelectorAll('.direction-btn').forEach((button) => {
      button.addEventListener('click', (e) => {
        const target = e.currentTarget as HTMLButtonElement;
        document
          .querySelectorAll('.direction-btn')
          .forEach((b) => b.classList.remove('active'));
        target.classList.add('active');
        const direction = target.dataset.direction as DirectionType;
        this.waves.forEach((_wave, id) => {
          this.updateWave(id, { direction });
        });
      });
    });

    const slider = document.getElementById('complexity') as HTMLInputElement;
    slider.addEventListener('input', (e) => {
      this.complexity = parseInt((e.target as HTMLInputElement).value);
      this.waves.forEach((_wave, id) => {
        this.updateWave(id, { data: this.generateRandomData() });
      });
    });

    const randomizeButton = document.getElementById(
      'btn-randomize',
    ) as HTMLButtonElement;
    randomizeButton.addEventListener('click', () => {
      this.waves.forEach((_wave, id) => {
        this.updateWave(id, { data: this.generateRandomData() });
      });
    });

    const downloadButton = document.getElementById(
      'btn-download',
    ) as HTMLButtonElement;
    downloadButton.addEventListener('click', () => this.downloadSVG());

    const createButton = document.getElementById(
      'btn-create',
    ) as HTMLButtonElement;
    createButton.addEventListener('click', () => {
      if (!this.svg) return;
      const data = this.svg.outerHTML;
      parent.postMessage(
        {
          type: 'add-svg',
          content: {
            data,
            name: 'New Wave',
          },
        },
        '*',
      );
    });
  }

  private downloadSVG(): void {
    if (!this.svg) return;

    const svgClone = this.svg.cloneNode(true) as SVGElement;
    svgClone.setAttribute('xmlns', 'http://www.w3.org/2000/svg');

    const serializer = new XMLSerializer();
    let source = serializer.serializeToString(svgClone);
    source = '<?xml version="1.0" standalone="no"?>\r\n' + source;

    const blob = new Blob([source], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);

    const timestamp = new Date()
      .toISOString()
      .replace(/[:]/g, '-')
      .slice(0, -5);
    const filename = `Waves-${timestamp}.svg`;

    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();

    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
}
