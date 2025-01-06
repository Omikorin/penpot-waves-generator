import type { Gradient, Wave } from '../common/types';

export const createGradient = (
  svg: SVGElement,
  id: string,
  colors: Gradient,
): SVGGradientElement => {
  const [color1, color2] = colors;
  const defs =
    svg.querySelector('defs') ||
    svg.insertBefore(
      document.createElementNS('http://www.w3.org/2000/svg', 'defs'),
      svg.firstChild,
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

  const stop1 = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
  stop1.setAttribute('offset', '0%');
  stop1.setAttribute('stop-color', color1);

  const stop2 = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
  stop2.setAttribute('offset', '100%');
  stop2.setAttribute('stop-color', color2);

  gradient.appendChild(stop1);
  gradient.appendChild(stop2);
  defs.appendChild(gradient);

  return gradient;
};

export const createWavePath = (svg: SVGElement, wave: Wave): SVGPathElement => {
  const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');

  if (typeof wave.color === 'object') {
    const gradientId = `gradient-${wave.id}`;
    createGradient(svg, gradientId, wave.color);
    path.setAttribute('fill', `url(#${gradientId})`);
  } else {
    path.setAttribute('fill', wave.color);
  }

  path.setAttribute('opacity', wave.opacity.toString());
  if (wave.translateY) {
    path.setAttribute('transform', `translate(0,${wave.translateY})`);
  }

  return path;
};
