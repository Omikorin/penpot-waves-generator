import type { DirectionType, WaveType } from './common/types';

export class WaveGenerator {
  private svg: SVGElement;
  private path: SVGPathElement;
  private width = 500;
  private height = 200;
  private direction: DirectionType = 'up';
  private amplitude: number = 20;
  private frequency: number = 50;
  private waveType: WaveType = 'wavy';

  constructor(container: SVGElement) {
    this.svg = container;
    this.path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    this.path.setAttribute('fill', '#07bef8');
    this.svg.appendChild(this.path);
    this.setupEventListeners();
    this.generateWave();
  }

  private setupEventListeners() {
    document.querySelectorAll('.wave-type').forEach((button) => {
      button.addEventListener('click', (e) => {
        const target = e.currentTarget as HTMLButtonElement;
        document
          .querySelectorAll('.wave-type')
          .forEach((b) => b.classList.remove('active'));
        target.classList.add('active');
        this.waveType = target.dataset.type as WaveType;
        this.generateWave();
      });
    });

    document.querySelectorAll('.direction-btn').forEach((button) => {
      button.addEventListener('click', (e) => {
        const target = e.currentTarget as HTMLButtonElement;
        document
          .querySelectorAll('.direction-btn')
          .forEach((b) => b.classList.remove('active'));
        target.classList.add('active');
        this.direction = target.dataset.direction as DirectionType;
        this.generateWave();
      });
    });

    const slider = document.getElementById('frequency') as HTMLInputElement;
    slider.addEventListener('input', (e) => {
      this.frequency = parseInt((e.target as HTMLInputElement).value);
      this.generateWave();
    });

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

  private generateWave() {
    const width = this.width;
    const height = this.height;
    const points: [number, number][] = [];
    const segments = Math.max(2, Math.floor(this.frequency / 10));
    const directionMultiplier = this.direction === 'up' ? 1 : -1;

    // Generate points based on wave type
    for (let i = 0; i <= width; i += width / (segments * 10)) {
      const x = i;
      let y = height / 2;

      switch (this.waveType) {
        case 'wavy':
          y =
            height / 2 +
            Math.sin((i / width) * Math.PI * segments) *
              this.amplitude *
              directionMultiplier;
          break;
        case 'rectangular':
          y =
            height / 2 +
            (Math.floor((i / width) * segments * 2) % 2 === 0
              ? -this.amplitude
              : this.amplitude) *
              directionMultiplier;
          break;
        case 'triangular':
          const phase = (i / width) * segments * 2;
          const triangularWave = Math.abs((phase % 2) - 1) * 2 - 1;
          y =
            height / 2 + triangularWave * this.amplitude * directionMultiplier;
          break;
      }
      points.push([x, y]);
    }

    let d = '';
    if (this.direction === 'up') {
      // start from bottom left, fill below the wave
      d = `M 0,${height} L ${points[0][0]},${points[0][1]} `;
      d += points
        .slice(1)
        .map(([x, y]) => `L ${x},${y}`)
        .join(' ');
      d += ` L ${width},${height} Z`;
    } else {
      // start from top left, fill above the wave
      d = `M 0,0 L ${points[0][0]},${points[0][1]} `;
      d += points
        .slice(1)
        .map(([x, y]) => `L ${x},${y}`)
        .join(' ');
      d += ` L ${width},0 Z`;
    }

    this.path.setAttribute('d', d);
  }
}
