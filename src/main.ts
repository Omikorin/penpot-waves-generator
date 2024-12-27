import { WavesGenerator } from './waves-generator';
import './style.css';

const initializeApp = () => {
  const container = document.querySelector('#wave-preview') as SVGElement;

  if (container) {
    new WavesGenerator(container);
  }
};

document.addEventListener('DOMContentLoaded', () => initializeApp());

// theme handling
const searchParams = new URLSearchParams(window.location.search);
document.body.dataset.theme = searchParams.get('theme') ?? 'light';

// listen plugin.ts messages
window.addEventListener('message', (event) => {
  if (event.data.source === 'penpot') {
    document.body.dataset.theme = event.data.theme;
  }
});
