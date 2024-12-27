import type { PluginEvent } from './common/types';

penpot.ui.open('Waves Generator', `?theme=${penpot.theme}`, {
  width: 670,
  height: 500,
});

penpot.ui.onMessage<PluginEvent>((message) => {
  if (message.type === 'add-svg') {
    const { data, name } = message.content;

    if (!data || !name) return;

    const group = penpot.createShapeFromSvg(data);
    if (group) group.name = name;
  }
});

// Update the theme in the iframe
penpot.on('themechange', (theme) => {
  penpot.ui.sendMessage({
    source: 'penpot',
    type: 'themechange',
    theme,
  });
});
