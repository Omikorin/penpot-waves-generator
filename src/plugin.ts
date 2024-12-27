penpot.ui.open('Waves Generator', `?theme=${penpot.theme}`, {
  width: 670,
  height: 500,
});

penpot.ui.onMessage(() => {});

// Update the theme in the iframe
penpot.on('themechange', (theme) => {
  penpot.ui.sendMessage({
    source: 'penpot',
    type: 'themechange',
    theme,
  });
});
