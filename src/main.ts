import Alpine from 'alpinejs';
import './assets/style.css';
import { initializeStore, type WaveStore } from './common/store';
import type { PluginEvent } from './common/types';
import { complexitySlider } from './components/complexity-slider';
import { curveSelector } from './components/curve-selector';
import { directionSelector } from './components/direction-selector';
import { waveActions } from './components/wave-actions';

document.addEventListener('alpine:init', () => {
  Alpine.data('curveSelector', curveSelector);
  Alpine.data('directionSelector', directionSelector);
  Alpine.data('complexitySlider', complexitySlider);
  Alpine.data('waveActions', waveActions);
});

window.Alpine = Alpine;

initializeStore();
Alpine.start();

document.addEventListener('DOMContentLoaded', () => {
  const container = document.querySelector('#wave-preview') as SVGElement;
  if (container) {
    (Alpine.store('wave') as WaveStore).setup(container);
  }
});

// theme handling
const searchParams = new URLSearchParams(window.location.search);
document.body.dataset.theme = searchParams.get('theme') ?? 'light';

// listen plugin.ts messages
window.addEventListener('message', (event: MessageEvent<PluginEvent>) => {
  if (event.data.type === 'themechange') {
    document.body.dataset.theme = event.data.content;
  }
});

declare global {
  interface Window {
    Alpine: typeof Alpine;
  }
}
