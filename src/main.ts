import './style.css';

const initializeApp = () => {
  console.log('app initialized');
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
