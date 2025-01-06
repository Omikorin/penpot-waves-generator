import Alpine from 'alpinejs';
import type { WaveStore } from './store';
import type { PluginUIEvent } from './types';

const sendMessage = (message: PluginUIEvent) => {
  parent.postMessage(message, '*');
};

export const downloadSVG = () => {
  const svg = (Alpine.store('wave') as WaveStore).svg;
  if (!svg) return;

  const svgClone = svg.cloneNode(true) as SVGElement;
  svgClone.setAttribute('xmlns', 'http://www.w3.org/2000/svg');

  const serializer = new XMLSerializer();
  let source = serializer.serializeToString(svgClone);
  source = `<?xml version="1.0" standalone="no"?>\r\n${source}`;

  const blob = new Blob([source], { type: 'image/svg+xml;charset=utf-8' });
  const url = URL.createObjectURL(blob);

  const timestamp = new Date().toISOString().replace(/[:]/g, '-').slice(0, -5);
  const filename = `Waves-${timestamp}.svg`;

  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();

  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

export const createPattern = () => {
  const svg = (Alpine.store('wave') as WaveStore).svg;
  if (!svg) return;

  const data = svg.outerHTML;
  sendMessage({
    type: 'create-pattern',
    content: {
      data,
      name: 'New Wave',
    },
  });
};
